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

app.post('/api/v1/agent/report', { preHandler: agentAuth }, async (req) => {
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
app.get('/api/v1/hosts/:id', async req => { const [[h]] = await db.execute('SELECT h.*,a.agent_id,a.agent_version,a.os_name,a.os_release,a.ip_address agent_ip,a.last_seen agent_last_seen FROM hosts h LEFT JOIN agents a ON a.id=h.agent_id WHERE h.id=? LIMIT 1',[req.params.id]); if(!h)return {error:'not_found'}; const [items]=await db.execute('SELECT id,item_key,item_type,enabled,interval_sec,config FROM monitor_items WHERE host_id=? ORDER BY id',[req.params.id]); const [alerts]=await db.execute('SELECT * FROM alerts WHERE host_id=? ORDER BY created_at DESC LIMIT 100',[req.params.id]); return {host:h,items,alerts}; });
app.get('/api/v1/hosts/:id/metrics', async req => { const limit=Math.min(5000,Math.max(1,Number(req.query?.limit||1000))); const [r] = await db.execute(`SELECT metric_key,metric_value,recorded_at FROM metrics WHERE host_id=? ORDER BY recorded_at DESC LIMIT ${limit}`, [req.params.id]); return r; });
app.get('/api/v1/hosts/:id/checks', async req => { const [r] = await db.execute('SELECT check_type,target,ok,response_ms,status_code,error_message,checked_at FROM check_results WHERE host_id=? ORDER BY checked_at DESC LIMIT 500', [req.params.id]); return r; });
app.get('/api/v1/alerts', async () => { const [r] = await db.query('SELECT al.*,h.name host_name FROM alerts al JOIN hosts h ON h.id=al.host_id ORDER BY al.created_at DESC LIMIT 500'); return r; });
app.post('/api/v1/alerts/:id/ack', async req => { await db.execute('UPDATE alerts SET status="ACKNOWLEDGED",acknowledged_at=NOW() WHERE id=? AND status="OPEN"', [req.params.id]); await db.execute('INSERT INTO alert_events(alert_id,event_type,message) VALUES(?,?,?)', [req.params.id, 'ACKNOWLEDGED', 'Acknowledged by operator']); return { success: true }; });
app.get('/api/v1/agents', async () => { const [r] = await db.query('SELECT id,agent_id,enabled,hostname,ip_address,os_name,os_release,agent_version,last_seen,created_at FROM agents ORDER BY agent_id'); return r; });

app.post('/api/v1/hosts/:id/items', async req => {
  const b=req.body||{}; const type=String(b.item_type||'metric').toLowerCase(); const key=String(b.item_key||'').trim();
  if(!key)return {error:'item_key_required'};
  const interval=Math.min(86400,Math.max(5,Number(b.interval_sec||60)));
  const config=JSON.stringify(b.config||{});
  const [r]=await db.execute('INSERT INTO monitor_items(host_id,item_key,item_type,enabled,interval_sec,config) VALUES(?,?,?,?,?,?)',[req.params.id,key,type,b.enabled===false?0:1,interval,config]);
  return {success:true,id:r.insertId};
});
app.put('/api/v1/items/:id', async req => { const b=req.body||{}; await db.execute('UPDATE monitor_items SET item_key=?,item_type=?,enabled=?,interval_sec=?,config=? WHERE id=?',[String(b.item_key||'').trim(),String(b.item_type||'metric').toLowerCase(),b.enabled===false?0:1,Math.min(86400,Math.max(5,Number(b.interval_sec||60))),JSON.stringify(b.config||{}),req.params.id]); return {success:true}; });
app.delete('/api/v1/items/:id', async req => { await db.execute('DELETE FROM monitor_items WHERE id=?',[req.params.id]); return {success:true}; });

// Alert rule management.
app.get('/api/v1/alert-rules', async () => { const [r]=await db.query('SELECT * FROM alert_rules ORDER BY id DESC'); return r; });
app.post('/api/v1/alert-rules', async req => { const b=req.body||{}; const name=String(b.name||'').trim(); const key=String(b.metric_key||'').trim(); const op=String(b.operator||'>'); const severity=String(b.severity||'WARNING').toUpperCase(); const threshold=Number(b.threshold); const duration=Math.max(0,Number(b.duration_sec||0)); if(!name||!key||!['>','>=','<','<=','=','!='].includes(op)||!['INFO','WARNING','HIGH','CRITICAL'].includes(severity)||!Number.isFinite(threshold))return {error:'invalid_rule'}; const [r]=await db.execute('INSERT INTO alert_rules(name,metric_key,operator,threshold,severity,duration_sec,enabled) VALUES(?,?,?,?,?,?,?)',[name,key,op,threshold,severity,duration,b.enabled===false?0:1]); return {success:true,id:r.insertId}; });
app.put('/api/v1/alert-rules/:id', async req => { const b=req.body||{}; const name=String(b.name||'').trim(); const key=String(b.metric_key||'').trim(); const op=String(b.operator||'>'); const severity=String(b.severity||'WARNING').toUpperCase(); const threshold=Number(b.threshold); const duration=Math.max(0,Number(b.duration_sec||0)); if(!name||!key||!['>','>=','<','<=','=','!='].includes(op)||!['INFO','WARNING','HIGH','CRITICAL'].includes(severity)||!Number.isFinite(threshold))return {error:'invalid_rule'}; await db.execute('UPDATE alert_rules SET name=?,metric_key=?,operator=?,threshold=?,severity=?,duration_sec=?,enabled=? WHERE id=?',[name,key,op,threshold,severity,duration,b.enabled===false?0:1,req.params.id]); return {success:true}; });
app.delete('/api/v1/alert-rules/:id', async req => { await db.execute('DELETE FROM alert_rules WHERE id=?',[req.params.id]); return {success:true}; });

// Notification channels.
app.get('/api/v1/notification-channels', async () => { const [r]=await db.query('SELECT id,name,type,enabled,config FROM notification_channels ORDER BY name'); return r.map(x=>({...x,config:parseJson(x.config)||{}})); });
app.post('/api/v1/notification-channels', async req => { const b=req.body||{}; const type=String(b.type||'').toUpperCase(); if(!b.name||!['TELEGRAM','EMAIL','WEBHOOK'].includes(type))return {error:'valid_name_and_type_required'}; const [r]=await db.execute('INSERT INTO notification_channels(name,type,config,enabled) VALUES(?,?,?,?)',[String(b.name),type,JSON.stringify(b.config||{}),b.enabled===false?0:1]); return {success:true,id:r.insertId}; });
app.put('/api/v1/notification-channels/:id', async req => { const b=req.body||{}; const type=String(b.type||'').toUpperCase(); if(!b.name||!['TELEGRAM','EMAIL','WEBHOOK'].includes(type))return {error:'valid_name_and_type_required'}; await db.execute('UPDATE notification_channels SET name=?,type=?,config=?,enabled=? WHERE id=?',[String(b.name),type,JSON.stringify(b.config||{}),b.enabled===false?0:1,req.params.id]); return {success:true}; });
app.delete('/api/v1/notification-channels/:id', async req => { await db.execute('DELETE FROM notification_channels WHERE id=?',[req.params.id]); return {success:true}; });
app.post('/api/v1/notification-channels/:id/test', async req => { const [[c]]=await db.execute('SELECT * FROM notification_channels WHERE id=? LIMIT 1',[req.params.id]); if(!c)return {error:'not_found'}; const cfg=parseJson(c.config)||{}; const message=String(req.body?.message||'Monitoring test notification'); try { if(c.type==='WEBHOOK'){ const r=await fetch(cfg.url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:'TEST',message})}); if(!r.ok)throw new Error(`HTTP ${r.status}`); } else if(c.type==='TELEGRAM'){ if(!cfg.botToken||!cfg.chatId)throw new Error('botToken/chatId required'); const r=await fetch(`https://api.telegram.org/bot${cfg.botToken}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:cfg.chatId,text:message})}); if(!r.ok)throw new Error(`HTTP ${r.status}`); } else { return {success:false,error:'SMTP test requires notification worker configuration'}; } return {success:true}; } catch(e) { return {success:false,error:String(e.message||e)}; } });

// Infrastructure administration: maintenance windows and host dependencies.
app.get('/api/v1/maintenance', async () => { const [r]=await db.query('SELECT m.*,h.name host_name FROM maintenance_windows m LEFT JOIN hosts h ON h.id=m.host_id ORDER BY m.starts_at DESC'); return r; });
app.post('/api/v1/maintenance', async req => { const b=req.body||{}; if(!b.name||!b.starts_at||!b.ends_at)return {error:'name_starts_at_ends_at_required'}; if(new Date(b.ends_at)<=new Date(b.starts_at))return {error:'invalid_time_range'}; const [r]=await db.execute('INSERT INTO maintenance_windows(host_id,name,starts_at,ends_at,enabled) VALUES(?,?,?,?,?)',[b.host_id||null,String(b.name),new Date(b.starts_at),new Date(b.ends_at),b.enabled===false?0:1]); return {success:true,id:r.insertId}; });
app.put('/api/v1/maintenance/:id', async req => { const b=req.body||{}; if(!b.name||!b.starts_at||!b.ends_at)return {error:'name_starts_at_ends_at_required'}; if(new Date(b.ends_at)<=new Date(b.starts_at))return {error:'invalid_time_range'}; await db.execute('UPDATE maintenance_windows SET host_id=?,name=?,starts_at=?,ends_at=?,enabled=? WHERE id=?',[b.host_id||null,String(b.name),new Date(b.starts_at),new Date(b.ends_at),b.enabled===false?0:1,req.params.id]); return {success:true}; });
app.delete('/api/v1/maintenance/:id', async req => { await db.execute('DELETE FROM maintenance_windows WHERE id=?',[req.params.id]); return {success:true}; });
app.get('/api/v1/dependencies', async () => { const [r]=await db.query('SELECT d.*,p.name parent_name,c.name child_name FROM dependencies d JOIN hosts p ON p.id=d.parent_host_id JOIN hosts c ON c.id=d.child_host_id ORDER BY p.name,c.name'); return r; });
app.post('/api/v1/dependencies', async req => { const p=Number(req.body?.parent_host_id), c=Number(req.body?.child_host_id); if(!p||!c||p===c)return {error:'valid_distinct_hosts_required'}; try { const [r]=await db.execute('INSERT INTO dependencies(parent_host_id,child_host_id,enabled) VALUES(?,?,1)',[p,c]); return {success:true,id:r.insertId}; } catch(e) { if(e.code==='ER_DUP_ENTRY')return {error:'dependency_exists'}; throw e; } });
app.delete('/api/v1/dependencies/:id', async req => { await db.execute('DELETE FROM dependencies WHERE id=?',[req.params.id]); return {success:true}; });

// Discovery helper: creates standard items idempotently from an Agent report.
app.post('/api/v1/hosts/:id/discovery/apply', async req => {
  const hostId=Number(req.params.id); const d=req.body||{}; const created=[];
  const add=async(key,type,config,interval=60)=>{const [r]=await db.execute('INSERT IGNORE INTO monitor_items(host_id,item_key,item_type,enabled,interval_sec,config) VALUES(?,?,?,?,?,?)',[hostId,key,type,1,interval,JSON.stringify(config)]); if(r.affectedRows)created.push({id:r.insertId,item_key:key,item_type:type});};
  for(const disk of d.disks||[]) if(disk.mount) await add(`disk.used[${disk.mount}]`,'metric',{});
  for(const nic of d.network||[]) if(nic.name) await add(`net.io[${nic.name}]`,'metric',{});
  for(const service of d.services||[]) if(service.name) await add(`service.state[${service.name}]`,'service',{service:service.name});
  return {success:true,created};
});

app.setErrorHandler((e, req, reply) => { req.log.error(e); reply.code(500).send({ error: 'internal_error' }); });
app.listen({ port: Number(process.env.PORT || 3000), host: process.env.HOST || '0.0.0.0' }).catch(e => { app.log.error(e); process.exit(1); });