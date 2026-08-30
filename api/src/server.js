import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import mysql from 'mysql2/promise';
import crypto from 'node:crypto';

const app = Fastify({ logger: true });
await app.register(helmet);
await app.register(cors, { origin: true });
await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'monitor',
  password: process.env.MYSQL_PASSWORD || 'change-me',
  database: process.env.MYSQL_DATABASE || 'monitoring',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

function timingSafeEqualHex(a, b) {
  const aa = Buffer.from(a || '', 'hex');
  const bb = Buffer.from(b || '', 'hex');
  return aa.length === bb.length && aa.length > 0 && crypto.timingSafeEqual(aa, bb);
}

async function authenticateAgent(request, reply) {
  const agentId = request.headers['x-agent-id'];
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!agentId || !token) return reply.code(401).send({ success: false, error: 'Missing agent credentials' });
  const [rows] = await pool.execute('SELECT id, agent_token, status FROM agents WHERE agent_id = ? LIMIT 1', [agentId]);
  const agent = rows[0];
  if (!agent || agent.status !== 'active' || !timingSafeEqualHex(crypto.createHash('sha256').update(token).digest('hex'), agent.agent_token)) {
    return reply.code(401).send({ success: false, error: 'Invalid agent credentials' });
  }
  request.agent = agent;
}

app.get('/api/v1/health', async () => ({ success: true, service: 'monitoring-api', time: new Date().toISOString() }));

app.post('/api/v1/agent/heartbeat', { preHandler: authenticateAgent }, async (request) => {
  const { hostname, ip, os, version } = request.body || {};
  await pool.execute(
    `UPDATE agents SET last_seen = NOW(), hostname = COALESCE(?, hostname), ip_address = COALESCE(?, ip_address), os_name = COALESCE(?, os_name), agent_version = COALESCE(?, agent_version) WHERE id = ?`,
    [hostname ?? null, ip ?? null, os ?? null, version ?? null, request.agent.id]
  );
  return { success: true, server_time: new Date().toISOString() };
});

app.post('/api/v1/agent/metrics', { preHandler: authenticateAgent }, async (request, reply) => {
  const body = request.body || {};
  if (!Array.isArray(body.metrics)) return reply.code(400).send({ success: false, error: 'metrics must be an array' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const metric of body.metrics.slice(0, 1000)) {
      if (!metric.key || typeof metric.value !== 'number') continue;
      await connection.execute(
        `INSERT INTO metrics (agent_id, metric_key, metric_value, label_json, recorded_at) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))`,
        [request.agent.id, String(metric.key).slice(0, 191), metric.value, JSON.stringify(metric.labels || {}), Number(body.timestamp || Math.floor(Date.now() / 1000))]
      );
    }
    await connection.execute('UPDATE agents SET last_seen = NOW() WHERE id = ?', [request.agent.id]);
    await connection.commit();
    return { success: true, accepted: body.metrics.length, server_time: new Date().toISOString() };
  } catch (error) {
    await connection.rollback();
    request.log.error(error);
    return reply.code(500).send({ success: false, error: 'Metric ingestion failed' });
  } finally {
    connection.release();
  }
});

app.get('/api/v1/agent/config', { preHandler: authenticateAgent }, async (request) => {
  const [rows] = await pool.execute(`SELECT config_json FROM agent_configs WHERE agent_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1`, [request.agent.id]);
  const config = rows[0] ? JSON.parse(rows[0].config_json) : { interval_seconds: 60, checks: { cpu: true, ram: true, disk: true, network: true, os: true, hostname: true, lan_ip: true, uptime: true } };
  return { success: true, config, server_time: new Date().toISOString() };
});

app.get('/api/v1/dashboard/summary', async () => {
  const [hosts] = await pool.execute(`SELECT COUNT(*) total, SUM(last_seen >= NOW() - INTERVAL 2 MINUTE) online FROM agents`);
  const [alerts] = await pool.execute(`SELECT severity, COUNT(*) count FROM alerts WHERE status IN ('open','acknowledged') GROUP BY severity`);
  return { success: true, hosts: hosts[0], alerts };
});

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.code(error.statusCode || 500).send({ success: false, error: 'Internal server error' });
});

const port = Number(process.env.PORT || 8080);
await app.listen({ port, host: '0.0.0.0' });
