import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAgentToken, hashAgentToken, timingSafeTokenMatch } from '../src/services/agent-token.js';

test('agent tokens are high entropy and URL safe', () => {
  const token = generateAgentToken();
  assert.ok(token.length >= 40);
  assert.match(token, /^[A-Za-z0-9_-]+$/);
});

test('agent token hash is deterministic', () => {
  const token = generateAgentToken();
  assert.equal(hashAgentToken(token), hashAgentToken(token));
  assert.equal(hashAgentToken(token).length, 64);
});

test('agent token comparison rejects wrong token', () => {
  const token = generateAgentToken();
  const hash = hashAgentToken(token);
  assert.equal(timingSafeTokenMatch(token, hash), true);
  assert.equal(timingSafeTokenMatch(generateAgentToken(), hash), false);
});
