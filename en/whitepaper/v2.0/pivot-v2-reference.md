# Pivot v2 Capability Reference

> Version: v2.0
>
> State: narrow contract available
>
> Implementation scope: Java engine

Pivot v2 is the governed multi-dimensional pivot Runtime contract. It exposes axes, windows, tree structure, and drilldown boundaries as auditable evidence rather than leaving pivot semantics to ad-hoc frontend interpretation.

## Position

Pivot is suitable for row/column/metric matrices over governed aggregates, parent-child row trees, controlled axis windows and pagination, and cascade drilldown evidence. It is not a complete BI pivot product.

## Runtime contract

The v2.0 response should expose `pivotEngineContract` in debug metadata with contract name/version, `signed=true`, output format, row/column fields, metrics, execution path, axis and tree-axis contracts, drilldown contract, required capabilities, unsupported combinations, and unsigned shapes.

## Signed capabilities

| Capability | Description |
|---|---|
| tree axis | Parent-child tree on the rows axis |
| axis window | Axis-domain window, limit, offset, and effective-offset evidence |
| axis domain selection | Controlled axis-domain selection |
| cascade drilldown | Cascade path generation and required capability evidence |
| derived metric scope | Derived metrics within the signed Pivot scope |
| weekday dialect parity | Consistent weekday semantics across relevant dialects |

## Tree-axis boundary

The current signed shape is a parent-child tree on the rows axis with explicit hierarchy field, dimension, ID field, and visible skeleton-node evidence.

Columns trees, cross-join trees, tree-axis domainSlice start/offset, domain-tree cursors, and arbitrary interactive expand/collapse state are not signed.

## Drilldown boundary

The drilldown contract can describe axis-domain selection, a per-parent child window, and implemented cascade paths. It must not be generalized into a domain-tree cursor or treat frontend interaction state as engine semantics.

## Dialect evidence

v2.0 may claim narrow evidence for SQLite fixtures, MySQL8/PostgreSQL Pivot parity, PostgreSQL P2 DSL_CTE/Pivot environment-gated evidence, and SQL Server weekday parity. These are not a complete SQL Server release gate.

## Fail-closed rules

Reject or mark unsigned any unsupported rows/columns tree, domainSlice start/offset, interactive expand/collapse, multi-level domain cursor, unauthorized field/metric, or invisible axis field.

## Relationship to product UI

Pivot v2 is an engine contract, not a product UI. A frontend may render tree axes, drilldowns, and unsupported shapes from `pivotEngineContract`; it cannot use UI logic to sign semantics the engine has not implemented.

