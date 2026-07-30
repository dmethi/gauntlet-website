# Semgrep CE policy

The pull-request workflow runs pinned Semgrep Community Edition locally on the
GitHub runner. It uses no Semgrep account, token, cloud rules, source upload,
SARIF, or GitHub Advanced Security permission.

Only the reviewed rules vendored in `.semgrep.yml` block pull requests. Keep
them narrow and high-confidence. Every rule must have an unsafe fixture in this
directory and remain covered by `validate-rules.sh`; the production scan excludes
those fixtures. Broad registry rules are not blocking until their findings have
owners and their false-positive policy has been reviewed.

To run locally with Semgrep 1.136.0 on `PATH`:

```bash
ci/semgrep/validate-rules.sh
semgrep scan --config .semgrep.yml --error --metrics=off \
  --disable-version-check --exclude ci/semgrep/fixtures
```
