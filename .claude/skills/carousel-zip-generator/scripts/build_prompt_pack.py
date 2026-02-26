#!/usr/bin/env python3
"""
Generate a prompt pack (title + editorial + scene prompts) from a creative brief.

Usage:
  python3 build_prompt_pack.py --brief brief.json --output prompt-pack.json --slides 10
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REQUIRED_FIELDS = ["topic", "audience", "big_idea", "tone", "visual_direction"]


def fail(msg):
    print(msg, file=sys.stderr)
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Gerar pacote de prompts (titulo + editorial + cenas) a partir de um brief criativo."
    )
    parser.add_argument("--brief", type=Path, required=True, help="JSON com o brief criativo")
    parser.add_argument("--output", type=Path, required=True, help="Arquivo JSON de saida")
    parser.add_argument("--slides", type=int, default=10, help="Quantidade total de slides")
    args = parser.parse_args()

    try:
        brief = json.loads(args.brief.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"Nao foi possivel ler o brief: {exc}")

    missing = [f for f in REQUIRED_FIELDS if not brief.get(f)]
    if missing:
        fail(f"Campos obrigatorios ausentes no brief: {', '.join(missing)}")

    slides = max(8, min(12, args.slides))
    image_slides = max(4, int(round(slides * 0.6)))

    style_block = (
        f"Visual direction locked: {brief['visual_direction']}. "
        "Photorealistic editorial photography, cinematic quality, no 3D/cartoon look. "
        "Maintain consistent palette, lighting, and texture across all images."
    )

    title_prompt = (
        f"Render only the phrase \"{brief.get('title', brief['topic'])}\" as premium custom typography. "
        "Transparent background. No scene. No objects. No particles. No decorations. "
        f"Tone: {brief['tone']}. "
        "High contrast, sharp edges, production-ready PNG with alpha channel."
    )

    editorial_prompt = (
        f"Editorial cinematic photograph for Instagram carousel about '{brief['topic']}' "
        f"targeting {brief['audience']}. "
        f"Central message: {brief['big_idea']}. "
        f"{style_block} "
        "Clean composition with negative space for text overlay. "
        "No text, no logos, no watermarks."
    )

    scene_prompts = []
    for i in range(1, image_slides + 1):
        scene_prompts.append({
            "scene": i,
            "prompt": (
                f"Scene {i} of {image_slides} for Instagram carousel about '{brief['topic']}'. "
                f"Angle and action connected to previous scene for narrative progression. "
                f"Narrative arc: {brief.get('scene_focus', 'problem -> tension -> method -> proof')}. "
                f"{style_block} "
                "Clean for text overlay. No text, no logos, no watermarks."
            ),
        })

    output = {
        "metadata": {
            "topic": brief["topic"],
            "audience": brief["audience"],
            "slides": slides,
            "imageSlides": image_slides,
        },
        "prompts": {
            "title": title_prompt,
            "editorial": editorial_prompt,
            "scenes": scene_prompts,
        },
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Prompt pack generated: {args.output}")


if __name__ == "__main__":
    main()
