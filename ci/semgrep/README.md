# Semgrep CE policy

The pull-request workflow runs Semgrep Community Edition from a versioned,
digest-pinned container on the GitHub runner. It uses no Semgrep account, token, cloud rules, source upload,
SARIF, or GitHub Advanced Security permission.

Only the reviewed rules vendored in `.semgrep.yml` block pull requests. Keep
them narrow and high-confidence. Every rule must have an unsafe fixture in this
directory and remain covered by `validate-rules.sh`; the production scan excludes
those fixtures. The invalid configuration fixture also proves unknown rule
fields fail closed. Broad registry rules are not blocking until their findings have
owners and their false-positive policy has been reviewed.

The Week 3 report page is excluded because Semgrep 1.136 cannot parse its valid
JSX text containing a raw ampersand. The exception is exact and can be removed
when the pinned parser handles that syntax.

To run locally with Semgrep 1.136.0 on `PATH`:

```bash
ci/semgrep/validate-rules.sh
semgrep scan --strict --config .semgrep.yml --error --metrics=off \
  --disable-version-check --exclude ci/semgrep/fixtures \
  --exclude apps/web/src/app/competition/reports/2025/week-3/page.tsx
```
