# Model and Bundle Lifecycle

## Runtime identity

A model must not be identified only by its name. Troubleshooting and caches should record at least:

- namespace;
- datasource identity and binding generation;
- Bundle/resource revision;
- model catalog generation;
- backend provider identity.

Missing one of these dimensions can cause cross-namespace reads or stale-model behavior.

## Bundle lifecycle

```text
resource register/update
  → canonical-name conflict check
  → persist registry
  → explicit validate
  → explicit refresh
  → atomic catalog generation
```

Registration is not query visibility. TM/QM/FSScript parsing or admission failures must reject the change; do not partially write and rely on a background repair.

## Validate versus refresh

| Action | Effect | Replaces live catalog |
| --- | --- | :---: |
| validate | Build a candidate, parse resources, return structural/semantic diagnostics | No |
| refresh | Rebuild, admit, and atomically publish a new generation | Yes, on success |

If refresh fails, the previously published generation remains available. After a successful refresh, verify namespace, source revision, binding generation, and catalog generation together.

## Authoring workspace

An authoring workspace stores drafts, diffs, complete validation evidence, and governed candidate queries without directly changing the live catalog. Implementations should follow these rules:

1. A workspace fixes one namespace and one enabled Runtime-managed external Bundle.
2. Save/delete uses an expected head and content-addressed revisions/hashes.
3. Content changes invalidate validation evidence; source Bundle or namespace drift moves the workspace to `STALE`.
4. Candidate queries accept only the exact current, fully validated revision.
5. Candidates do not use shared L1/L2 cache, pre-aggregation, or hybrid query, and do not publish the live catalog.

## Publish, promotion, and recovery

Development publish starts from an exact validated candidate, creates an immutable artifact, then switches the Bundle source, registry, and full-namespace refresh. If any step cannot prove recovery to the exact base, preserve evidence and enter `RECOVERY_REQUIRED`; never guess over an unknown live change.

Production promotion is explicit, and an imported release package must be revalidated against the target datasource and policies. Development validation is not automatically production validation. Rollback accepts only the same package/candidate/apply attempt while the live identity has not drifted due to a third party.

## Change evidence

Preserve at least:

- namespace, Bundle name, and source/revision identity;
- validation result, diagnostics, and validation time;
- refresh/publish catalog generation;
- actor, management-auth audit, and trace ID;
- recovery state and `safeToAutoRepair` decision on failure.

Artifact lifecycle inventory is read-only diagnosis, not retention or deletion authorization. Do not turn an “unreachable” report into an automatic cleanup action.

