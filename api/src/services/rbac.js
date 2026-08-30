const ROLE_LEVEL={VIEWER:10,OPERATOR:20,ADMIN:30};
function requireRole(minRole='VIEWER'){
  return async function(req,reply){
    const role=String(req.headers['x-user-role']||'VIEWER').toUpperCase();
    if((ROLE_LEVEL[role]||0)<(ROLE_LEVEL[String(minRole).toUpperCase()]||0)) return reply.code(403).send({error:'forbidden'});
    req.userRole=role;
  };
}
module.exports={ROLE_LEVEL,requireRole};
