# HumanLayer Task Queue

These are groomed task briefs for trying HumanLayer against roadmap work. Each
task should start from HumanLayer workspace setup, not the main working tree.

## Gauntlet Website Specification Audit

Source: `ROADMAP.md` Cross-cutting website audit.

### Summary

Run the Website Specification checklist against Gauntlet's public web app and
turn findings into separate scoped follow-up items. This is an audit/artifact
task, not a fix pass.

### HumanLayer Fit

- Good first low-risk Gauntlet task because it exercises artifact review, route
  inspection, screenshots, and issue grooming without touching league registry
  or season-readiness code.
- Produces a durable audit artifact that can be reviewed before any code work.

### Read First

- `docs/AGENTS.md`
- `docs/ISSUE_GROOMING.md`
- `ROADMAP.md`
- `SCRATCHPAD.md`

### In Scope

- Audit public routes against `https://specification.website/`.
- Cover foundations, SEO, accessibility, security headers, well-known URIs,
  agent readiness, performance, privacy, resilience/error pages, and
  internationalisation assumptions.
- Produce an artifact with findings grouped by severity and affected route.
- Convert actionable findings into small follow-up task briefs or roadmap
  bullets.

### Out of Scope

- Do not bundle fixes into the audit.
- Do not change league data processing.
- Do not require real 2026 season data.
- Do not combine league data before the presentation layer.

### Verification

- Run the app locally if needed.
- Use browser screenshots for any visual/accessibility findings.
- Run no broad test suite unless code changes are intentionally made later.

### Stop Conditions

- Stop if a finding requires changing league registry semantics.
- Stop if a fix would be needed to validate the audit itself.
- Stop if the route depends on unavailable real 2026 season data.
