# Deployment Architecture

## Recommended production topology

```text
Internet/LAN
    |
    v
Reverse Proxy (HTTPS)
    |
    +---- PHP Dashboard/Admin
    |
    +---- Node.js API ---- MySQL 8
             ^
             |
       outbound HTTPS
             |
        Node.js Agents
```

## Separation of concerns

- **Agent:** collect/check locally and queue when disconnected.
- **API:** authenticate Agents, ingest data, evaluate alert state, expose management APIs and run workers.
- **MySQL:** durable operational state, metrics, checks, alerts, configuration and audit history.
- **PHP:** presentation and administration through the API; it does not implement monitoring logic.

## Scaling path

For a small deployment, one API/worker instance and one MySQL instance are sufficient. For larger fleets, separate API and worker processes, add a reverse proxy/load balancer, and tune MySQL indexes/retention. Agents must remain stateless apart from their local queue and configuration.

## Failure behavior

- API unavailable: Agent queues reports and retries.
- MySQL unavailable: API health fails; workers stop processing until storage recovers.
- Agent unavailable: server marks the Agent/host stale and raises an offline condition according to policy.
- Notification provider unavailable: delivery is retried and the failure is persisted.
