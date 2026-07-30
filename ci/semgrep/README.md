# Semgrep CE policy

The pull-request workflow runs Semgrep Community Edition from a versioned,
digest-pinned container on the GitHub runner. It uses no Semgrep account, token,
cloud rules, source upload, SARIF, or GitHub Advanced Security permission.

Only the reviewed rules vendored in `.semgrep.yml` block pull requests. Keep
them narrow and high-confidence. Every rule must have an unsafe fixture in this
directory and remain covered by `validate-rules.sh`; the production scan
excludes those fixtures. The invalid configuration fixture also proves unknown
rule fields fail closed. Broad registry rules are not blocking until their
findings have owners and their false-positive policy has been reviewed.

These custom rules are narrow defense-in-depth checks. Native invariant tests
and repository lint remain authoritative for privacy and application behavior;
this policy does not claim generic sensitive-logging coverage.

The Week 3 report uses the render-equivalent `&amp;` JSX entity so the pinned
Semgrep parser can scan the complete product file without an exclusion.

To run locally with Semgrep 1.136.0 on `PATH`:

```bash
ci/semgrep/validate-rules.sh
semgrep scan --strict --config .semgrep.yml --error --metrics=off \
  --disable-version-check --exclude ci/semgrep/fixtures
```
