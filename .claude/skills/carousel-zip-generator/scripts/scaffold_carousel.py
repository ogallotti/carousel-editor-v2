#!/usr/bin/env python3
"""
Generate a scaffold schema.json for Carousel Editor V2.

Usage:
  python3 scaffold_carousel.py --title "Title" --handle "@user" --brand "BRAND" --slides 10 --output schema.json
"""
from __future__ import annotations

import argparse
import json
import string
import random
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_THEME = {
    "name": "Dark",
    "colors": {
        "background": "#0a0e1a",
        "backgroundSubtle": "#111827",
        "text": "#f8fafc",
        "textSecondary": "#cbd5e1",
        "textMuted": "#64748b",
        "highlight": "#fbbf24",
        "accent": "#f59e0b",
        "divider": "#1e293b",
        "cardBackground": "#0f172a",
        "highlightSoft": "rgba(251,191,36,0.10)",
        "highlightBorder": "rgba(251,191,36,0.25)",
        "iconColor": "#fbbf24",
        "iconColorAlt": "#f59e0b",
    },
    "typography": {
        "heading": {"family": "Archivo", "weight": 700},
        "paragraph": {"family": "Archivo", "weight": 400},
        "subtitle": {"family": "Archivo", "weight": 500},
        "tag": {"family": "Archivo", "weight": 700},
        "quote": {"family": "Archivo", "weight": 500},
    },
    "fontScale": 1,
    "elementGap": 24,
}


def uid():
    chars = string.ascii_lowercase + string.digits
    return "".join(random.choices(chars, k=12))


def el(el_type, **kwargs):
    base = {"id": uid(), "type": el_type}
    base.update(kwargs)
    return base


def build_slides(title, slides_total):
    slides = []

    # Slide 1: Cover
    slides.append({
        "id": uid(),
        "layout": "cover",
        "elements": [
            el("emoji", content="⚡", size=96),
            el("heading", level=1, content=title, textAlign="center"),
            el("subtitle", content="Subtitulo — promessa de transformacao", textAlign="center"),
        ],
    })

    body_templates = [
        ("title-body", "PROBLEMA", "A dor que o publico sente"),
        ("image-top", "CENA", "Visual que prova o ponto"),
        ("list", "SINAIS", "Como identificar em 30 segundos"),
        ("image-bottom", "EXEMPLO", "Caso real com antes e depois"),
        ("quote", "VIRADA", "Frase que muda a perspectiva"),
        ("highlight", "METODO", "O framework de execucao"),
        ("title-body", "PROVA", "Dados ou resultado concreto"),
    ]

    idx = 2
    cursor = 0
    while idx < slides_total:
        layout, tag, heading = body_templates[cursor % len(body_templates)]
        elements = [
            el("tag", content=tag, textAlign="center"),
            el("heading", level=2, content=heading, textAlign="center"),
            el("paragraph", content="Texto enxuto, especifico e com exemplos concretos.", textAlign="center"),
        ]

        if layout in ("image-top", "image-bottom"):
            elements.append(el(
                "image",
                src="assets/scene-%02d.jpg" % idx,
                variant="area",
                alt="Cena %02d" % idx,
                borderRadius=16,
                imageHeight=550,
            ))

        elif layout == "list":
            elements.extend([
                el("list-item", icon="✅", content="Primeiro item da lista", textAlign="left"),
                el("list-item", icon="✅", content="Segundo item da lista", textAlign="left"),
                el("list-item", icon="✅", content="Terceiro item da lista", textAlign="left"),
            ])

        elif layout == "quote":
            elements.append(el(
                "quote",
                content="Frase memoravel que pode virar print.",
                attribution="Autoridade ou experiencia pratica",
                textAlign="center",
            ))

        elif layout == "highlight":
            elements.append(el(
                "highlight",
                content="Dado ou insight em destaque que sustenta a tese.",
                textAlign="center",
            ))

        slides.append({"id": uid(), "layout": layout, "elements": elements})
        idx += 1
        cursor += 1

    # Last slide: CTA
    slides.append({
        "id": uid(),
        "layout": "cta",
        "elements": [
            el("emoji", content="💾", size=96),
            el("heading", level=1, content="Salva e manda pra quem precisa.", textAlign="center"),
            el("paragraph", content="CTA unico, claro e direto.", textAlign="center"),
        ],
    })

    return slides


def main():
    parser = argparse.ArgumentParser(description="Gerar scaffold de schema.json para Carousel Editor V2.")
    parser.add_argument("--title", required=True, help="Titulo do carrossel")
    parser.add_argument("--handle", default="@meuhandle", help="@username do Instagram")
    parser.add_argument("--brand", default="MINHA MARCA", help="Texto do footer")
    parser.add_argument("--slides", type=int, default=10, help="Total de slides (8-12)")
    parser.add_argument("--output", type=Path, required=True, help="Caminho do arquivo de saida")
    args = parser.parse_args()

    slides_total = max(8, min(12, args.slides))
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "version": 1,
        "generator": "ai-carousel-generator",
        "generatorVersion": "1.0.0",
        "createdAt": now,
        "updatedAt": now,
        "id": uid(),
        "title": args.title,
        "format": "carousel",
        "canvas": {"width": 1080, "height": 1440},
        "header": {"handle": args.handle, "showCounter": True},
        "footer": {"text": args.brand, "style": "uppercase"},
        "theme": DEFAULT_THEME,
        "slides": build_slides(args.title, slides_total),
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Scaffold created: {args.output}")
    print(f"  Slides: {len(doc['slides'])}")


if __name__ == "__main__":
    main()
