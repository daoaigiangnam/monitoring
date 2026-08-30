import mysql from 'mysql2/promise';
import { notify } from '../services/notifier.js';

const db = mysql.createPool({
  host: process.env.DB_HOST || 'mysql', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'monitor', password: process.env.DB_PASSWORD || 'monitor',
  database: process.env.DB_NAME || 'monitoring', connectionLimit: 5
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function markStaleAgents() {
  const stale = Number(process.env.AGENT_STALE_SEC || 180);
  await db.execute(`UPDATE hosts h JOIN agents a ON a.id=h.agent_id SET h.status='OFFLINE' WHERE a.enabled=1 AND (a.last_seen IS NULL OR a.last_seen < DATE_SUB(NOW(), INTERVAL ? SECOND))`, [stale]);
}

async function retention() {
  const metricDays = Number(process.env.METRIC_RETENTION_DAYS || 30);
  const checkDays = Number(process.env.CHECK_RETENTION_DAYS || 30);
  const eventDays = Number(process.env.EVENT_RETENTION_DAYS || 180);
  await db.execute('DELETE FROM metrics WHERE recorded_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [metricDays]);
  await db.execute('DELETE FROM check_results WHERE checked_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [checkDays]);
  await db.execute('DELETE FROM alert_events WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [eventDays]);
}

async function deliverNotifications() {
  const [rows] = await db.query(`SELECT n.id,n.attempts,c.type,c.config,a.id alert_id,a.severity,a.title,a.message,a.host_id,h.name host_name
    FROM alert_notifications n JOIN notification_channels c ON c.id=n.channel_id AND c.enabled=1
    JOIN alerts a ON a.id=n.alert_id JOIN hosts h ON h.id=a.host_id
    WHERE n.status='PENDING' OR (n.status='FAILED' AND n.attempts < 8 AND n.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY))
    ORDER BY n.id LIMIT 100`);
  for (const n of rows) {
    try {
      await notify(n, n);
      await db.execute('UPDATE alert_notifications SET status="SENT",sent_at=NOW(),attempts=attempts+1,last_error=NULL WHERE id=?', [n.id]);
    } catch (e) {
      await db.execute('UPDATE alert_notifications SET status="FAILED",attempts=attempts+1,last_error=? WHERE id=?', [String(e.message || e).slice(0, 1000), n.id]);
    }
  }
}

async function run() {
  await markStaleAgents();
  await retention();
  await deliverNotifications();
}

async function main() {
  while (true) {
    try { await run(); } catch (e) { console.error(e); }
    await sleep(Number(process.env.WORKER_INTERVAL_MS || 10000));
  }
}
main();
