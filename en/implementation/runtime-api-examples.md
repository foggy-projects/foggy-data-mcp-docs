---
title: Runtime API and MCP Examples
last_reviewed: 2026-08-22
status: working-manual
---

# Runtime API and MCP Examples

These examples come from a disposable SQLite validation run against the Java Runtime. They are for development/test and documentation acceptance; do not copy them into production unchanged. Production requests also need the correct management authentication, business identity, TLS, audit, and network controls.

## Variables and request conventions

```bash
BASE_URL=http://127.0.0.1:18066
NS=salesdrop
MODEL=SalesDropDailyQueryModel
MODEL_DIR=/path/to/sales-drop-demo/models
```

- Runtime API uses `X-NS` to select a namespace; every request below sends it explicitly.
- The CLI emits JSON by default, which can be retained as acceptance evidence. Exit codes are `2` for a Runtime API error, `3` for an unsupported capability, and `4` for a transport error.
- `MODEL_DIR` must be a TM/QM directory readable by the Runtime process.

## 1. Start with readiness and capability discovery

```bash
curl -fsS "$BASE_URL/readyz"

curl -fsS "$BASE_URL/api/v1/capabilities" \
  -H "X-NS: $NS"
```

Record `engine`, `runtimeApiVersion`, `schemaVersion`, `securityMode`, and `capabilities`. This run returned `java`, `foggy-runtime-api/v1`, `2026-06-06`, and `none-dev-test-only`.

Equivalent CLI commands:

```bash
PYTHONPATH=foggy-runtime-cli/src python3 -m foggy_runtime_cli.main \
  --base-url "$BASE_URL" --namespace "$NS" wait-ready

PYTHONPATH=foggy-runtime-cli/src python3 -m foggy_runtime_cli.main \
  --base-url "$BASE_URL" --namespace "$NS" capabilities
```

## 2. Test the datasource and bind the namespace

```bash
curl -fsS -X POST "$BASE_URL/api/v1/datasources/default/test" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{}'

curl -fsS -X PUT "$BASE_URL/api/v1/namespaces/$NS/datasource" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"namespace\":\"$NS\",\"dataSource\":\"default\"}"

curl -fsS "$BASE_URL/api/v1/datasources/diagnostics" \
  -H "X-NS: $NS"
```

Do not skip binding. The real failure evidence was `MODEL_VALIDATE_FAILED` in an unbound namespace, with a `MODEL` diagnostic stating `No default data source bound for namespace 'salesdrop'`. The same fixture passed after binding.

## 3. Inspect tables and run read-only SQL

```bash
curl -fsS -X POST "$BASE_URL/api/v1/tables/list" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"dataSource":"default","includeViews":true}'

curl -fsS -X POST "$BASE_URL/api/v1/tables/inspect" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"dataSource":"default","includeForeignKeys":false,"includeIndexes":true,"table":"sales_drop_daily"}'

curl -fsS -X POST "$BASE_URL/api/v1/sql/query" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"dataSource":"default","maxRows":5,"timeoutSeconds":5,"sql":"select observation_date, region, sales_drop_amount from sales_drop_daily order by sales_drop_amount desc"}'
```

SQL is only a controlled, read-only modeling/operations surface. Normal MCP queries should use the QM and semantic tools.

## 4. Register, validate, refresh, and describe the model

Validate the resource directory first:

```bash
curl -fsS -X POST "$BASE_URL/api/v1/models/validate" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"clearExisting\":true,\"includeStackTrace\":false,\"namespace\":\"$NS\",\"path\":\"$MODEL_DIR\",\"watch\":false}"
```

Register the Bundle and refresh:

```bash
curl -fsS -X POST "$BASE_URL/api/v1/bundles" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"enabled\":true,\"name\":\"sales-drop-models\",\"namespace\":\"$NS\",\"path\":\"$MODEL_DIR\",\"refresh\":false,\"replace\":true,\"validate\":false,\"watch\":true}"

curl -fsS -X POST "$BASE_URL/api/v1/models/refresh" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"namespace\":\"$NS\"}"

curl -fsS "$BASE_URL/api/v1/models" \
  -H "X-NS: $NS"

curl -fsS -X POST "$BASE_URL/api/v1/models/$MODEL/describe" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"namespace\":\"$NS\"}"
```

After refresh, this run exposed `SalesDropDailyQueryModel`; describe returned 21 fields and the `sales_drop_daily` fact table. Retain the Bundle, model-validate, and refresh responses.

## 5. Validate before execute

Save the following as `basic-query.json`, or use the same payload in the demo directory:

```json
{
  "limit": 5,
  "columns": [
    "observationDate",
    "region",
    "channel",
    "productCategory",
    "customerName",
    "customerSegment",
    "severity",
    "rootCause",
    "actionOwner",
    "netSalesAmount",
    "priorWeekNetSalesAmount",
    "salesDropAmount",
    "salesDropRate"
  ]
}
```

```bash
curl -fsS -X POST "$BASE_URL/api/v1/query/$MODEL/validate" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  --data @basic-query.json

curl -fsS -X POST "$BASE_URL/api/v1/query/$MODEL/execute" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  --data @basic-query.json
```

When validation fails, fix the model, field, or authorization context first. Do not fall back to physical columns or raw SQL to bypass the semantic layer.

## 6. Use Explain with the correct meaning

```bash
curl -fsS -X POST "$BASE_URL/api/v1/query/$MODEL/explain" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"payload\":$(tr -d '\n' < basic-query.json),\"includeSql\":false,\"includePhysicalNames\":false}"
```

When the response contains `basis: RECOMPILED`, Runtime recompiled the payload using the current model revision, caller context, and request. `executionTrace` can contain `NOT_EVALUATED`. This does not prove that a historical query executed the returned SQL.

## 7. Discover MCP tools and route requests

```bash
curl -fsS -X POST "$BASE_URL/mcp/analyst/rpc" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Recommended JSON-RPC sequence:

```bash
curl -fsS -X POST "$BASE_URL/mcp/analyst/rpc" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"dataset.list_models","arguments":{}}}'

curl -fsS -X POST "$BASE_URL/mcp/analyst/rpc" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"dataset.describe_model_internal","arguments":{"model":"SalesDropDailyQueryModel"}}}'
```

Routing rules:

- Discover models with `dataset.list_models`.
- If the model is known but fields are not, call `dataset.describe_model_internal`.
- Use `dataset.query_model` for a single-model query.
- Use `dataset.compose_script` for Join, Union, derived, or multi-plan work and return `{ plans: plan }`.
- Use `dataset.explain_query` for explanations and label `RECOMPILED` as fresh compilation evidence.
- `dataset.get_metadata` is marked Deprecated; new clients must not call it for first-pass discovery.

## 8. Retain evidence and handle failures

At minimum retain JSON for capabilities, datasource test, datasource diagnostics, model validation, Bundles, model refresh, models list/describe, and query validate/execute. On failure, record the namespace, Runtime API/schema, request path, exit code, and the response error code/phase.

This page does not authorize repair, backfill, or replay of existing business data. Use a new disposable fixture to validate a repair.
