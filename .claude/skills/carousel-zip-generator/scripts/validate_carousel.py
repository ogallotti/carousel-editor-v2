#!/usr/bin/env python3
"""
Validate a carousel schema.json against CarouselSchema v1 rules + editorial quality.

Usage:
  python3 validate_carousel.py schema.json
  python3 validate_carousel.py schema.json --strict
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

VALID_LAYOUTS = {
    "cover", "title-body", "full-text", "image-top", "image-bottom",
    "image-full", "quote", "list", "highlight", "cta", "freeform",
}

VALID_ELEMENT_TYPES = {
    "tag", "heading", "paragraph", "subtitle", "emoji", "image",
    "overlay", "quote", "list-item", "highlight", "divider", "spacer",
}

REQUIRED_THEME_COLORS = {
    "background", "backgroundSubtle", "text", "textSecondary", "textMuted",
    "highlight", "accent", "divider", "cardBackground",
    "highlightSoft", "highlightBorder", "iconColor", "iconColorAlt",
}

REQUIRED_TYPOGRAPHY = {"heading", "paragraph", "subtitle", "tag", "quote"}

VALID_FONTS = {
    "Afacad", "Adamina", "Archivo", "Inter", "Space Grotesk", "DM Sans",
    "Poppins", "Montserrat", "Playfair Display", "Merriweather",
    "JetBrains Mono", "Fira Code",
}

FORBIDDEN_HTML = re.compile(r"<(div|p|h[1-6]|style|script|link)\b", re.IGNORECASE)


def validate(data):
    errors = []
    warnings = []

    # --- Top-level fields ---
    if not isinstance(data.get("version"), (int, float)):
        errors.append("Campo 'version' ausente ou nao e numero")

    if not isinstance(data.get("slides"), list):
        errors.append("Campo 'slides' ausente ou nao e array")

    if not isinstance(data.get("theme"), dict):
        errors.append("Campo 'theme' ausente ou nao e objeto")

    if not isinstance(data.get("canvas"), dict):
        errors.append("Campo 'canvas' ausente ou nao e objeto")
    else:
        if data["canvas"].get("width") != 1080:
            warnings.append("canvas.width deveria ser 1080")
        if data["canvas"].get("height") != 1440:
            warnings.append("canvas.height deveria ser 1440")

    if not data.get("title"):
        warnings.append("Campo 'title' vazio")

    if not isinstance(data.get("header"), dict):
        warnings.append("Campo 'header' ausente")
    elif not data["header"].get("handle"):
        warnings.append("header.handle vazio")

    if not isinstance(data.get("footer"), dict):
        warnings.append("Campo 'footer' ausente")

    # --- Theme validation ---
    theme = data.get("theme", {})
    if isinstance(theme, dict):
        colors = theme.get("colors", {})
        if isinstance(colors, dict):
            missing_colors = REQUIRED_THEME_COLORS - set(colors.keys())
            for c in sorted(missing_colors):
                errors.append(f"theme.colors sem cor obrigatoria: {c}")
        else:
            errors.append("theme.colors ausente ou nao e objeto")

        typo = theme.get("typography", {})
        if isinstance(typo, dict):
            missing_typo = REQUIRED_TYPOGRAPHY - set(typo.keys())
            for t in sorted(missing_typo):
                errors.append(f"theme.typography sem categoria: {t}")
            for cat_name, cat in typo.items():
                if isinstance(cat, dict):
                    family = cat.get("family", "")
                    if family and family not in VALID_FONTS:
                        warnings.append(f"theme.typography.{cat_name}.family '{family}' nao esta na lista de fontes validas")
        else:
            errors.append("theme.typography ausente ou nao e objeto")

        if "fontScale" in theme:
            fs = theme["fontScale"]
            if isinstance(fs, (int, float)) and (fs < 0.7 or fs > 1.3):
                warnings.append(f"theme.fontScale={fs} fora do range recomendado (0.7-1.3)")

    # --- Slides validation ---
    slides = data.get("slides", [])
    if not isinstance(slides, list):
        return errors, warnings

    if len(slides) < 8:
        warnings.append(f"Apenas {len(slides)} slides (recomendado: 8-12)")
    if len(slides) > 12:
        warnings.append(f"{len(slides)} slides (recomendado: maximo 12)")

    used_ids = set()
    text_only_count = 0

    for i, slide in enumerate(slides, start=1):
        layout = slide.get("layout")
        if layout not in VALID_LAYOUTS:
            errors.append(f"Slide {i}: layout invalido '{layout}'")

        slide_id = slide.get("id")
        if not slide_id:
            errors.append(f"Slide {i}: sem 'id'")
        elif slide_id in used_ids:
            errors.append(f"Slide {i}: id duplicado '{slide_id}'")
        else:
            used_ids.add(slide_id)

        elements = slide.get("elements")
        if not isinstance(elements, list):
            errors.append(f"Slide {i}: 'elements' deve ser array")
            continue

        has_image = False
        has_bg_image = bool(slide.get("backgroundImage"))

        for el in elements:
            el_id = el.get("id")
            el_type = el.get("type")

            if not el_id:
                errors.append(f"Slide {i}: elemento sem 'id'")
            elif el_id in used_ids:
                errors.append(f"Slide {i}: id duplicado '{el_id}'")
            else:
                used_ids.add(el_id)

            if el_type not in VALID_ELEMENT_TYPES:
                errors.append(f"Slide {i} ({el_id or '?'}): tipo invalido '{el_type}'")

            # Content HTML check
            content = el.get("content")
            if isinstance(content, str) and FORBIDDEN_HTML.search(content):
                errors.append(f"Slide {i} ({el_id}): HTML proibido em content (div/p/h1-h6/style/script)")

            # Type-specific checks
            if el_type == "heading" and el.get("level") not in (1, 2, 3):
                errors.append(f"Slide {i} ({el_id}): heading.level deve ser 1, 2 ou 3")

            if el_type == "image":
                has_image = True
                if el.get("variant") not in ("area", "background", "inline"):
                    errors.append(f"Slide {i} ({el_id}): image.variant invalido")
                if not el.get("src"):
                    warnings.append(f"Slide {i} ({el_id}): image sem src")

            if el_type == "spacer" and not isinstance(el.get("height"), (int, float)):
                errors.append(f"Slide {i} ({el_id}): spacer sem height")

            # Font family check
            ff = el.get("fontFamily")
            if ff and ff not in VALID_FONTS:
                warnings.append(f"Slide {i} ({el_id}): fontFamily '{ff}' nao esta na lista valida")

        # Text-only check
        if not has_image and not has_bg_image and layout not in ("cover", "cta"):
            text_only_count += 1

    if slides:
        ratio = text_only_count / len(slides)
        if ratio > 0.4:
            warnings.append(
                f"Slides so texto em excesso ({text_only_count}/{len(slides)} = {ratio:.0%}). Meta: ate ~40%."
            )

    return errors, warnings


def main():
    parser = argparse.ArgumentParser(description="Validar schema.json com regras do CarouselSchema v1 + editoriais.")
    parser.add_argument("file", type=Path, help="Caminho para schema.json")
    parser.add_argument("--strict", action="store_true", help="Falhar tambem com warnings")
    args = parser.parse_args()

    try:
        data = json.loads(args.file.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"JSON invalido: {exc}", file=sys.stderr)
        sys.exit(1)

    errors, warnings = validate(data)

    if errors:
        print("ERRORS:")
        for err in errors:
            print(f"  - {err}")
    if warnings:
        print("WARNINGS:")
        for warn in warnings:
            print(f"  - {warn}")

    if not errors and not warnings:
        print("schema.json valido e alinhado com CarouselSchema v1")

    if errors or (args.strict and warnings):
        sys.exit(1)


if __name__ == "__main__":
    main()
