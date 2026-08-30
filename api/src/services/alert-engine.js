import crypto from 'node:crypto';
const fingerprint=(hostId,ruleId,key)=>crypto.createHash('sha256').update(`${hostId}:${ruleId}:${key}`).digest('hex');
function matches(v,op,t){if(!Number.isFinite(v)||t===null)return false;return op==='>'?v>t:op==='>='?v>=t:op==='<'?v<t:op==='<='?v<=t:op==='='?v===t:v!==t;}
function recoveryMatches(v,op,t){return !matches(v,op,t);}

export async function evaluateAlerts(db,hostId,metrics){
 const [rules]=await db.execute('SELECT * FROM alert_rules WHERE enabled=1');
 const now=new Date();
 for(const m of metrics){const value=Number(m.value);if(!Number.isFinite(value))continue;
  for(const r of rules){if(r.metric_key!==m.key)continue;
   const bad=matches(value,r.operator,Number(r.threshold));
   if(!bad){await db.execute('DELETE FROM alert_rule_states WHERE host_id=? AND rule_id=?',[hostId,r.id]);continue;}
   const [states]=await db.execute('SELECT first_bad_at FROM alert_rule_states WHERE host_id=? AND rule_id=?',[hostId,r.id]);
   if(!states.length){await db.execute('INSERT INTO alert_rule_states(host_id,rule_id,first_bad_at,last_value) VALUES(?,?,?,?)',[hostId,r.id,now,value]);}
   else await db.execute('UPDATE alert_rule_states SET last_value=?,updated_at=? WHERE host_id=? AND rule_id=?',[value,now,hostId,r.id]);
   const [stateRows]=await db.execute('SELECT first_bad_at FROM alert_rule_states WHERE host_id=? AND rule_id=?',[hostId,r.id]);
   const firstBad=stateRows[0]?.first_bad_at ? new Date(stateRows[0].first_bad_at) : now;
   if(now-firstBad < Number(r.duration_sec||0)*1000)continue;
   const fp=fingerprint(hostId,r.id,r.metric_key);
   const [open]=await db.execute('SELECT id FROM alerts WHERE fingerprint=? AND status IN ("OPEN","ACKNOWLEDGED") LIMIT 1',[fp]);
   if(open.length)continue;
   const [ins]=await db.execute('INSERT INTO alerts(host_id,rule_id,fingerprint,severity,status,title,message,started_at) VALUES(?,?,?,?,"OPEN",?,?,?)',[hostId,r.id,fp,r.severity,r.name,`${r.metric_key} ${r.operator} ${r.threshold}; current=${value}`,firstBad]);
   await db.execute('INSERT INTO alert_events(alert_id,event_type,message) VALUES(?,?,?)',[ins.insertId,'OPEN',`Triggered after ${Math.round((now-firstBad)/1000)}s: ${r.metric_key}=${value}`]);
   await db.execute('INSERT INTO alert_notifications(alert_id,channel_id) SELECT ?,id FROM notification_channels WHERE enabled=1',[ins.insertId]);
  }
 }
}

export async function resolveRecovered(db,hostId,metrics){
 const [alerts]=await db.execute('SELECT a.id,a.rule_id,r.metric_key,r.operator,r.threshold FROM alerts a JOIN alert_rules r ON r.id=a.rule_id WHERE a.host_id=? AND a.status IN ("OPEN","ACKNOWLEDGED")',[hostId]);
 for(const a of alerts){const m=metrics.find(x=>x.key===a.metric_key);if(!m)continue;if(recoveryMatches(Number(m.value),a.operator,Number(a.threshold))){await db.execute('UPDATE alerts SET status="RESOLVED",resolved_at=NOW() WHERE id=?',[a.id]);await db.execute('INSERT INTO alert_events(alert_id,event_type,message) VALUES(?,?,?)',[a.id,'RESOLVED',`Recovered: ${a.metric_key}=${m.value}`]);await db.execute('DELETE FROM alert_rule_states WHERE host_id=? AND rule_id=?',[hostId,a.rule_id]);await db.execute('INSERT INTO alert_notifications(alert_id,channel_id) SELECT ?,id FROM notification_channels WHERE enabled=1',[a.id]);}}
}
