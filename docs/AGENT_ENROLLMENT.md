# Agent Enrollment

## Recommended production flow

1. Create a host in the Admin UI/API.
2. Generate a unique high-entropy agent token for that host.
3. Install the Agent and place the API URL + token in its configuration.
4. Agent sends heartbeat and host identity.
5. Server associates the Agent with the host and begins remote configuration.
6. Rotate/revoke the token whenever a server is decommissioned or credentials may be exposed.

## Security requirements

- Use HTTPS only in production.
- Never put tokens in source control.
- Prefer one token per Agent/host.
- Revoke old tokens during replacement.
- Restrict enrollment endpoints at the network layer when possible.
- Store secrets outside the repository and inject them through environment/configuration management.

## Fleet rollout

Use a canary group first. Verify heartbeat, metrics, checks, alert/recovery and queue drain before broad deployment.
