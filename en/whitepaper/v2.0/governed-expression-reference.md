# Governed Expression Capability Reference

> Version: v2.0
>
> State: narrow contract available
>
> Implementation scope: Java compiler/validator

Governed Expressions are the small formula surface for relation result stages. They calculate ratios, differences, deviations, labels, and buckets from visible metric aliases produced by an earlier stage.

They are not an arbitrary expression language or a way for an LLM to write SQL fragments.

## Signed expression surface

| Expression | Use | Boundary |
|---|---|---|
| metric ratio | `metricA / metricB` share, average, or conversion rate | Signed aliases only |
| metric difference | `metricA - metricB` | Signed aliases only |
| metric delta ratio | `(metricA - metricB) / metricB` deviation rate | Baseline must be explicit |
| absolute metric delta ratio | Absolute deviation rate | Explicit absolute-value semantics only |
| single-threshold label | One-threshold CASE label | No arbitrary CASE |
| ordered numeric bucket | Explicit ordered buckets for one numeric alias | Label postSlice only supports equality-like operators |
| same-stage alias DAG | Automatic layering of signed alias dependencies | Acyclic DAG only |
| signed ranking | Narrow result-stage `rank()` contract, such as cumulative contribution | Other ranking functions are unsigned |

## Alias dependency rules

Expressions may reference aggregate-stage metric aliases, signed aliases from the previous derive stage, and aliases made visible by same-stage DAG layering.

They may not reference physical fields, unauthorized fields, fields absent from the previous output, unsigned functions, or arbitrary SQL fragments.

## Ordered bucket contract

The signed form requires one visible numeric alias, explicit numeric thresholds, short single-line literal labels, an explicit else label, and equality-like postSlice operations (`=`, `!=`, `<>`) on the bucket label.

Multi-field buckets, nested CASE, dynamic labels, and range filtering on labels are not supported.

## Ranking contract

The current narrow ranking contract requires `rank_function=rank`, an explicit metric and direction, a deterministic tie-breaker, an explicit running-total frame, and postSlice limited to allowed aliases and operators. `dense_rank()`, `row_number()`, `percent_rank()`, `cume_dist()`, and `ntile()` are not v2.0 signed ranking.

## Fail-closed rules

Reject arbitrary SQL expressions, arbitrary functions, arbitrary CASE, free aggregate/window embedding, same-stage alias cycles, a derived alias where only aggregate metric aliases are signed, or any expression that constructs unauthorized field access.

## Rationale

Business analysis needs small formulas, but a free expression language quickly breaks semantic-layer boundaries. v2.0 signs a formula subset so common calculations work while the validator can determine whether the formula, aliases, visibility, postSlice, orderBy, and Pivot references are safe.

