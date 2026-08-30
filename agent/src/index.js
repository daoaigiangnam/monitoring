import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import https from 'node:https';
import dns from 'node:dns/promises';
import si from 'systeminformation';
import axios from 'axios';

const cfg = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  agentId: process.env.AGENT_ID || os.hostname(),
  token: process.env.AGENT_TOKEN || '',
  intervalMs: Number(process.env.INTERVAL_MS || 60000),
  queueDir: process.env.QUEUE_DIR || path.resolve('data/queue')
};

async function jsonFile(file, fallback) { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; } }
async function localConfig() { return jsonFile(path.resolve(process.env.AGENT_CONFIG || 'config.json'), {}); }
async function collect() {
  const [load, mem, fsys, disk, netStats, osInfo, netIf, time, procs, services] = await Promise.all([
    si.currentLoad(), si.mem(), si.fsSize(), si.disksIO(), si.networkStats(), si.osInfo(), si.networkInterfaces(), si.time(), si.processes(), si.services('*')
  ]);
  return {
    agent_id: cfg.agentId, timestamp: new Date().toISOString(),
    system: { hostname: os.hostname(), platform: os.platform(), arch: os.arch(), uptime: os.uptime(), load: os.loadavg(), cpu_percent: load.currentLoad, cpu_cores: os.cpus().length, memory_total: mem.total, memory_used: mem.active, memory_free: mem.available, swap_total: mem.swaptotal, swap_used: mem.swapused, boot: new Date(Date.now() - os.uptime()*1000).toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, os: osInfo.distro, os_release: osInfo.release, kernel: osInfo.kernel, ip_lan: netIf.filter(x=>x.ip4 && !x.internal).map(x=>x.ip4), macs: netIf.filter(x=>x.mac && x.mac !== '00:00:00:00:00:00').map(x=>x.mac) },
    disks: fsys.map(x=>({mount:x.mount,size:x.size,used:x.used,use_percent:x.use,available:x.available,fs:x.fs,type:x.type})),
    disk_io: disk, network: netStats.map(x=>({iface:x.iface,rx_bytes:x.rx_bytes,tx_bytes:x.tx_bytes,rx_sec:x.rx_sec,tx_sec:x.tx_sec,rx_errors:x.rx_errors,tx_errors:x.tx_errors,rx_dropped:x.rx_dropped,tx_dropped:x.tx_dropped,operstate:x.operstate})),
    processes: procs.list.slice(0, 200).map(x=>({pid:x.pid,name:x.name,cpu:x.cpu,mem:x.mem,state:x.state,threads:x.threads})),
    services: services.map(x=>({name:x.name,status:x.running?'RUNNING':'STOPPED',cpu:x.cpu,mem:x.mem})),
    metrics: [{key:'system.cpu.util',value:Number(load.currentLoad.toFixed(2))},{key:'memory.util',value:Number((mem.active/mem.total*100).toFixed(2))},{key:'memory.available',value:mem.available},{key:'system.uptime',value:os.uptime}]
  };
}
function tcpCheck(host, port, timeout=5000) { return new Promise(resolve=>{ const s=net.createConnection({host,port}); const t=setTimeout(()=>{s.destroy();resolve({ok:false,ms:timeout});},timeout); const start=Date.now(); s.once('connect',()=>{clearTimeout(t);s.end();resolve({ok:true,ms:Date.now()-start});}); s.once('error',()=>{clearTimeout(t);resolve({ok:false,ms:Date.now()-start});}); }); }
async function checks(config) {
  const out=[];
  for (const c of (config.tcp || [])) out.push({type:'tcp',target:`${c.host}:${c.port}`,...(await tcpCheck(c.host,c.port,c.timeout))});
  for (const c of (config.http || [])) { const start=Date.now(); try { const r=await axios.get(c.url,{timeout:c.timeout||10000,validateStatus:()=>true}); out.push({type:'http',target:c.url,ok:r.status>=200&&r.status<400,status:r.status,ms:Date.now()-start}); } catch(e){ out.push({type:'http',target:c.url,ok:false,status:0,ms:Date.now()-start,error:e.code||e.message}); } }
  for (const c of (config.dns || [])) { const start=Date.now(); try { const a=await dns.resolve(c.name,c.record||'A'); out.push({type:'dns',target:c.name,ok:true,ms:Date.now()-start,answers:a}); } catch(e){out.push({type:'dns',target:c.name,ok:false,ms:Date.now()-start,error:e.code||e.message});} }
  return out;
}
async function enqueue(payload) { await fs.mkdir(cfg.queueDir,{recursive:true}); const f=path.join(cfg.queueDir,`${Date.now()}-${Math.random().toString(16).slice(2)}.json`); await fs.writeFile(f,JSON.stringify(payload)); }
async function send(payload) { try { await axios.post(`${cfg.apiUrl}/api/v1/agent/report`,payload,{timeout:15000,headers:{Authorization:`Bearer ${cfg.token}`,'content-type':'application/json'}}); return true; } catch { await enqueue(payload); return false; } }
async function flush() { try { const files=(await fs.readdir(cfg.queueDir)).filter(x=>x.endsWith('.json')).sort(); for(const f of files){ const p=path.join(cfg.queueDir,f); try{const body=JSON.parse(await fs.readFile(p,'utf8')); await axios.post(`${cfg.apiUrl}/api/v1/agent/report`,body,{timeout:15000,headers:{Authorization:`Bearer ${cfg.token}`}}); await fs.unlink(p);}catch{break;} } } catch {} }
async function main(){ const config=await localConfig(); await flush(); const payload=await collect(); payload.checks=await checks(config); await send(payload); }
main(); setInterval(main,cfg.intervalMs); setInterval(flush,Math.min(cfg.intervalMs,30000));
