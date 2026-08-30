import crypto from 'node:crypto';
export function generateAgentToken(){return crypto.randomBytes(32).toString('base64url');}
export function hashAgentToken(token){return crypto.createHash('sha256').update(String(token||''),'utf8').digest('hex');}
export function safeTokenEqual(a,b){const x=Buffer.from(hashAgentToken(a),'hex');const y=Buffer.from(hashAgentToken(b),'hex');return x.length===y.length&&crypto.timingSafeEqual(x,y);}
