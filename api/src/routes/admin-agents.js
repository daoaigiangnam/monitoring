import { enrollAgent, rotateAgentToken, revokeAgentToken } from '../services/agent-enrollment.js';

export default async function adminAgentRoutes(app, { db, requireRole }) {
  app.post('/api/v1/admin/agents/enroll', { preHandler: requireRole('ADMIN') }, async (req, reply) => {
    try {
      const result = await enrollAgent(db, req.body || {});
      await db.execute('INSERT INTO agent_enrollment_events(agent_id,event_type,actor,ip_address) VALUES(?,?,?,?,?)', [result.agentDbId,'ENROLLED',req.user?.username || 'admin',req.ip]);
      return reply.code(201).send(result);
    } catch (e) {
      if (e.message === 'agent_id_exists' || e.message === 'invalid_agent_id') return reply.code(409).send({ error: e.message });
      throw e;
    }
  });

  app.post('/api/v1/admin/agents/:id/rotate', { preHandler: requireRole('ADMIN') }, async (req, reply) => {
    try {
      const result = await rotateAgentToken(db, Number(req.params.id));
      await db.execute('INSERT INTO agent_enrollment_events(agent_id,event_type,actor,ip_address) VALUES(?,?,?,?,?)', [req.params.id,'TOKEN_ROTATED',req.user?.username || 'admin',req.ip]);
      return result;
    } catch (e) { return reply.code(404).send({ error: e.message }); }
  });

  app.post('/api/v1/admin/agents/:id/revoke', { preHandler: requireRole('ADMIN') }, async (req, reply) => {
    try {
      const result = await revokeAgentToken(db, Number(req.params.id));
      await db.execute('INSERT INTO agent_enrollment_events(agent_id,event_type,actor,ip_address) VALUES(?,?,?,?,?)', [req.params.id,'TOKEN_REVOKED',req.user?.username || 'admin',req.ip]);
      return result;
    } catch (e) { return reply.code(404).send({ error: e.message }); }
  });
}
