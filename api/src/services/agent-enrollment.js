import crypto from 'node:crypto';

export function generateAgentToken() {
  return `mon_${crypto.randomBytes(32).toString('base64url')}`;
}

export function hashAgentToken(token) {
  return crypto.createHash('sha256').update(String(token || ''), 'utf8').digest('hex');
}

export async function enrollAgent(db, { agentId, hostName = null, hostname = null }) {
  if (!agentId || !/^[A-Za-z0-9._:-]{2,128}$/.test(agentId)) throw new Error('invalid_agent_id');
  const token = generateAgentToken();
  const tokenHash = hashAgentToken(token);
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute('SELECT id FROM agents WHERE agent_id=? LIMIT 1', [agentId]);
    if (existing.length) throw new Error('agent_id_exists');
    const [r] = await connection.execute('INSERT INTO agents(agent_id,token_hash,enabled,hostname,created_at) VALUES(?,?,1,?,NOW())', [agentId, tokenHash, hostname]);
    await connection.execute('INSERT INTO hosts(agent_id,name,hostname,status,last_seen) VALUES(?,?,?,"OFFLINE",NULL)', [r.insertId, hostName || agentId, hostname]);
    await connection.commit();
    return { agentDbId: r.insertId, agentId, token };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function rotateAgentToken(db, agentDbId) {
  const token = generateAgentToken();
  const tokenHash = hashAgentToken(token);
  const [result] = await db.execute('UPDATE agents SET token_hash=?,token_created_at=NOW(),token_last_used_at=NULL,token_revoked_at=NULL,token_version=COALESCE(token_version,0)+1 WHERE id=? AND enabled=1', [tokenHash, agentDbId]);
  if (!result.affectedRows) throw new Error('agent_not_found_or_disabled');
  return { token };
}

export async function revokeAgentToken(db, agentDbId) {
  const [result] = await db.execute('UPDATE agents SET token_revoked_at=NOW(),enabled=0 WHERE id=?', [agentDbId]);
  if (!result.affectedRows) throw new Error('agent_not_found');
  return { success: true };
}
