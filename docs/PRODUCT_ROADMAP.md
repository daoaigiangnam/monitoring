# Monitoring Product Roadmap

## Product baseline
- Node.js Agent for Windows/Linux
- Node.js API
- MySQL 8
- PHP native dashboard/admin
- HTTPS agent transport
- Offline queue and retry
- Metrics, checks, alerts and notifications

## Production completion gates
1. Configuration and secrets are externalized.
2. Database migrations are repeatable and versioned.
3. Agent install, upgrade, uninstall and service lifecycle are documented.
4. Alert state transitions are deterministic and deduplicated.
5. Notification delivery is retried and auditable.
6. Maintenance and dependency suppression are enforced server-side.
7. RBAC and CSRF protection cover administrative mutations.
8. Retention and aggregation prevent unbounded growth.
9. Health/readiness endpoints exist for operations.
10. CI performs syntax/configuration checks.

## Recommended deployment
Use the API and worker as separate processes. Put PHP behind Apache/Nginx. Keep MySQL private to the application network. Expose only HTTPS for users and agents.
