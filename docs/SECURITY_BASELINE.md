# Security Baseline

## Production requirements

1. Run the API behind HTTPS and a reverse proxy.
2. Store database passwords, Agent tokens, Telegram secrets and SMTP credentials only in environment/secret management.
3. Use a unique high-entropy token for every Agent and revoke it when the host is retired.
4. Restrict administrative routes and enforce RBAC server-side, not only in the PHP UI.
5. Apply rate limiting to authentication and Agent endpoints.
6. Validate JSON payloads and reject unknown/oversized input where practical.
7. Use parameterized SQL queries only.
8. Keep audit logs for authentication, configuration and privileged actions.
9. Run the Agent with least privilege and only enable collectors that require elevated access.
10. Back up MySQL and periodically perform a restore test.
11. Keep Node.js, PHP, MySQL and OS packages patched.
12. Never commit `.env`, private keys, tokens or passwords.
