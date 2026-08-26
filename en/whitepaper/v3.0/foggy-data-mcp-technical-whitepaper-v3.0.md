---
whitepaper_status: DRAFT
frozen: false
last_reviewed: 2026-08-22
---

# Foggy Data MCP Technical Whitepaper v3.0 (Draft)

> **DRAFT / NOT FROZEN.** This document is a review boundary for the next Runtime, MCP, model-lifecycle, and governance release. “Current implementation” means evidence found in the current Java bridge baseline; “candidate” does not mean a compatibility promise.

## 1. Objective

The v3.0 draft describes Foggy as a governed semantic data runtime. An AI client submits a business-semantic request through MCP or the Runtime API, and the Runtime validates, compiles, executes, and returns evidence within namespace, model, policy, and datasource boundaries.

Principles:

- AI addresses TM/QM semantic models instead of physical schemas or arbitrary SQL;
- namespace is the isolation axis for datasource, Bundle, model catalog, tool policy, and query context;
- validation and refresh are separate, with refresh publishing a catalog generation atomically;
- management authentication is separate from business identity;
- explain recompilation evidence is not a historical execution trace;
- public documentation promises only capabilities that are verified and repeatable.

## 2. Runtime planes

```text
MCP client / Runtime API client
          │ namespace + identity
          ▼
Runtime API / MCP dispatch
  ├─ tool policy and audit
  ├─ TM/QM catalog and Bundle lifecycle
  ├─ governed query planning / dialect translation
  └─ candidate authoring and release coordination
          ▼
Datasource registry and namespace binding
          ▼
MySQL · PostgreSQL · SQL Server · SQLite · optional backends
```

Runtime identity includes at least namespace, datasource binding generation, Bundle/resource revision, model catalog generation, and backend provider identity. Omitting these dimensions from a cache or asynchronous task can cause cross-namespace reads or stale-model behavior.

## 3. Bundle and model lifecycle

Bundle registration records a resource source; it does not claim that resources compile or become query-visible. The intended lifecycle is:

```text
register/update
  → inspect and conflict-check
  → persist registry
  → explicit validate
  → explicit refresh
  → atomically publish catalog generation
```

`validate` builds a candidate and returns diagnostics without replacing the live model. `refresh` publishes a new generation after admission. A failed refresh keeps the previously published generation available.

The current Runtime also exposes authoring workspaces, candidate queries, immutable published artifacts, publish/recover, release packages, production promotion, rollback, and lifecycle inventory. These are management-plane capabilities and must not be confused with normal MCP data queries.

## 4. Candidate MCP contract

The current routing candidate is:

| Scenario | Tool |
| --- | --- |
| Model discovery | `dataset.list_models` |
| Model field description | `dataset.describe_model_internal` |
| Single-model query | `dataset.query_model` |
| Cross-model/composed query | `dataset.compose_script` |
| Compilation and evidence explanation | `dataset.explain_query` |
| Natural-language query | `dataset_nl.query` (requires an AI Provider) |
| Chart/export | `chart.generate`, `dataset.export_with_xchart`, `dataset.export_with_echarts` |

`dataset.get_metadata` moves to a compatibility/migration position. `query_model` remains a governed single-model DSL boundary; Join, Union, derived, and multi-plan work goes to Compose. Raw SQL, free-form CTE, and internal governance fields are not normal MCP inputs.

## 5. Query evidence

Runtime API and MCP may return validation, compiled-plan, SQL/physical-name mapping, and explain information. Evidence must identify its source and time:

- definition evidence: model or Bundle definition;
- recompiled evidence: a plan/SQL built again for this request;
- execution evidence: the actual execution trace, result boundary, and audit record.

Recompiled explain output is not a historical execution record. Production reports should preserve the three evidence types separately.

## 6. Authorization and trust boundaries

- `X-Foggy-Runtime-Code` controls the Runtime management plane;
- `Authorization` is an optional opaque business identity interpreted by model policy;
- `X-NS` selects the isolated context;
- callers cannot submit internal governance parameters such as `fieldAccess`, `deniedColumns`, `systemSlice`, or `policySnapshotId`;
- FSScript model code is trusted published code, and raw script execution is not an ordinary data-query route;
- `tools.config.js` controls tool exposure/routing, not the complete security boundary.

The current implementation makes the AI Provider optional: structured tools can work independently, while the NL tool is conditionally enabled. Production still needs authentication, business identity, audit, and network egress controls; the Launcher's default development mode is not a production security baseline.

## 7. Charts and extensions

XChart is a JVM-native export path; ECharts uses an optional external render service. Both inherit query field, row-policy, audit, and result-size controls. Optional addons, Odoo, cache, vector, pre-aggregation, and remote-datasource behavior must be declared against their specific implementation and capabilities; this draft does not automatically promote them to core GA contracts.

## 8. Freeze decisions still required

Before v3.0 can be frozen, confirm:

1. stable Runtime API and MCP tool names, error envelopes, and version policy;
2. the public security contract for namespace, management authentication, and business Authorization;
3. production scope for authoring, release, promotion, and rollback;
4. evidence fields and retention responsibilities for explain, audit, and provenance;
5. capability tiers for Compose, DSL_CTE, pivot, timeWindow, charts, and AI Providers;
6. compatibility and minimum validation evidence across Java, Python, Odoo, and other implementations.

Until those decisions are confirmed, downstream documentation must not describe candidate behavior as stable support.

