#!/usr/bin/env python3
"""
Generate a carousel ZIP file for Carousel Editor V2.

Usage:
  python3 generate-carousel.py --schema schema.json --output carousel.zip [--assets ./assets]
  python3 generate-carousel.py --schema schema.json  # defaults to carousel.zip in current dir

The ZIP file contains:
  schema.json          — Carousel schema document
  assets/              — Image files referenced by the schema (if any)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import zipfile


def find_asset_refs(schema):  # type: (dict) -> list[str]
    """Extract all asset references from the schema (assets/... paths)."""
    refs = set()

    # Check slide backgroundImage fields
    for slide in schema.get("slides", []):
        bg_img = slide.get("backgroundImage")
        if bg_img and bg_img.startswith("assets/"):
            refs.add(bg_img)

        # Check element src fields (image elements)
        for elem in slide.get("elements", []):
            src = elem.get("src", "")
            if src and src.startswith("assets/"):
                refs.add(src)

    return sorted(refs)


def validate_schema(schema):  # type: (dict) -> list[str]
    """Basic validation matching the editor's import requirements."""
    errors = []
    if not isinstance(schema.get("version"), (int, float)):
        errors.append('Field "version" missing or not a number')
    if not isinstance(schema.get("slides"), list):
        errors.append('Field "slides" missing or not an array')
    if not isinstance(schema.get("theme"), dict):
        errors.append('Field "theme" missing or not an object')
    if not isinstance(schema.get("canvas"), dict):
        errors.append('Field "canvas" missing or not an object')
    return errors


def build_zip(schema_path, output_path, assets_dir=None):  # type: (str, str, str|None) -> None
    # Read and validate schema
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    errors = validate_schema(schema)
    if errors:
        print(f"Schema validation failed:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        sys.exit(1)

    # Find referenced assets
    asset_refs = find_asset_refs(schema)

    # Determine assets source directory
    if assets_dir is None:
        # Look for assets/ relative to schema file
        schema_dir = os.path.dirname(os.path.abspath(schema_path))
        candidate = os.path.join(schema_dir, "assets")
        if os.path.isdir(candidate):
            assets_dir = schema_dir
        else:
            assets_dir = os.getcwd()

    # Build ZIP
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add schema.json (pretty-printed)
        schema_json = json.dumps(schema, indent=2, ensure_ascii=False)
        zf.writestr("schema.json", schema_json)

        # Add asset files
        added = []
        missing = []
        for ref in asset_refs:
            # ref is like "assets/photo.jpg"
            file_path = os.path.join(assets_dir, ref)
            if os.path.isfile(file_path):
                zf.write(file_path, ref)
                added.append(ref)
            else:
                missing.append(ref)

        # Also add any extra files from assets_dir/assets/ not in schema
        assets_folder = os.path.join(assets_dir, "assets")
        if os.path.isdir(assets_folder):
            for fname in sorted(os.listdir(assets_folder)):
                fpath = os.path.join(assets_folder, fname)
                ref = f"assets/{fname}"
                if os.path.isfile(fpath) and ref not in added:
                    zf.write(fpath, ref)
                    added.append(ref)

    # Report
    slide_count = len(schema.get("slides", []))
    print(f"Created: {output_path}")
    print(f"  Slides: {slide_count}")
    print(f"  Assets: {len(added)} files")
    if missing:
        print(f"  Missing assets (not found):", file=sys.stderr)
        for m in missing:
            print(f"    - {m}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="Generate carousel ZIP for Carousel Editor V2")
    parser.add_argument("--schema", required=True, help="Path to schema.json file")
    parser.add_argument("--output", default="carousel.zip", help="Output ZIP file path (default: carousel.zip)")
    parser.add_argument("--assets", default=None, help="Base directory containing assets/ folder (default: same dir as schema)")
    args = parser.parse_args()

    if not os.path.isfile(args.schema):
        print(f"Error: Schema file not found: {args.schema}", file=sys.stderr)
        sys.exit(1)

    build_zip(args.schema, args.output, args.assets)


if __name__ == "__main__":
    main()
