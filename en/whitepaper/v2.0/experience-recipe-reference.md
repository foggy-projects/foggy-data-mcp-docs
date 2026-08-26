# Experience Recipe Capability Reference

> Version: v2.0
>
> State: signed off
>
> Implementation scope: Java/MCP minimum

An Experience Recipe is a governed reusable analysis asset. It records a signed analysis approach, required parameters, evidence, and governance conditions so a router or planner can reuse it in the right context instead of inventing a complex plan every time.

## Position

Recipes are suitable for recurring complex flows, recorded models/fields/routes/parameters/boundaries, discovery under namespace/tenant/permission/owner conditions, and auditable rejection for missing, conflicting, inactive, or unauthorized context.

A Recipe cannot bypass TM/QM, permissions, validator, or a signed contract.

## Signed capabilities

| Capability | Description |
|---|---|
| exact registry lookup | Exact `registryKey` resolution |
| discoverable gate | Select only validated records marked `activeForDiscovery` |
| governance filter | Filter by namespace, tenant, permission, and owner |
| lifecycle gate | Draft/candidate/rejected/deprecated records do not enter runtime routing |
| publish gate | Publication requires the required state and evidence |
| artifact refs | Record and echo evidence artifact references |
| hash/URI validation | Validate artifact hash form and URI shape |
| signature verifier SPI | In strict mode, missing verifier or invalid signature fails closed |
| governance-context injection | MCP request context can enter the governance chain |

## Runtime lookup semantics

`dataset.search_experience_recipes` exact lookup still applies governance filtering: the key must match; the Recipe must be validated and active for discovery; namespace, tenant, permission tags, and owner delegation must match. Exact key lookup does not bypass policy or return draft, candidate, rejected, or deprecated records.

## Evidence artifact

v2.0 records artifact references and basic validation; it does not promise a complete trusted object-storage chain. It may record references, hash form, URI shape, publish-response echo, event audit, and signature-verifier results.

It does not promise a native S3/OSS resolver, remote object permissions, KMS/trust roots, key rotation/revocation, or a complete management console.

## Fail-closed rules

Return an empty result or block publication when the key does not match, the Recipe is not validated or discoverable, namespace/tenant/permission/owner does not match, required evidence artifacts are missing, strict mode has no verifier, or the verifier returns an invalid signature.

## Not included in v2.0

- A complete Recipe marketplace.
- Vector, full-text, or hybrid retrieval.
- Recipe ranking.
- A product management console or human-review UI.
- Any bypass of the engine validator.

## Relationship to an LLM planner

A Recipe can provide structured experience to a planner, but the planner must still produce a governed plan. A hit continues through model, policy, field, size, and signed-contract validation.

