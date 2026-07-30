from __future__ import annotations

import sys
from pathlib import Path

import jsonschema
import semgrep
from ruamel.yaml import YAML


ALLOWED_RULE_KEYS = {
    "id",
    "languages",
    "message",
    "mode",
    "pattern",
    "pattern-either",
    "pattern-sinks",
    "pattern-sources",
    "patterns",
    "severity",
}


def main() -> None:
    config_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".semgrep.yml")
    schema_path = Path(semgrep.__file__).parent / "semgrep_interfaces" / "rule_schema_v1.yaml"
    yaml = YAML(typ="safe")
    config = yaml.load(config_path.read_text(encoding="utf-8"))
    schema = yaml.load(schema_path.read_text(encoding="utf-8"))
    unknown_fields = [
        (index, sorted(set(rule) - ALLOWED_RULE_KEYS))
        for index, rule in enumerate(config.get("rules", []))
        if set(rule) - ALLOWED_RULE_KEYS
    ]
    if unknown_fields:
        for index, fields in unknown_fields:
            print(f"{config_path}:rules.{index}: unknown fields: {fields}", file=sys.stderr)
        raise SystemExit("Semgrep configuration contains unreviewed rule fields")
    errors = sorted(jsonschema.Draft7Validator(schema).iter_errors(config), key=lambda error: list(error.path))
    if errors:
        for error in errors:
            location = ".".join(str(part) for part in error.absolute_path) or "<root>"
            print(f"{config_path}:{location}: {error.message}", file=sys.stderr)
        raise SystemExit("Semgrep configuration failed strict schema validation")
    print(f"Semgrep configuration schema passed ({len(config.get('rules', []))} rules).")


if __name__ == "__main__":
    main()
