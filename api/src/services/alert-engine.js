import crypto from 'node:crypto';
const fingerprint=(hostId,ruleId,key)=>crypto.createHash('sha256').update(`${hostId}:${ruleId}:${key}`).digest('hex');
function matches(v,op,t){if(typeof v!=='number'||t===null)return false;return op==='>'?v>t:op==='>='?v>=t:op==='<'?v<t:op==='<='?v<=t:op==='='?v===t:v!==t;}
export async function evaluateAlerts(db,hostId,metrics){
 const [rules]=await db.execute('SELECT * FROM alert_rules WHERE enabled=1');
 for(const m of metrics){const value=Number(m.value);if(!Number.isFinite(value))continue;
  for(const r of rules){if(r.metric_key!==m.key||!matches(value,r.operator,r.threshold))continue;const fp=fingerprint(hostId,r.id,r.metric_key);const [open]=await db.execute('SELECT id FROM alerts WHERE fingerprint=? AND status IN ("OPEN","ACKNOWLEDGED") LIMIT 1',[fp]);if(open.length)continue;
   const [ins]=await db.execute('INSERT INTO alerts(host_id,rule_id,fingerprint,severity,status,title,message,started_at) VALUES(?,?,?,?,"OPEN",?,?,NOW())',[hostId,r.id,fp,r.severity,r.name,`${r.metric_key} ${r.operator} ${r.threshold}; current=${value}`]);
   await db.execute('INSERT INTO alert_events(alert_id,event_type,message) VALUES(?,?,?)',[ins.insertId,'OPEN',`Triggered: ${r.metric_key}=${value}`]);
   await db.execute('INSERT INTO alert_notifications(alert_id,channel_id) SELECT ?,id FROM notification_channels WHERE enabled=1',[ins.insertId]);
  }
 }
}
export async function resolveRecovered(db,hostId,metrics){
 const [alerts]=await db.execute('SELECT a.id,a.rule_id,r.metric_key,r.operator,r.threshold FROM alerts a JOIN alert_rules r ON r.id=a.rule_id WHERE a.host_id=? AND a.status="OPEN"',[hostId]);
 for(const a of alerts){const m=metrics.find(x=>x.key===a.metric_key);if(!m)continue;if(!matches(Number(m.value),a.operator,a.threshold)){await db.execute('UPDATE alerts SET status="RESOLVED",resolved_at=NOW() WHERE id=?',[a.id]);await db.execute('INSERT INTO alert_events(alert_id,event_type,message) VALUES(?,?,?)',[a.id,'RESOLVED',`Recovered: ${a.metric_key}=${m.value}`]);}}
}
