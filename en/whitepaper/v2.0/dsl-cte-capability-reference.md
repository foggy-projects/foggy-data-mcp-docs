# DSL_CTE Staged Analysis Capability Reference

> Version: v2.0
>
> State: narrow contract available
>
> Implementation scope: Java engine

DSL_CTE is the v2.0 structured stage plan for complex analysis. It does not expose arbitrary SQL CTEs to the LLM; the Java engine validates, compiles, and executes a governed multi-stage plan.

## Position

v1.0 JSON Query DSL is suitable for one filtering, grouping, aggregation, and ordering operation. DSL_CTE covers more complex but still governable analysis:

- aggregate, then derive a metric;
- output aliases, then apply result-stage filtering or ordering;
- calculate cumulative contribution or ranking under a signed window contract;
- use limited bridge templates for period comparison, funnel, SLA, or attribution scenarios.

Every stage field, alias, formula, and output must be verifiable.

## Signed capabilities

| Stage/contract | Capability | v2.0 position |
|---|---|---|
| `aggregate` | Governed filtering, grouping, and metric aggregation | May feed a downstream stage |
| `derive` | Signed formula over aliases from the previous stage | No physical-field reference |
| `window_derive` | Narrow windows such as cumulative contribution and signed `rank()` | No arbitrary window function |
| `postSlice` | Filter result-stage aliases | Must not be silently pushed into source filtering |
| `orderBy` / `limit` | Order/truncate by output, groupBy, or signed aliases | No invisible fields |
| bridge template | Month/quarter comparison, CRM funnel, SLA, target-event/target-month | All template parameters are required |

## Plan boundary

A stage plan should retain source model or previous-stage input, filters/systemSlice/policy context, grouping grain, metrics and aggregate aliases, derived aliases and dependencies, window contract, ordering/frame/postSlice policy, output aliases, and evidence metadata.

Missing time range, grouping grain, alignment key, version, or scenario is a clarification or rejection case.

## Fail-closed rules

Reject requests that:

- reference physical tables, physical columns, or unauthorized fields;
- reference an alias absent from the previous stage output;
- disguise result-stage filtering as source filtering;
- use an unsigned stage type;
- use an unsigned window function, arbitrary SQL expression, or free JOIN;
- omit a Memory Grid alignment contract for cross-model analysis.

## Not included in v2.0

- Arbitrary SQL CTE.
- Arbitrary cross-model SQL join.
- Free physical-table query.
- Generic period comparison, funnel, or attribution.
- Automatic inference of fiscal calendars, custom calendars, or business phases.

## Relationship to other capabilities

- Governed Expression provides the signed formulas used by `derive` and result-stage calculations.
- Memory Grid provides bounded alignment for cross-model results instead of expanding DSL_CTE into a free Join surface.
- Pivot is an independent contract and should not be mixed into arbitrary DSL_CTE shapes.
- Experience Recipe may capture frequent analysis, but it cannot bypass the DSL_CTE validator.

