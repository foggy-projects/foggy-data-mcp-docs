# LLM Semantic Layer Engine Whitepaper v2.0

The Foggy v2.0 whitepaper is the capability continuation after v1.0. It records the new query, analysis, governance, and observability capabilities implemented and signed off by the Java engine.

v2.0 does not deprecate v1.0 or replace its foundational TM/QM, JSON Query DSL, MCP tool protocol, and syntax references. Treat v1.0 as the foundation contract and v2.0 as the additional-capability and boundary specification.

## Documents

- [v2.0 Release Note](./v2.0-release-note.md)
- [Foggy LLM Semantic Layer Engine Technical Whitepaper v2.0](./foggy-data-mcp-technical-whitepaper-v2.0.md)
- [DSL_CTE Staged Analysis Reference](./dsl-cte-capability-reference.md)
- [Governed Expression Reference](./governed-expression-reference.md)
- [Memory Grid Reference](./memory-grid-reference.md)
- [Pivot v2 Reference](./pivot-v2-reference.md)
- [Experience Recipe Reference](./experience-recipe-reference.md)
- [v1.0 / v2.0 Capability Matrix](./compatibility-matrix.md)

## Audience

This version is for Java engine integrators, AI data-query platform owners, enterprise data-governance owners, and teams evaluating complex analysis capabilities who already understand the v1.0 semantic-layer fundamentals.

For the foundational concepts, read the [v1.0 whitepaper](../v1.0/) first.

## v2.0 position

- v2.0 is the follow-on capability whitepaper to v1.0; it does not declare v1.0 obsolete.
- It focuses on new capabilities with Java engine implementation and test, acceptance, or CI evidence.
- It does not republish the complete TM/QM and Query DSL syntax; those references remain in v1.0.
- Boundaries are written as narrow signed contracts, not as arbitrary SQL, arbitrary expressions, arbitrary cross-model joins, or a complete BI product.

## Reading order

1. Read the technical whitepaper for the overall capability layers.
2. Read the DSL_CTE, Governed Expression, Memory Grid, Pivot, and Experience Recipe references by domain.
3. Use the compatibility matrix to decide what a v1.0 integration should retain and what it can adopt.

