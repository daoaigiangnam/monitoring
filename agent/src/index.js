import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import si from 'systeminformation';

const execFileAsync = promisify(execFile);
const API_URL = process.env.API_URL || 'http://127.0.0.1:8080';
const AGENT_ID = process.env.AGENT_ID || `${os.hostname()}-${Math.random().toString(36).slice(2, 8)}`;
const AGENT_TOKEN = process.env.AGENT_TOKEN || '';
const INTERVAL = Number(process.env.INTERVAL_SECONDS || 60) * 1000;
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const QUEUE_FILE = path.join(DATA_DIR, 'queue.jsonl');
fs.mkdirSync(DATA_DIR, { recursive: true });

async function cpu() { const x = await si.currentLoad(); return { key: 'system.cpu.util', value: Number(x.currentLoad.toFixed(2)) }; }
async function memory() { const x = await si.mem(); return { key: 'memory.util', value: Number(((x.used / x.total) * 100).toFixed(2)), labels: { total: x.total, used: x.used, free: x.available } }; }
async function disks() { const fsInfo = await si.fsSize(); return fsInfo.map(d => ({ key: 'disk.used.util', value: Number(d.use.toFixed(2)), labels: { mount: d.mount, total: d.size, used: d.used, available: d.size - d.used } })); }
async function network() { const stats = await si.networkStats(); return stats.map(n => ({ key: 'network.bytes', value: Number(n.rx_bytes + n.tx_bytes), labels: { iface: n.iface, rx_bytes: n.rx_bytes, tx_bytes: n.tx_bytes } })); }
async function systemInfo() { const [osInfo, nets, time] = await Promise.all([si.osInfo(), si.networkInterfaces(), si.time()]); const lan = nets.filter(n => n.ip4 && !n.internal).map(n => n.ip4); return [
  { key: 'system.uptime.seconds', value: os.uptime() },
  { key: 'system.info', value: 1, labels: { hostname: os.hostname(), platform: osInfo.platform, distro: osInfo.distro, release: osInfo.release, arch: os.arch(), timezone: time.timezoneName, lan_ip: lan } }
]; }
async function windowsServices() { if (process.platform !== 'win32') return []; try { const { stdout } = await execFileAsync('sc', ['query', 'type=', 'service', 'state=', 'all'], { windowsHide: true }); const lines = stdout.split(/\r?\n/); const out = []; let name = ''; for (const line of lines) { if (line.includes('SERVICE_NAME:')) name = line.split(':').slice(1).join(':').trim(); if (line.includes('STATE')) { const state = line.includes('RUNNING') ? 'running' : 'stopped'; if (name) out.push({ key: 'windows.service.state', value: state === 'running' ? 1 : 0, labels: { service: name, state } }); } } return out; } catch { return []; } }
function portCheck(host, port, timeout = 3000) { return new Promise(resolve => { const start = Date.now(); const socket = net.createConnection({ host, port }); let done = false; const finish = (ok, error = null) => { if (done) return; done = true; socket.destroy(); resolve({ key: 'check.tcp', value: ok ? 1 : 0, labels: { host, port, response_ms: Date.now() - start, error } }); }; socket.setTimeout(timeout); socket.once('connect', () => finish(true)); socket.once('timeout', () => finish(false, 'timeout')); socket.once('error', e => finish(false, e.code || 'error')); }); }
async function collect() { return [await cpu(), await memory(), ...(await disks()), ...(await network()), ...(await systemInfo()), ...(await windowsServices())]; }
async function send(payload) { const body = JSON.stringify(payload); const res = await fetch(`${API_URL}/api/v1/agent/metrics`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-agent-id': AGENT_ID, authorization: `Bearer ${AGENT_TOKEN}` }, body }); if (!res.ok) throw new Error(`HTTP ${res.status}`); }
function queue(payload) { fs.appendFileSync(QUEUE_FILE, JSON.stringify(payload) + '\n', 'utf8'); }
async function flushQueue() { if (!fs.existsSync(QUEUE_FILE)) return; const lines = fs.readFileSync(QUEUE_FILE, 'utf8').split('\n').filter(Boolean); const remain = []; for (const line of lines.slice(-5000)) { try { await send(JSON.parse(line)); } catch { remain.push(line); } } if (remain.length) fs.writeFileSync(QUEUE_FILE, remain.join('\n') + '\n'); else fs.rmSync(QUEUE_FILE, { force: true }); }

async function tick() { const metrics = await collect(); const payload = { agent_id: AGENT_ID, timestamp: Math.floor(Date.now() / 1000), metrics }; try { await flushQueue(); await send(payload); } catch (e) { queue(payload); console.error('send failed:', e.message); } }

console.log(`Monitoring agent ${AGENT_ID} started`);
await tick();
setInterval(() => tick().catch(e => console.error(e)), INTERVAL);
