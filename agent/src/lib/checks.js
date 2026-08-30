import net from 'node:net';
import dns from 'node:dns/promises';
import tls from 'node:tls';
import axios from 'axios';

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), ms))]);

export function tcpCheck(host, port, timeout = 5000) {
  return new Promise(resolve => {
    const start = Date.now(); const s = net.createConnection({ host, port: Number(port) });
    let done = false; const finish = v => { if (!done) { done = true; s.destroy(); resolve(v); } };
    const t = setTimeout(() => finish({ ok:false, ms:Date.now()-start, error:'TIMEOUT' }), timeout);
    s.once('connect', () => { clearTimeout(t); finish({ok:true, ms:Date.now()-start}); });
    s.once('error', e => { clearTimeout(t); finish({ok:false, ms:Date.now()-start, error:e.code || e.message}); });
  });
}

export async function pingCheck(host, timeout=5000) {
  const start=Date.now();
  try { const r=await withTimeout(axios.get(`http://${host}`, {timeout, validateStatus:()=>true}), timeout); return {ok:true, ms:Date.now()-start, http_status:r.status}; }
  catch { return tcpCheck(host, 80, timeout); }
}

export async function httpCheck(url, timeout=10000, expectedStatus=[200]) {
  const start=Date.now();
  try { const r=await axios.get(url,{timeout,validateStatus:()=>true,maxRedirects:5}); return {ok:expectedStatus.includes(r.status),ms:Date.now()-start,status:r.status,final_url:r.request?.res?.responseUrl||url}; }
  catch(e) { return {ok:false,ms:Date.now()-start,status:0,error:e.code||e.message}; }
}

export async function dnsCheck(name, record='A', timeout=5000) {
  const start=Date.now(); try { const answers=await withTimeout(dns.resolve(name,record),timeout); return {ok:true,ms:Date.now()-start,answers}; }
  catch(e){return {ok:false,ms:Date.now()-start,error:e.code||e.message};}
}

export function sslCheck(host, port=443, timeout=8000) {
  return new Promise(resolve=>{ const start=Date.now(); let settled=false; const finish=v=>{if(!settled){settled=true;resolve(v)}};
    const s=tls.connect({host,port,servername:host,rejectUnauthorized:false}); const t=setTimeout(()=>{s.destroy();finish({ok:false,ms:Date.now()-start,error:'TIMEOUT'})},timeout);
    s.once('secureConnect',()=>{clearTimeout(t);const c=s.getPeerCertificate();const validTo=c.valid_to?new Date(c.valid_to):null;finish({ok:!!validTo&&validTo>Date.now(),ms:Date.now()-start,valid_to:c.valid_to||null,issuer:c.issuer?.O||null,subject:c.subject?.CN||null});s.end();});
    s.once('error',e=>{clearTimeout(t);finish({ok:false,ms:Date.now()-start,error:e.code||e.message});});
  });
}
