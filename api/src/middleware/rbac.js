const ROLE_RANK = Object.freeze({ VIEWER: 10, OPERATOR: 20, ADMIN: 30 });

export function requireRole(minRole = 'VIEWER') {
  const required = ROLE_RANK[minRole] ?? ROLE_RANK.VIEWER;
  return async function rbac(req, reply) {
    const role = String(req.user?.role || '').toUpperCase();
    if ((ROLE_RANK[role] ?? 0) < required) {
      return reply.code(403).send({ error: 'forbidden', required_role: minRole });
    }
  };
}

export function roleAllowed(role, minRole = 'VIEWER') {
  return (ROLE_RANK[String(role || '').toUpperCase()] ?? 0) >= (ROLE_RANK[minRole] ?? ROLE_RANK.VIEWER);
}
