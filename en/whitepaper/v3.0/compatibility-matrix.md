---
whitepaper_status: DRAFT
frozen: false
last_reviewed: 2026-08-22
---

# v2.0 / v3.0 Candidate Capability Matrix (Draft)

> This is review material, not a frozen compatibility commitment. The table does not change the existing v2.0 public semantics.

| Capability area | v2.0 frozen position | Current Java Runtime evidence | v3.0 status |
| --- | --- | --- | --- |
| TM/QM semantic core | Published semantic layer, query DSL, and model references | bridge engine/catalog/model SPI | Retain; version mapping required |
| Single-model query | Governed structured query | `dataset.query_model`, Runtime query routes | Candidate stable |
| Compose/cross-model | v2 capability as documented | `dataset.compose_script`, Compose API | Candidate; boundary to freeze |
| DSL_CTE / Pivot / timeWindow | Layered capabilities in v2 documents | Exposed by schema/capabilities per version | Must not be claimed universally |
| Model discovery | Legacy metadata entry point | `dataset.list_models` preferred; `get_metadata` legacy | Recommended upgrade |
| Explain | Not defined as a historical execution trace | `dataset.explain_query` and Runtime explain | Evidence semantics to freeze |
| Namespace | Existing implementation/integration boundary | `X-NS`, binding, catalog isolation | Candidate public contract |
| Authoring workspace | Not a v2 core commitment | workspace, candidate, publish/recover | Candidate; production scope required |
| Release/promotion/rollback | Not a uniform v2 core contract | release package and promotion routes | Candidate; recovery semantics required |
| Authorization | Model/host boundary | management code, opaque Authorization, QM/TM policies | Public security closure required |
| AI Provider | Implementation/deployment dependent | structured tools without Provider, NL conditional | Candidate tiering |
| Charts | Historical tool name in older docs | XChart/ECharts split | Names and dependency docs must change |
| Remote datasources/addons | Not automatically core | specific addon evidence only | Keep conditional |

## Freeze evidence fields

Before freeze, each row needs an implementation version, minimum validation command, failure semantics, audit fields, compatibility strategy, Chinese/English owner, and publication date. Rows without that evidence remain candidates.

