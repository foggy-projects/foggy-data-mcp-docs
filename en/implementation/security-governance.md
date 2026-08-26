# Security and Governance

## Separate authentication contexts

| Context | Purpose | Must not do |
| --- | --- | --- |
| `X-Foggy-Runtime-Code` | Runtime management authentication | Automatically represent a business user |
| `Authorization` | Optional opaque business token | Submit or elevate policy parameters |
| `X-NS` | Namespace isolation | Bypass model or datasource authorization |

Store, transmit, rotate, and audit management codes separately from business Authorization. Model policy code may interpret Authorization as a user, tenant, or department identity, but Runtime does not assume a token format.

## Launcher and production boundary

The default `none-dev-test-only` mode is for local validation. Production should provide at least:

- strong authentication for management APIs;
- network and client-identity controls around MCP endpoints;
- secret management for datasource credentials, with no secrets in logs, MCP configuration, or errors;
- an explicit namespace-to-business-tenant mapping;
- structured audit of actor, namespace, model, fields, revision, trace, and result state;
- minimal exposure of SQL, FSScript, table inspection, and Compose entry points;
- backup, release-recovery, and key-rotation drills.

## Semantic query boundary

Normal MCP queries use model-aware DSL. Callers must not submit internal governance fields such as `fieldAccess`, `deniedColumns`, `systemSlice`, or `policySnapshotId`, and must not replace model policy with raw SQL.

FSScript model code is trusted published code and may use host extensions. Model publication therefore requires management authorization, review, and audit. Raw FSScript execution is not an ordinary data-query route; keep it in the management/authoring boundary.

## Dynamic tool policy

A namespace may optionally provide `tools.config.js` to filter tools. This is a routing/exposure control, not the only security boundary: model policy, Runtime management authentication, network isolation, and auditing must remain independent. The behavior for missing or failing policy resolution follows the current bridge version and capability discovery; production authorization must not depend on hiding a tool name.

## Charts and export

- XChart is JVM-native but still subject to query fields and row policies.
- ECharts is a separate render service and needs network, input-size, timeout, and resource controls.
- Exported results are business data; “it is only a chart” is not a reason to skip audit or redaction.

## Security verification checklist

1. Mutation without management code is rejected when auth-code is enabled.
2. Models, datasources, and caches are isolated between namespaces.
3. Business Authorization is not replaced by or elevated from management code.
4. Structured tools remain usable without an AI Provider, while NL does not pretend to be enabled.
5. Protected-model policy failures fail closed and leave correlatable audit evidence.
6. Errors and diagnostics contain no password, complete token, absolute path, or backend secret.

