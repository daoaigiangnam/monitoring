import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import si from 'systeminformation';
import axios from 'axios';
import { tcpCheck, httpCheck, dnsCheck, sslCheck } from './lib/checks.js';

const cfg={apiUrl:process.env.API_URL||'http://localhost:3000',agentId:process.env.AGENT_ID||os.hostname(),token:process.env.AGENT_TOKEN||'',intervalMs:Number(process.env.INTERVAL_MS||60000),queueDir:process.env.QUEUE_DIR||path.resolve('data/queue'),version:'1.1.0'};
const headers=()=>({Authorization:`Bearer ${cfg.token}`,'content-type':'application/json','x-agent-id':cfg.agentId});
async function jsonFile(file,fallback){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch{return fallback;}}
async function localConfig(){return jsonFile(path.resolve(process.env.AGENT_CONFIG||'config.json'),{});}
async function collect(){
 const [load,mem,fsys,disk,netStats,osInfo,netIf,time,procs,services,cpu,temp,networkConnections]=await Promise.allSettled([
  si.currentLoad(),si.mem(),si.fsSize(),si.disksIO(),si.networkStats(),si.osInfo(),si.networkInterfaces(),si.time(),si.processes(),si.services('*'),si.cpu(),si.cpuTemperature(),si.networkConnections()
 ]); const v=x=>x.status==='fulfilled'?x.value:null;
 const L=v(load)||{},M=v(mem)||{},F=v(fsys)||[],D=v(disk)||{},N=v(netStats)||[],O=v(osInfo)||{},I=v(netIf)||[],P=v(procs)||{list:[]},S=v(services)||[],C=v(cpu)||{},T=v(temp)||{},NC=v(networkConnections)||[];
 const uptime=os.uptime(); const usedPct=M.total?M.active/M.total*100:0;
 return {agent_id:cfg.agentId,agent_version:cfg.version,timestamp:new Date().toISOString(),system:{hostname:os.hostname(),platform:os.platform(),arch:os.arch(),uptime,boot:new Date(Date.now()-uptime*1000).toISOString(),load:os.loadavg(),cpu_percent:Number((L.currentLoad||0).toFixed(2)),cpu_cores:os.cpus().length,cpu_model:C.manufacturer?`${C.manufacturer} ${C.brand}`:os.cpus()[0]?.model||'',memory_total:M.total||0,memory_used:M.active||0,memory_free:M.available||0,memory_util:Number(usedPct.toFixed(2)),swap_total:M.swaptotal||0,swap_used:M.swapused||0,os:O.distro||O.platform||os.platform(),os_release:O.release||'',kernel:O.kernel||'',hostname_fqdn:O.hostname||os.hostname(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,ip_lan:I.filter(x=>x.ip4&&!x.internal).map(x=>x.ip4),macs:I.filter(x=>x.mac&&x.mac!=='00:00:00:00:00:00').map(x=>x.mac),cpu_temperature:T.main||null},
 disks:F.map(x=>({mount:x.mount,size:x.size,used:x.used,available:x.available,use_percent:x.use,fs:x.fs,type:x.type})),disk_io:D,network:N.map(x=>({iface:x.iface,rx_bytes:x.rx_bytes,tx_bytes:x.tx_bytes,rx_sec:x.rx_sec,tx_sec:x.tx_sec,rx_errors:x.rx_errors,tx_errors:x.tx_errors,rx_dropped:x.rx_dropped,tx_dropped:x.tx_dropped,operstate:x.operstate})),
 processes:(P.list||[]).slice(0,500).map(x=>({pid:x.pid,name:x.name,cpu:x.cpu,mem:x.mem,state:x.state,threads:x.threads})),services:S.map(x=>({name:x.name,status:x.running?'RUNNING':'STOPPED',cpu:x.cpu,mem:x.mem})),network_connections:NC.slice(0,1000),
 metrics:[{key:'system.cpu.util',value:Number((L.currentLoad||0).toFixed(2))},{key:'memory.util',value:Number(usedPct.toFixed(2))},{key:'memory.available',value:M.available||0},{key:'system.uptime',value:uptime},{key:'system.processes',value:P.all||P.list?.length||0},{key:'network.connections',value:NC.length}]
 };
}
async function runChecks(config){const out=[];for(const c of config.tcp||[])out.push({type:'tcp',target:`${c.host}:${c.port}`,...(await tcpCheck(c.host,c.port,c.timeout||5000))});for(const c of config.http||[])out.push({type:'http',target:c.url,...(await httpCheck(c.url,c.timeout||10000,c.expectedStatus||[200,201,202,204,301,302,307,308]))});for(const c of config.dns||[])out.push({type:'dns',target:c.name,...(await dnsCheck(c.name,c.record||'A',c.timeout||5000))});for(const c of config.ssl||[])out.push({type:'ssl',target:`${c.host}:${c.port||443}`,...(await sslCheck(c.host,c.port||443,c.timeout||8000))});return out;}
async function discovery(){const [disks,nics,svcs]=await Promise.all([si.fsSize(),si.networkInterfaces(),si.services('*')]);return{disks:disks.map(x=>x.mount),interfaces:nics.map(x=>x.iface),services:svcs.map(x=>x.name).filter(Boolean)};}
async function enqueue(payload){await fs.mkdir(cfg.queueDir,{recursive:true});const f=path.join(cfg.queueDir,`${Date.now()}-${Math.random().toString(16).slice(2)}.json`);await fs.writeFile(f,JSON.stringify(payload));}
async function post(payload){try{await axios.post(`${cfg.apiUrl}/api/v1/agent/report`,payload,{timeout:15000,headers:headers()});return true;}catch(e){console.error('report failed:',e.code||e.message);await enqueue(payload);return false;}}
async function flush(){try{const files=(await fs.readdir(cfg.queueDir)).filter(x=>x.endsWith('.json')).sort();for(const f of files){try{const p=path.join(cfg.queueDir,f);const body=JSON.parse(await fs.readFile(p,'utf8'));await axios.post(`${cfg.apiUrl}/api/v1/agent/report`,body,{timeout:15000,headers:headers()});await fs.unlink(p);}catch{break;}}}catch{}}
async function main(){try{const config=await localConfig();const payload=await collect();payload.checks=await runChecks(config);if(config.discovery!==false)payload.discovery=await discovery();await flush();await post(payload);}catch(e){console.error('agent cycle failed:',e);}}
main();setInterval(main,cfg.intervalMs);setInterval(flush,Math.min(cfg.intervalMs,30000));
