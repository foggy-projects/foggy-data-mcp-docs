# Operations Runbook

## Startup checks

```bash
curl -fsS http://127.0.0.1:18066/readyz
curl -fsS http://127.0.0.1:18066/api/v1/capabilities
```

Record version, features, `securityMode`, startup time, and deployment identity. A passing `readyz` only means that the process is ready; it does not prove datasource, Bundle, or model queryability.

## Datasource incidents

1. Record namespace and datasource name, never the password.
2. Read diagnostics first, then run the datasource test as a separate action.
3. Distinguish network/DNS, credentials, driver, database permission, and schema failures.
4. Revalidate/refresh dependent models after a datasource binding change.
5. Do not modify historical data to make a connection test pass.

## Model missing or query failure

Use this order:

```text
namespace correct?
  → Bundle registered and enabled?
  → validation passed?
  → refresh succeeded and generation changed?
  → list_models/describe visible?
  → query validation field/policy/dialect diagnostics
  → execute trace, database, and result boundary
```

Do not start by clearing caches, deleting Bundles, or rewriting historical resources. Preserve read-only responses and generations, then reproduce with a disposable fixture.

## Runtime error code quick reference

Treat `error.code`, `error.phase`, and diagnostic categories in the response as authoritative over a client's prose wrapper. Common mappings in the current Java Runtime are:

| Error code | Typical phase | First action |
| --- | --- | --- |
| `MODEL_VALIDATE_FAILED` | `models.validate` | Confirm namespace binding, TM/QM path, and `MODEL` diagnostics before reading cascading errors. |
| `MODEL_REFRESH_FAILED` | `models.refresh` | Preserve the old catalog generation and check validation/source-revision alignment; do not retry refresh blindly. |
| `MODEL_NOT_FOUND` | `models.describe` / `query.explain` | Re-run `list_models` and check namespace, Bundle enabled state, and refresh status. |
| `QUERY_VALIDATE_FAILED` | `query.validate` | Use the closed field set from describe, reduce the payload, and check model revision, authorization, and dialect. |
| `QUERY_EXECUTE_FAILED` | `query.execute` | Preserve the request/trace ID and distinguish semantic compilation, database, timeout, and result-boundary failures. |
| `QUERY_EXPLAIN_FAILED` | `query.explain` | Treat Explain as fresh compilation evidence; do not substitute it for a historical execution trace. |
| `SQL_QUERY_FAILED` | `sql.query` | Keep diagnosis within the controlled read-only operations surface; check datasource, dialect, and timeout without bypassing semantics. |
| `BUNDLE_MODEL_NAME_CONFLICT` | `bundles` | Check canonical model-name conflicts and Bundle source revision; do not overwrite unknown live resources. |

CLI exit codes `2/3/4` mean Runtime API error, unsupported capability, and transport error respectively; they do not replace the Runtime `error.code` in the response.

## MCP tool missing

- Call `tools/list` again and confirm endpoint, namespace, and client headers.
- Confirm current names: `dataset.export_with_xchart` and `dataset.export_with_echarts`, not the retired `dataset.export_with_chart`.
- `dataset.list_models` is the preferred discovery tool; `dataset.get_metadata` is a compatibility/migration entry point.
- If only the NL tool is absent, inspect the AI Provider rather than treating it as a Runtime outage.

## Publish failure

Preserve workspace, attempt, revision, and error evidence. Recover only when the server identifies a safe base; stop automatic repair on third-party drift and request human confirmation. Artifact inventory is observational and does not perform cleanup, repair, or garbage collection.

## Post-release regression

Recheck:

1. `GET /api/v1/models` and the target model description;
2. one minimal validation query;
3. one minimal execution query;
4. `dataset.list_models` and `tools/list`;
5. the target namespace's denied-access path;
6. logs and audit for trace, revision, and generation without secrets.

## Record template

```text
Time:
Environment/instance:
Namespace:
Runtime/launcher:
Bundle/source revision:
Binding generation:
Catalog generation:
Request/trace ID:
Action and result:
Diagnostics and follow-up:
```
