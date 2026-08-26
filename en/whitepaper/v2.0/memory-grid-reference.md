# Memory Grid Capability Reference

> Version: v2.0
>
> State: signed off
>
> Implementation scope: Java engine

Memory Grid is the bounded-result secondary-analysis boundary in v2.0. It supports lightweight alignment, derivation, and review across governed query results; it does not import database detail into an arbitrary in-memory SQL engine.

## Position

Memory Grid is suitable for bounded merges, actual/target/forecast alignment, small-result derivation, and multi-step analysis that needs handles, resource limits, and audit evidence.

It is not for unbounded detail, large-scale computation, free in-memory SQL, or a long-lived analytical warehouse.

## Signed capabilities

| Capability | Description |
|---|---|
| opaque result handle | A governed result is written to a handle; the LLM does not receive raw rows or a storage reference |
| store-backed resolver | Resolves bounded rows through the handle |
| production guard descriptor | Reports backend, replay mode, bounded-input requirement, limits, unsupported shapes, and fail-closed codes |
| lifecycle manager | Provides inspect, cleanup, expired, invalidated, and read-exhausted evidence |
| resource limits | Validates input count, row limit, output limit, and cell count |
| cross-model alignment contract | Requires a signed alignment contract for multiple model inputs |
| execution evidence | Validation and execution echo guard, alignment, and resolver audit |

## Guard descriptor

`memory_grid_guard` should expose the guard profile, handle backend and replay mode, bounded-input requirement, `request_rows_allowed=false`, `grid_sql_supported=false`, input/output/cell limits, supported and unsupported shapes, fail-closed codes, lifecycle capability, and the cross-model alignment requirement.

## Cross-model alignment

The v2.0 templates include:

- `bounded_cross_model_metric_merge@v1`;
- `bounded_target_achievement_merge@v1`;
- `bounded_forecast_deviation_merge@v1`.

The contract binds input roles, match keys consistent with Memory Grid join keys, grain, version or scenario (especially target/forecast), and a derived formula consistent with the Memory Grid derived expression.

Missing any of these facts is fail-closed.

## Lifecycle evidence

Expose only safe summaries: total/active/expired/invalidated/read-exhausted counts, deleted handle and storage-reference counts, and failure codes. Do not expose raw rows or bare `storage_ref` values.

## Not included in v2.0

- Free Grid SQL or arbitrary DuckDB API.
- Full outer join or multi-key join.
- Unsigned windows, nested expressions, or external functions.
- DML/DDL.
- A real durable backend, distributed lock, background scheduler, or complete admin API.
- Complete cross-service auth replay.

## Relationship to DSL_CTE

DSL_CTE owns governed stage plans; Memory Grid owns bounded alignment between governed result sets. Cross-model analysis should use a Memory Grid alignment contract instead of enlarging DSL_CTE into a free Join surface.

