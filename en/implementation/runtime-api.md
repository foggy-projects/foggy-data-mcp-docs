# Runtime API Operations

The Runtime API is the REST surface for management, modeling, and direct semantic queries. Use `/api/v1/capabilities` and the current bridge schemas as the authoritative request contract for a running instance.

See [Runtime API and MCP Examples](./runtime-api-examples.md) for copyable requests and [Capability Baseline and Evidence](./capability-matrix.md) for the verified/unverified boundary.

## Request context

| Context | Purpose |
| --- | --- |
| `X-NS` | Selects the namespace and isolates datasource, Bundle, models, and queries |
| `X-Foggy-Runtime-Code` | Runtime management authentication when `auth-code` is enabled |
| `Authorization` | Optional opaque business identity for data-plane policy evaluation |
| trace/request ID | Correlates logs, audit, and client errors |

Prefer an explicit `X-NS`; do not depend on a default or empty namespace. Store, rotate, and audit management authentication separately from business identity.

## Typical operation order

### 1. Datasource

```text
register/update datasource
  → connection test
  → bind namespace
  → inspect diagnostics
```

Relevant routes include:

- `GET/POST /api/v1/datasources`
- `POST /api/v1/datasources/{name}/test`
- `GET /api/v1/datasources/diagnostics`
- `PUT /api/v1/namespaces/{namespace}/datasource`

A passing connection test does not make models queryable; it only verifies that the datasource configuration can connect. Diagnostics must not return passwords, full connection strings, or other secrets.

A new namespace normally has no default datasource binding. Bind it before `models/validate`; otherwise the Runtime returns `MODEL_VALIDATE_FAILED`, which repeated refreshes cannot fix.

### 2. Bundle and models

```text
Bundle register/update
  → POST /api/v1/models/validate
  → POST /api/v1/models/refresh
  → GET /api/v1/models
  → POST /api/v1/models/{model}/describe
```

Bundle registration records a resource source; it does not claim that the models compile or are query-visible. `validate` returns a candidate and diagnostics without replacing the live catalog. `refresh` publishes a new catalog generation atomically after validation/admission. If refresh fails, the previously published generation should remain available.

### 3. Query and explanation

- `POST /api/v1/query/{model}/validate`: validate a query payload only.
- `POST /api/v1/query/{model}/execute`: execute a governed semantic query.
- `POST /api/v1/query/{model}/explain`: return definition, compilation, and optional SQL/physical-name evidence.
- `POST /api/v1/compose/validate|preview|execute`: handle composed queries.
- `POST /api/v1/tables/list` and `/tables/inspect`: datasource inspection for controlled operational use.
- `POST /api/v1/sql/query`: keep within an explicitly managed/internal boundary; it is not the normal MCP user query interface.

Explain recompilation evidence is not a historical execution trace. External reports must label the difference between a plan/SQL recompiled for this request and an actual execution record.

## Safe change order

1. Read the current namespace, Bundle, binding generation, and model catalog generation.
2. Validate with the expected revision/generation and preserve diagnostics.
3. Refresh/publish only when the validation result exactly matches the target revision.
4. Re-read models/describe after refresh and execute a minimal query.
5. Record the actor, namespace, source revision, catalog generation, and result.

Do not repeatedly refresh to “repair” historical data or old runtime state. Use read-only diagnosis first and a disposable fixture when an old state blocks verification.

## Authoring and release routes

The current Runtime also exposes workspace, candidate query, publish, recovery, release-package, production-promotion, and rollback routes, for example:

- `/api/v1/authoring/workspaces`
- `/api/v1/authoring/workspaces/{workspaceId}/validate`
- `/api/v1/authoring/workspaces/{workspaceId}/publish`
- `/api/v1/authoring/workspaces/{workspaceId}/publish/recover`
- `/api/v1/authoring/workspaces/{workspaceId}/release-package`
- `/api/v1/authoring/workspaces/{workspaceId}/promote`
- `/api/v1/authoring/workspaces/{workspaceId}/rollback`

These are management routes. Publishing requires an exact current candidate with complete validation evidence; on failure, preserve evidence and recover only to a server-proven base rather than guessing over third-party changes.
