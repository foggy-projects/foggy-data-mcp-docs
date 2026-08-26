# v1.0 / v2.0 Capability Matrix

> Version position: v2.0
>
> Purpose: explain how v2.0 follows v1.0 while retaining the foundational semantic-layer contract.

v2.0 is not a deprecation statement for v1.0. TM/QM, JSON Query DSL, MCP tools, governance, and query evidence remain the foundation. v2.0 adds Java-first complex analysis, trace, Memory Grid, Pivot, and Experience Recipe capabilities.

## Overall relationship

| Dimension | v1.0 | v2.0 | Upgrade guidance |
|---|---|---|---|
| Documentation role | Foundational semantic-layer whitepaper | Additional-capability whitepaper | Keep v1.0 as the syntax/concept entry point |
| Implementation position | Implemented foundational capability | Java-first additions | Do not infer parity for every language or deployment |
| Boundary | Semantic query, MCP, Compose, governance, evidence | Complex analysis, trace, Memory Grid, Pivot, Recipe | Adopt each addition as a signed contract |
| Release relationship | Frozen maintenance | Follow-on evolution | Do not append new capabilities to v1.0 |

## Capability comparison

| Area | v1.0 | v2.0 | Compatibility |
|---|---|---|---|
| TM/QM modeling | Covered | Inherited | v2.0 does not rewrite the foundational syntax |
| JSON Query DSL | Covered | Inherited as the base query surface | Existing request models do not need rewriting |
| MCP tools | Discovery, description, query, composition | Java MCP redispatch and trace evidence | Existing entry points remain; debug/evidence fields may be added |
| Governance | Field validation, model visibility, row slices | Extended to Recipe, Memory Grid, and Pivot contracts | v2.0 does not relax policy boundaries |
| Query evidence | Payload, SQL, status, result sample | Trace, stage plan, contract, and Recipe evidence | Integrations should tolerate additional debug information |
| Compose | Multi-step query and intermediate-result analysis | Cooperates with DSL_CTE and Memory Grid layers | Prefer signed stage plans for complex analysis |
| DSL_CTE | Not a v1.0 primary capability | Narrow staged-analysis contract | Use signed stages and bridge templates only |
| Governed Expression | Basic calculated fields and query-time calculations | Signed result-stage formula subset | Do not replace it with a free expression language |
| Period-over-period | Follow-up or local capability | Narrow month/quarter comparison templates | Do not generalize to arbitrary calendars |
| Funnel/attribution | Follow-up or local capability | CRM funnel, target-event window, target-month bucket templates | Not a generic funnel |
| Memory Grid | Composition direction | Bounded secondary analysis, handle lifecycle, alignment contract | Bounded result handles only |
| Pivot | Basic or component-level capability | Tree axis, axis window, cascade drilldown contract | Not a complete BI pivot product |
| Experience Recipe | Follow-up direction | Exact registry lookup, governance filter, publish gate, signature SPI | Not a marketplace or vector search |
| Database dialects | Abstracted dialect foundation | Additional complex-analysis parity evidence | Narrow evidence is not a full release gate |
| Python parity | May have an independent implementation | v2.0 is Java-first | Check parity records separately |

## Integration impact

Existing v1.0 integrations can keep:

- TM/QM model structures;
- basic JSON Query DSL;
- basic MCP list/describe/query calls;
- basic policy and row-slice strategies.

Recommended additions:

- display or record trace IDs, debug evidence, and contract evidence;
- introduce signed DSL_CTE, Memory Grid, or Pivot contracts for recurring complex analysis instead of expanding free prompts;
- use Experience Recipe for recurring analysis while retaining namespace, tenant, permission, and owner filtering;
- clarify or reject unsigned scenarios rather than falling back to bare SQL.

## Migration order

1. Enable non-blocking trace and evidence display.
2. Validate signed DSL_CTE stages in read-only scenarios.
3. Pilot signed result-stage formulas in a small set of use cases.
4. Enable contract evidence for explicitly supported Pivot shapes.
5. Introduce Memory Grid alignment contracts for bounded cross-model results.
6. Capture recurring complex analysis as Experience Recipes.

## Incompatibility risks

- Treating Java-first v2.0 behavior as synchronized across Python or every deployment.
- Treating a signed contract as a generalized capability.
- Ignoring unsigned shapes in debug evidence.
- Allowing a Recipe to bypass model, policy, or validator checks.
- Treating Memory Grid as an unbounded in-memory SQL engine.
- Treating a Pivot contract as a complete frontend BI product.

## Conclusion

v1.0 remains the foundational semantic-layer contract; v2.0 describes additional complex-analysis capability. Upgrade by inheriting the foundation, signing each addition, making evidence visible, and failing closed.

