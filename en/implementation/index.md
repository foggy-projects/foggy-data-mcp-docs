---
title: Foggy Implementation Manual
last_reviewed: 2026-08-22
status: working-manual
---

# Foggy Implementation Manual

This manual is for teams deploying the Java Runtime, authoring semantic models, connecting MCP clients, and operating releases. It describes the current implementation path; it does not replace the frozen v1.0/v2.0 public semantic contracts.

> Current baseline: `foggy-runtime-launcher v0.1.17`, Java 17+, and the published framework version `9.2.0`. The Launcher is a local development/test distribution. Production deployments need separate authentication, network, datasource, secret, and audit controls.

## Recommended delivery order

| Stage | Must be complete | Primary evidence |
| --- | --- | --- |
| Runtime | Start, readiness, capability discovery | `/readyz`, `/api/v1/capabilities` |
| Datasource | Register, test, bind to namespace | diagnostics and test response |
| Semantic layer | Register Bundle, validate models, refresh | validation/refresh response and generation |
| MCP | Configure endpoint and `X-NS`, discover tools | `tools/list`, one governed query |
| Production | Management auth, business identity, audit, recovery | production checklist and drill record |

## Manual navigation

- [Runtime Quick Deployment](./quick-start.md): start the Launcher or source build and collect initial evidence.
- [Capability Baseline and Evidence](./capability-matrix.md): distinguish verified, conditional, unexercised, and disabled capabilities.
- [Runtime API Operations](./runtime-api.md): datasource, Bundle, model, query, and Compose ordering.
- [Runtime API and MCP Examples](./runtime-api-examples.md): reproducible curl, CLI, and JSON-RPC acceptance requests.
- [MCP Tools and Query Routing](./mcp-operations.md): discovery, single-model/cross-model routing, and evidence.
- [Model and Bundle Lifecycle](./model-lifecycle.md): registration, validation, refresh, authoring, publish, and recovery.
- [Security and Governance](./security-governance.md): namespaces, management authentication, business Authorization, and script boundaries.
- [Operations Runbook](./operations-runbook.md): startup checks, diagnostics, change records, and failure handling.

## Documentation status

- `stable`: a published, frozen public contract; only wording, links, terminology, and risk statements may be corrected.
- `working-manual`: an operational manual updated against verifiable Runtime behavior.
- `DRAFT / NOT FROZEN`: the v3.0 whitepaper draft, pending owner confirmation and not a compatibility commitment.

The v3.0 whitepaper intentionally remains `DRAFT / NOT FROZEN`. Until it is confirmed, implementation teams must use capability discovery, current schemas, and executed validation as the source of truth rather than treating draft statements as stable requirements.
