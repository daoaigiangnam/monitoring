import crypto from 'node:crypto';

export function generateAgentToken(bytes = 32) {
  if (!Number.isInteger(bytes) || bytes < 32) throw new Error('token size must be >= 32 bytes');
  return crypto.randomBytes(bytes).toString('base64url');
}

export function hashAgentToken(token) {
  if (typeof token !== 'string' || token.length < 32) throw new Error('invalid agent token');
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export function timingSafeTokenMatch(token, expectedHash) {
  try {
    const actual = Buffer.from(hashAgentToken(token), 'hex');
    const expected = Buffer.from(String(expectedHash), 'hex');
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function tokenMetadata(token) {
  const createdAt = new Date().toISOString();
  return { token, token_hash: hashAgentToken(token), created_at: createdAt };
}
