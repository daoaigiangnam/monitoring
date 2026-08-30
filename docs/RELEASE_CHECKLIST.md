# Release Checklist

- [ ] Configure production `.env` and rotate bootstrap credentials.
- [ ] Apply schema and migrations in order.
- [ ] Verify API `/health`.
- [ ] Verify PHP login and dashboard.
- [ ] Enroll a Windows Agent and a Linux Agent.
- [ ] Verify heartbeat, CPU/RAM/Disk metrics and checks.
- [ ] Verify remote configuration delivery.
- [ ] Verify alert open, acknowledgement and recovery.
- [ ] Test Telegram, Email and Webhook notifications.
- [ ] Verify maintenance suppression and dependency suppression.
- [ ] Verify SLA/availability aggregation.
- [ ] Verify MySQL backup and restore.
- [ ] Run automated tests/CI and review failures.
- [ ] Canary Agent upgrade before fleet rollout.
- [ ] Review audit log and security configuration.
