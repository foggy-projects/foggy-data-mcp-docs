---
title: Foggy Capability Baseline and Evidence Matrix
last_reviewed: 2026-08-22
status: working-manual
---

# Foggy Capability Baseline and Evidence Matrix

This page is the current capability source for the implementation manual. It is not frozen v3.0 whitepaper content. The evidence was collected on 2026-08-22 against a disposable SQLite fixture and the Java Runtime. Production deployments must repeat the checks and add authentication, authorization, audit, network, and secret controls.

## Evidence boundary

| Item | Value in this run |
| --- | --- |
| Launcher | `foggy-runtime-launcher v0.1.17` |
| Engine | `java` |
| Runtime API | `foggy-runtime-api/v1` |
| Schema | `2026-06-06` |
| Security mode | `none-dev-test-only` |
| Namespace | `salesdrop` |
| Fixture | disposable SQLite + `sales_drop_daily` |
| Runtime source | `foggy-data-mcp-bridge`, published framework `9.2.0` |

`none-dev-test-only` is a development/test boundary, not a production security conclusion. Every deployment should read `/api/v1/capabilities` first and select the next steps from the reported capabilities.

## Capability matrix

Status meanings: `Verified` means the disposable fixture executed successfully; `Declared/not exercised` means the Runtime advertises the capability but this run did not consume it; `Conditional` depends on configuration, identity, or an optional service; `Disabled` is explicitly unavailable in this instance.

| Capability | Current status | Runtime/API or MCP entry point | Evidence and documentation decision |
| --- | --- | --- | --- |
| Readiness and capability discovery | Verified | `GET /readyz`, `GET /api/v1/capabilities` | Returned Java, API v1, and schema `2026-06-06`; every implementation flow starts here. |
| Runtime security mode | Conditional | `securityMode`, management-auth configuration | Current mode is `none-dev-test-only`; the manual must not present the local Launcher as production-ready. |
| Datasource list/test | Verified | `GET /api/v1/datasources`, `POST /api/v1/datasources/{name}/test` | The `default` datasource passed its test; diagnostics must not expose passwords or complete connection strings. |
| Namespace datasource binding | Verified | `PUT /api/v1/namespaces/{namespace}/datasource` | Model validation failed in a fresh unbound namespace; binding `default` enabled the successful flow. Binding is a model-validation prerequisite. |
| Datasource diagnostics | Verified | `GET /api/v1/datasources/diagnostics` | Reported `namespaceBindings.salesdrop=default`; `managedDatasourceCount=0` does not mean that a configured datasource is unavailable. |
| Table list and inspection | Verified | `POST /api/v1/tables/list`, `POST /api/v1/tables/inspect` | `sales_drop_daily` was inspected; this is controlled operations/modeling access, not a substitute for semantic queries. |
| Runtime SQL | Verified but restricted | `POST /api/v1/sql/query` | A read-only top-five query passed; the SQL surface must not become a normal MCP user-query endpoint. |
| Bundle registration | Verified | `GET/POST /api/v1/bundles` | `sales-drop-models` was registered before refresh; registration alone does not publish a model. |
| Model validation | Verified | `POST /api/v1/models/validate` | Passed after datasource binding; validation produces candidate diagnostics and does not replace the catalog directly. |
| Model refresh/list/describe | Verified | `/api/v1/models/refresh`, `GET /api/v1/models`, `POST /api/v1/models/{model}/describe` | Refresh exposed `SalesDropDailyQueryModel`; describe returned 21 fields and physical-table mapping. |
| Query validate/execute | Verified | `/api/v1/query/{model}/validate|execute` | A minimal 13-column, `limit=5` query passed; the manual requires validate before execute. |
| Query explain | Verified | `/api/v1/query/{model}/explain`, `dataset.explain_query` | `basis=RECOMPILED`; this is fresh compilation evidence in the current context, not a historical execution trace. |
| Compose/FSScript | Declared/not exercised | `/api/v1/compose/validate|preview|execute`, `dataset.compose_script` | The capability is supported, but this run did not turn it into an acceptance example; it needs a separate cross-model/derived fixture. |
| Authoring workspace/resources/diff/validate | Declared/not exercised | `/api/v1/authoring/...` | The capability is supported; publish, recovery, and concurrent-revision behavior need a separate management-plane acceptance run. |
| Release package export | Declared/not exercised | `/api/v1/authoring/workspaces/{id}/release-package` | Advertised as supported; this run does not claim that a release drill is complete. |
| Production apply/rollback | Disabled | `authoring.production.apply/rollback` capabilities | Explicitly disabled in this instance; the v3.0 draft must preserve this conditional/disabled wording. |
| Release package import | Disabled | `authoring.releasePackage.import` capability | Explicitly disabled; the deployment manual must not promise direct production import. |
| MCP model discovery | Verified | `dataset.list_models` | Preferred discovery tool; it returns routing information, followed by `dataset.describe_model_internal`. |
| MCP model details | Verified | `dataset.describe_model_internal` | Takes `model`; new integrations must not use `dataset.get_metadata` for first-pass discovery. |
| Legacy metadata tool | Compatibility/deprecated | `dataset.get_metadata` | `tools/list` marks it Deprecated; new integrations must migrate to list + describe. |
| Single-model query | Declared with API evidence | `dataset.query_model` | Single-model filters, grouping, time windows, and pivot route here; cross-model work must not be forced into it. |
| Cross-model composition | Declared/not exercised | `dataset.compose_script` | Use only for Join/Union/derived/multi-plan flows; scripts must return `{ plans: plan }`. |
| Chart export | Conditional | `dataset.export_with_xchart`, `dataset.export_with_echarts` | XChart is JVM-native with no browser/Node dependency; ECharts requires an optional rendering service and an explicit choice. |
| Natural-language query | Conditional | `dataset_nl.query` | Requires a ChatModel/AI Provider; structured tools should not be described as unavailable when the provider is absent. |

## Items for the v3.0 review

- Keep `DRAFT / NOT FROZEN` until the product and architecture owners confirm this matrix and the compatibility policy.
- Make datasource binding, model validate/refresh, catalog generation, and tool migration explicit implementation prerequisites.
- Define `RECOMPILED` separately from historical execution traces, and state that SQL/physical-name exposure is governed by namespace policy.
- Put the disabled/conditional state of production apply, rollback, and import in the compatibility matrix instead of promising a complete release loop early.

## Reproduction entry point

See [Runtime API and MCP Examples](./runtime-api-examples.md) for curl, MCP JSON-RPC, and CLI examples. Delivery evidence should retain the JSON responses for capabilities, datasource diagnostics, model validate/refresh, and query validate/execute.
