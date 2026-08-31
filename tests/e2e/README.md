# E2E smoke tests

The GitHub Actions E2E workflow provisions MySQL, initializes the schema and migrations, starts the API, and verifies the API health endpoint. This is intentionally a first runtime gate; deeper Agent-to-Alert tests are added as the API contracts are stabilized.
