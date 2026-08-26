# MCP Tools and Query Routing

## Current tool surface

Use `tools/list` from the running endpoint as the final source of truth. The current Java bridge core tools include:

| Tool | Purpose | Prerequisite |
| --- | --- | --- |
| `dataset.list_models` | Preferred model discovery and routing overview | namespace |
| `dataset.describe_model_internal` | Detailed fields for one model | model name, namespace |
| `dataset.query_model` | Structured single-model query | known model and fields |
| `dataset.compose_script` | Compose/cross-model/governed composition | supported Compose payload |
| `dataset.explain_query` | Query definition, recompilation, and evidence | query payload |
| `dataset_nl.query` | Natural-language query | ChatModel/AI Provider |
| `chart.generate` | Generate chart output | query result |
| `dataset.export_with_xchart` | JVM-native XChart export | query result |
| `dataset.export_with_echarts` | ECharts export | query result and render service |

`dataset.get_metadata` is the legacy metadata entry point. New integrations should call `dataset.list_models` first and then `dataset.describe_model_internal` as needed. Tool policies or version differences may make a tool unavailable on a particular endpoint; do not rely on a static role table alone.

## Routing rules

```text
User question
  ├─ one known QM, fields, and filters → dataset.query_model
  ├─ multiple models, Join/Union, or multi-stage plan → dataset.compose_script
  ├─ plan/SQL/physical mapping evidence → dataset.explain_query
  ├─ model discovery → dataset.list_models
  └─ natural-language reasoning → dataset_nl.query (confirm AI Provider)
```

`query_model` is for one model. Route cross-model Join, Union, derived, or multi-plan work to Compose; do not pass arbitrary SQL or free-form CTEs to an MCP tool. Availability of DSL_CTE, pivot, timeWindow, and calculatedFields follows the current schema and capabilities response.

## Minimal call sequence

1. Confirm the MCP endpoint and `X-NS`.
2. Call `dataset.list_models` for model routing information.
3. Call `dataset.describe_model_internal` for the target model.
4. Validate the query before execution to catch field, schema, and policy errors.
5. Call `dataset.explain_query` when an explanation is required, labeling recompiled evidence as such.
6. Choose a chart or export tool only after the query succeeds.

## Namespace and authorization

The MCP namespace is not presentation metadata: it selects the model catalog, datasource binding, tool policy, and query context. After switching namespace, rediscover models and do not reuse the previous namespace's model cache.

When a host supplies `Authorization`, treat it as an opaque business token. It cannot replace `X-Foggy-Runtime-Code` and query payloads cannot self-submit column or row policy parameters.

## Failure handling

- Tool missing: call `tools/list` again and check endpoint, namespace, and dynamic tool policy.
- Model missing: rediscover models and check Bundle registration and refresh instead of guessing a model name.
- Field denied: reduce the field set and inspect QM/TM policy and business identity; do not fall back to physical columns or SQL.
- Compose unsupported: split into single-model queries or confirm the current governed capability; do not switch to raw SQL.
- Explain differs from a result: compare request revision, catalog generation, and execution trace; Explain alone is not a historical trace.

