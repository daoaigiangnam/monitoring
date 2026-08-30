# API Security Contract

## Agent endpoints
- Authenticate with `Authorization: Bearer <agent-token>`.
- Tokens are high-entropy credentials and must never be committed to Git.
- Server stores only a SHA-256 token hash.
- Revoked/disabled agents must receive HTTP 401.

## Administrative endpoints
Administrative routes must require an authenticated application user and an appropriate RBAC role before production exposure. Viewer is read-only; Operator may acknowledge/operate monitoring; Admin manages infrastructure, credentials and configuration.

## Deployment
Run the API behind HTTPS/reverse proxy, restrict database network access, use production secrets, and enable rate limiting at the edge/API layer.
