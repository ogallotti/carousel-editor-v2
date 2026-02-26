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


FREEFORM_TEMPLATES = [
    ("PROBLEMA", "A dor que o publico sente", "Texto detalhado sobre o problema que o publico enfrenta."),
    ("INSIGHT", "A descoberta que muda a perspectiva", "Texto explicando o insight com dados concretos."),
    ("METODO", "Como aplicar na pratica", "Passos concretos de execucao com exemplos reais."),
    ("EXEMPLO", "Caso real com numeros", "Antes e depois mensuravel que sustenta a tese."),
    ("PROVA", "Dados que sustentam a tese", "Resultado concreto e mensuravel em contexto real."),
    ("VIRADA", "O que ninguem percebeu ainda", "Perspectiva que o publico nao esperava encontrar."),
]

TEXT_TEMPLATES = [
    ("list", "SINAIS", "Como identificar em 30 segundos"),
    ("quote", "VIRADA", "Frase que muda a perspectiva"),
    ("highlight", "DADO CHAVE", "Insight em destaque"),
]

OVERLAY_FADE_TOP_BOTTOM = (
    "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, "
    "transparent 35%, transparent 55%, rgba(0,0,0,0.85) 100%)"
)
OVERLAY_FADE_TO_TOP = "linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 50%)"


def build_slides(title, slides_total):
    slides = []

    # Slide 1: Cover (freeform + backgroundImage)
    slides.append({
        "id": uid(),
        "layout": "freeform",
        "backgroundImage": "assets/hero-editorial.jpg",
        "elements": [
            el("overlay", fill=OVERLAY_FADE_TO_TOP, x=0, y=0, w=1080, h=1440, zIndex=1),
            el("heading", level=1, content=title, x=80, y=1040, w=920, fontSize=52, zIndex=2),
            el("subtitle", content="Subtitulo com promessa concreta", x=80, y=1240, w=920, fontSize=28, zIndex=2),
        ],
    })

    # Body slides: ~80% freeform, ~20% text-only
    body_count = slides_total - 2  # minus cover and CTA
    text_only_interval = 5  # every 5th body slide is text-only
    scene_idx = 2
    freeform_cursor = 0
    text_cursor = 0

    for i in range(body_count):
        is_text_only = ((i + 1) % text_only_interval == 0)

        if is_text_only:
            layout, tag, heading = TEXT_TEMPLATES[text_cursor % len(TEXT_TEMPLATES)]
            elements = [
                el("tag", content=tag, textAlign="center"),
                el("heading", level=2, content=heading, textAlign="center"),
            ]

            if layout == "list":
                elements.extend([
                    el("list-item", icon="01", content="Primeiro item da lista com contexto narrativo", textAlign="left"),
                    el("list-item", icon="02", content="Segundo item da lista com contexto narrativo", textAlign="left"),
                    el("list-item", icon="03", content="Terceiro item da lista com contexto narrativo", textAlign="left"),
                ])
            elif layout == "quote":
                elements.append(el(
                    "quote",
                    content="Frase memoravel que pode virar print.",
                    attribution="Fonte ou contexto da citacao",
                    textAlign="center",
                ))
            elif layout == "highlight":
                elements.append(el(
                    "highlight",
                    content="Dado ou insight em destaque que sustenta a tese central.",
                    textAlign="center",
                ))

            slides.append({"id": uid(), "layout": layout, "elements": elements})
            text_cursor += 1
        else:
            tag, heading, body = FREEFORM_TEMPLATES[freeform_cursor % len(FREEFORM_TEMPLATES)]
            slides.append({
                "id": uid(),
                "layout": "freeform",
                "backgroundImage": "assets/scene-%02d.jpg" % scene_idx,
                "elements": [
                    el("overlay", fill=OVERLAY_FADE_TOP_BOTTOM, x=0, y=0, w=1080, h=1440, zIndex=1),
                    el("tag", content=tag, x=80, y=100, w=300, zIndex=2),
                    el("heading", level=2, content=heading, x=80, y=170, w=920, fontSize=44, zIndex=2),
                    el("paragraph", content=body, x=80, y=1100, w=920, fontSize=24, zIndex=2),
                ],
            })
            scene_idx += 1
            freeform_cursor += 1

    # Last slide: CTA (freeform + backgroundImage)
    slides.append({
        "id": uid(),
        "layout": "freeform",
        "backgroundImage": "assets/bg-cta.jpg",
        "elements": [
            el("overlay", fill=OVERLAY_FADE_TO_TOP, x=0, y=0, w=1080, h=1440, zIndex=1),
            el("heading", level=1, content="Salva este post.", x=80, y=1100, w=920, fontSize=48, zIndex=2),
            el("paragraph", content="CTA unico, claro e direto.", x=80, y=1260, w=920, fontSize=26, zIndex=2),
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
