# Product Completion

## Platform
- Node.js Agent: Windows/Linux collectors, checks, discovery, queue, heartbeat, remote config.
- Node.js API: authentication, ingestion, alerting, notifications, maintenance, dependencies.
- PHP frontend: dashboard/admin foundation and SLA page.
- MySQL: monitoring, alert, notification, maintenance, dependency and SLA persistence.

## Production gates
1. Apply schema and migrations in order.
2. Configure HTTPS and production secrets.
3. Enroll agents with unique credentials.
4. Verify heartbeat and metric ingestion.
5. Verify check execution and recovery.
6. Test notification channels.
7. Verify maintenance/dependency suppression.
8. Verify backup/restore.
9. Run CI and integration tests.
10. Canary agent rollout before fleet deployment.

## Remaining engineering work
- Complete CRUD/UI coverage for every entity.
- Complete RBAC enforcement on every API route.
- Finish fleet enrollment and credential rotation UI.
- Finish installer/update packages for Windows and Linux.
- Add end-to-end integration tests against disposable MySQL.
- Add production-grade metrics aggregation and query optimization.
- Add report export and richer SLA analytics.
