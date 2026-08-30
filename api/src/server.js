import Fastify from 'fastify';
import mysql from 'mysql2/promise';
import crypto from 'node:crypto';
import { evaluateAlerts, resolveRecovered } from './services/alert-engine.js';

const app = Fastify({ logger: true, bodyLimit: 2 * 1024 * 1024 });
const db = mysql.createPool({ host: process.env.DB_HOST || 'mysql', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'monitor', password: process.env.DB_PASSWORD || 'monitor', database: process.env.DB_NAME || 'monitoring', connectionLimit: 20, waitForConnections: true });
const sha = x => crypto.createHash('sha256').update(x || '').digest('hex');
const parseJson = x => { try { return typeof x === 'string' ? JSON.parse(x) : x; } catch { return null; } };

async function agentAuth(req, reply) {
  const value = req.headers.authorization || '';
  const token = value.startsWith('Bearer ') ? value.slice(7) : '';
  if (!token) return reply.code(401).send({ error: 'unauthorized' });
  const [rows] = await db.execute('SELECT id,agent_id,enabled FROM agents WHERE token_hash=? LIMIT 1', [sha(token)]);
  if (!rows.length || !rows[0].enabled) return reply.code(401).send({ error: 'invalid agent token' });
  req.agent = rows[0];
}

app.get('/health', async () => ({ ok: true, time: new Date().toISOString() }));

app.post('/api/v1/agent/report', { preHandler: agentAuth }, async (req, reply) => {
  const b = req.body || {}; const a = req.agent; const now = new Date(b.timestamp || Date.now());
  await db.execute('UPDATE agents SET hostname=?,ip_address=?,os_name=?,os_release=?,agent_version=?,last_seen=NOW() WHERE id=?', [b.system?.hostname || null, b.system?.ip_lan?.[0] || null, b.system?.os || null, b.system?.os_release || null, b.agent_version || null, a.id]);
  const [h] = await db.execute('SELECT id FROM hosts WHERE agent_id=? LIMIT 1', [a.id]);
  let hid = h[0]?.id;
  if (!hid) { const [r] = await db.execute('INSERT INTO hosts(agent_id,name,hostname,status,last_seen) VALUES(?,?,?,"ONLINE",NOW())', [a.id, b.system?.hostname || a.agent_id, b.system?.hostname || a.agent_id]); hid = r.insertId; }
  else await db.execute('UPDATE hosts SET status="ONLINE",last_seen=NOW(),hostname=? WHERE id=?', [b.system?.hostname || null, hid]);
  const rows = (b.metrics || []).map(m => [hid, m.key, JSON.stringify(m.value), now]);
  for (const d of b.disks || []) rows.push([hid, `disk.used[${d.mount}]`, JSON.stringify(d.use_percent), now]);
  if (rows.length) await db.query('INSERT INTO metrics(host_id,metric_key,metric_value,recorded_at) VALUES ?', [rows]);
  for (const c of b.checks || []) await db.execute('INSERT INTO check_results(host_id,check_type,target,ok,response_ms,status_code,error_message,checked_at) VALUES(?,?,?,?,?,?,?,?)', [hid, c.type, c.target, c.ok ? 1 : 0, c.ms || null, c.status || null, c.error || null, now]);
  await evaluateAlerts(db, hid, b.metrics || []);
  await resolveRecovered(db, hid, b.metrics || []);
  return { success: true, host_id: hid, server_time: new Date().toISOString() };
});

app.get('/api/v1/agent/config', { preHandler: agentAuth }, async req => {
  const [items] = await db.execute('SELECT i.item_key,i.item_type,i.interval_sec,i.config FROM monitor_items i JOIN hosts h ON h.id=i.host_id WHERE h.agent_id=? AND i.enabled=1 ORDER BY i.id', [req.agent.id]);
  const config = { discovery: true, ping: [], tcp: [], http: [], dns: [], ssl: [] };
  for (const item of items) {
    const c = parseJson(item.config) || {};
    if (item.item_type === 'ping') config.ping.push({ host: c.host, timeout: c.timeout });
    else if (item.item_type === 'tcp') config.tcp.push({ host: c.host, port: c.port, timeout: c.timeout });
    else if (item.item_type === 'http' || item.item_type === 'https') config.http.push({ url: c.url, timeout: c.timeout, expectedStatus: c.expectedStatus });
    else if (item.item_type === 'dns') config.dns.push({ name: c.name, record: c.record, timeout: c.timeout });
    else if (item.item_type === 'ssl') config.ssl.push({ host: c.host, port: c.port, timeout: c.timeout });
  }
  return { config, version: 1 };
});

app.get('/api/v1/dashboard/summary', async () => {
  const [[h]] = await db.query('SELECT COUNT(*) total,SUM(status="ONLINE") online,SUM(status="WARNING") warning,SUM(status="CRITICAL") critical,SUM(status="OFFLINE") offline FROM hosts');
  const [[a]] = await db.query('SELECT COUNT(*) open_alerts FROM alerts WHERE status IN ("OPEN","ACKNOWLEDGED")');
  return { hosts: h, alerts: a };
});
app.get('/api/v1/hosts', async () => { const [r] = await db.query('SELECT h.*,a.agent_id,a.last_seen agent_last_seen FROM hosts h LEFT JOIN agents a ON a.id=h.agent_id ORDER BY h.name'); return r; });
app.get('/api/v1/hosts/:id/metrics', async req => { const [r] = await db.execute('SELECT metric_key,metric_value,recorded_at FROM metrics WHERE host_id=? ORDER BY recorded_at DESC LIMIT 1000', [req.params.id]); return r; });
app.get('/api/v1/hosts/:id/checks', async req => { const [r] = await db.execute('SELECT check_type,target,ok,response_ms,status_code,error_message,checked_at FROM check_results WHERE host_id=? ORDER BY checked_at DESC LIMIT 500', [req.params.id]); return r; });
app.get('/api/v1/alerts', async () => { const [r] = await db.query('SELECT al.*,h.name host_name FROM alerts al JOIN hosts h ON h.id=al.host_id ORDER BY al.created_at DESC LIMIT 500'); return r; });
app.post('/api/v1/alerts/:id/ack', async req => { await db.execute('UPDATE alerts SET status="ACKNOWLEDGED",acknowledged_at=NOW() WHERE id=? AND status="OPEN"', [req.params.id]); await db.execute('INSERT INTO alert_events(alert_id,event_type,message) VALUES(?,?,?)', [req.params.id, 'ACKNOWLEDGED', 'Acknowledged by operator']); return { success: true }; });
app.get('/api/v1/agents', async () => { const [r] = await db.query('SELECT id,agent_id,enabled,hostname,ip_address,os_name,os_release,agent_version,last_seen,created_at FROM agents ORDER BY agent_id'); return r; });
app.setErrorHandler((e, req, reply) => { req.log.error(e); reply.code(500).send({ error: 'internal_error' }); });
app.listen({ port: Number(process.env.PORT || 3000), host: process.env.HOST || '0.0.0.0' }).catch(e => { app.log.error(e); process.exit(1); });
