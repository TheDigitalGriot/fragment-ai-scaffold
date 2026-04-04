#!/usr/bin/env python3
"""Detect which Fragment surfaces exist in the current project."""

import json
import os
import sys
from pathlib import Path


def detect_surfaces(project_dir: str) -> dict:
    """Detect which surfaces exist and their status."""
    apps_dir = Path(project_dir) / "apps"

    surfaces = {}
    for surface in ["electron", "vscode", "tui"]:
        surface_dir = apps_dir / surface
        if surface_dir.exists():
            surfaces[surface] = {
                "exists": True,
                "path": str(surface_dir),
                "has_package_json": (surface_dir / "package.json").exists(),
                "has_go_mod": (surface_dir / "go.mod").exists(),
            }
        else:
            surfaces[surface] = {"exists": False}

    # Check for AI plugin
    plugin_manifest = None
    for candidate in [
        Path(project_dir) / ".claude-plugin" / "plugin.json",
        Path(project_dir) / "plugins" / "*" / ".claude-plugin" / "plugin.json",
    ]:
        for match in Path(project_dir).glob(str(candidate.relative_to(project_dir))):
            if match.exists():
                with open(match) as f:
                    plugin_manifest = json.load(f)
                break

    return {
        "project_dir": project_dir,
        "surfaces": surfaces,
        "plugin": plugin_manifest,
    }


def main():
    project_dir = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    result = detect_surfaces(project_dir)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
