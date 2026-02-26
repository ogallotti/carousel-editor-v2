# Element Types — Complete Reference

All 12 element types with every property, default value, valid range, and JSON example.

---

## 1. tag

Uppercase branded label. Typically used at the top of content slides.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"tag"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `content` | string | **yes** | — | Text content (rendered uppercase via CSS) |
| `textAlign` | string | no | `"center"` | `"left"`, `"center"`, `"right"` |
| `fontSize` | number | no | 22 | Pixels |
| `color` | string | no | theme accent | Hex color |
| + all BaseElement props | | | | See schema-spec.md |

**CSS behavior**: uppercase, letter-spacing 0.15em, colored with theme accent.

```json
{
  "id": "t1a2b3c4d5e6",
  "type": "tag",
  "content": "DICA DO DIA",
  "textAlign": "center"
}
```

---

## 2. heading

Multi-level title. The `level` field is **required** and determines visual size.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"heading"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `content` | string | **yes** | — | Text (supports inline HTML) |
| `level` | 1 \| 2 \| 3 | **yes** | — | **Must provide**: 1=large, 2=medium, 3=small |
| `textAlign` | string | no | `"center"` | |
| `fontSize` | number | no | 72/56/44 | Override: level 1→72, 2→56, 3→44 |
| + all BaseElement props | | | | |

**CSS behavior**: uppercase, text-wrap balance, line-height 1.05–1.15.

```json
{
  "id": "h1a2b3c4d5e6",
  "type": "heading",
  "level": 1,
  "content": "5 Dicas Para Aumentar Suas Vendas",
  "textAlign": "center"
}
```

### Inline HTML in content

Heading (and paragraph, subtitle, quote, highlight, list-item) support inline formatting:

```json
"content": "Isso é <b>importante</b> e <span style=\"color:#fbbf24\">destaque</span>"
```

Supported: `<b>`, `<i>`, `<u>`, `<span style="color:...">`, `<span style="font-size:...px">`

---

## 3. paragraph

Body text / description.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"paragraph"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `content` | string | **yes** | — | Text (supports inline HTML) |
| `textAlign` | string | no | `"center"` | |
| `fontSize` | number | no | 38 | Pixels |
| + all BaseElement props | | | | |

**CSS behavior**: text-wrap balance, line-height 1.45, color textSecondary.

```json
{
  "id": "p1a2b3c4d5e6",
  "type": "paragraph",
  "content": "Descubra como transformar sua estratégia de marketing digital com estas dicas práticas.",
  "textAlign": "center"
}
```

---

## 4. subtitle

Secondary heading / supporting text.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"subtitle"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `content` | string | **yes** | — | Text (supports inline HTML) |
| `textAlign` | string | no | `"center"` | |
| `fontSize` | number | no | 32 | Pixels |
| + all BaseElement props | | | | |

**CSS behavior**: text-wrap balance, line-height 1.4, color textSecondary.

```json
{
  "id": "s1a2b3c4d5e6",
  "type": "subtitle",
  "content": "Guia completo para iniciantes",
  "textAlign": "center"
}
```

---

## 5. emoji

Standalone emoji display.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"emoji"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `content` | string | **yes** | — | Unicode emoji character(s) |
| `size` | number | no | 96 | Pixels, range: 16–400 |
| + all BaseElement props | | | | (textAlign ignored) |

**CSS behavior**: centered, line-height 1.

```json
{
  "id": "e1a2b3c4d5e6",
  "type": "emoji",
  "content": "🚀",
  "size": 96
}
```

---

## 6. image

Photo or graphic element. The `variant` field is **required**.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"image"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `src` | string | **yes** | — | Asset path: `"assets/filename.jpg"` |
| `variant` | string | **yes** | — | `"area"`, `"background"`, or `"inline"` |
| `alt` | string | no | `""` | Alt text |
| `objectPosition` | string | no | `"center"` | CSS position (e.g., `"50% 30%"`) |
| `borderRadius` | number | no | 16 | Pixels, range: 0–50 |
| `imageHeight` | number | no | 500 | Pixels, range: 100–1200 (non-freeform only) |
| `w` | number | no | 600 | Width in freeform layout |
| `h` | number | no | 500 | Height in freeform layout |
| + all BaseElement props | | | | |

### Variants

- **`"area"`** — Image displayed as a block within the content flow. Uses `imageHeight` for height, full width, `object-fit: cover`.
- **`"background"`** — Full-slide background image. Covers entire 1080x1440 canvas.
- **`"inline"`** — Inline with text (rarely used).

**CSS behavior**: object-fit cover, border-radius from property.

```json
{
  "id": "i1a2b3c4d5e6",
  "type": "image",
  "src": "assets/team-photo.jpg",
  "alt": "Equipe reunida",
  "variant": "area",
  "borderRadius": 16,
  "imageHeight": 500
}
```

---

## 7. overlay

Color or gradient overlay layer. Typically used over background images in freeform layouts.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"overlay"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `fill` | string | **yes** | — | CSS color or gradient string |
| + all BaseElement props | | | | Especially x, y, w, h, zIndex |

**Common fill values:**

```
"rgba(0,0,0,0.6)"                                          — dark overlay
"rgba(0,0,0,0.85)"                                         — very dark overlay
"linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)"  — fade to dark
"linear-gradient(to top, transparent 0%, rgba(0,0,0,0.7) 100%)"     — fade to dark (top)
"transparent"                                               — no overlay
```

**Freeform usage pattern (full-canvas overlay):**
```json
{
  "id": "o1a2b3c4d5e6",
  "type": "overlay",
  "fill": "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.85) 100%)",
  "x": 0,
  "y": 0,
  "w": 1080,
  "h": 1440,
  "zIndex": 1
}
```

---

## 8. quote

Featured quote/blockquote with optional attribution.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"quote"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `content` | string | **yes** | — | Quote text (supports inline HTML) |
| `attribution` | string | no | — | Author name (e.g., `"— Steve Jobs"`) |
| `quoteMarkColor` | string | no | theme iconColorAlt | Hex color for the " mark |
| `quoteMarkSize` | number | no | 96 | Pixels, range: 24–200 |
| `quoteMarkOpacity` | number | no | 1 | Range: 0–1 |
| `textAlign` | string | no | `"center"` | |
| `fontSize` | number | no | 46 | Pixels |
| + all BaseElement props | | | | |

**CSS behavior**: italic, line-height 1.45. Large decorative " mark above the text.

```json
{
  "id": "q1a2b3c4d5e6",
  "type": "quote",
  "content": "A simplicidade é o último grau de sofisticação.",
  "attribution": "Leonardo da Vinci",
  "textAlign": "center"
}
```

---

## 9. list-item

Single item in a list. Use multiple list-items in one slide for a bulleted list.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"list-item"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `content` | string | **yes** | — | Item text (supports inline HTML) |
| `icon` | string | no | `"✓"` | Emoji or unicode character |
| `iconSize` | number | no | 48 | Pixels, range: 16–96 |
| `iconColor` | string | no | theme iconColor | Hex color |
| `textAlign` | string | no | `"left"` | Note: defaults to left (not center) |
| `fontSize` | number | no | 36 | Pixels |
| + all BaseElement props | | | | |

**CSS behavior**: flexbox row with icon on left, gap 20px, line-height 1.4.

```json
{
  "id": "l1a2b3c4d5e6",
  "type": "list-item",
  "icon": "✅",
  "content": "Planeje seu conteúdo com antecedência",
  "textAlign": "left"
}
```

**Tip**: For a list slide, create a heading + multiple list-items:
```json
"elements": [
  { "id": "lh1", "type": "heading", "level": 2, "content": "3 Passos Essenciais" },
  { "id": "li1", "type": "list-item", "icon": "1️⃣", "content": "Defina seu público-alvo" },
  { "id": "li2", "type": "list-item", "icon": "2️⃣", "content": "Crie conteúdo relevante" },
  { "id": "li3", "type": "list-item", "icon": "3️⃣", "content": "Analise os resultados" }
]
```

---

## 10. highlight

Emphasized text block with colored background and border.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"highlight"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `content` | string | **yes** | — | Text (supports inline HTML) |
| `backgroundColor` | string | no | theme highlightSoft | CSS color (hex or rgba) |
| `borderColor` | string | no | theme highlightBorder | CSS color (hex or rgba) |
| `borderRadius` | number | no | 16 | Pixels, range: 0–50 |
| `padding` | number | no | 32 | Pixels, range: 8–80 |
| `textAlign` | string | no | `"center"` | |
| `fontSize` | number | no | 38 | Pixels (inherits paragraph size) |
| + all BaseElement props | | | | |

**CSS behavior**: background + 1px border + border-radius + padding.

```json
{
  "id": "hl1a2b3c4d5e",
  "type": "highlight",
  "content": "Empresas que investem em marketing de conteúdo geram 3x mais leads.",
  "textAlign": "center",
  "padding": 32,
  "borderRadius": 16
}
```

---

## 11. divider

Horizontal separator line.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"divider"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `dividerColor` | string | no | theme divider | Hex color |
| `dividerWidth` | number | no | 80 | Pixels, range: 20–1080 |
| `dividerHeight` | number | no | 3 | Pixels, range: 1–20 |
| `borderRadius` | number | no | 2 | Pixels, range: 0–10 |
| `dividerOpacity` | number | no | 1 | Range: 0–1 |
| + all BaseElement props | | | | |

```json
{
  "id": "d1a2b3c4d5e6",
  "type": "divider",
  "dividerWidth": 80,
  "dividerHeight": 3
}
```

---

## 12. spacer

Vertical spacing element. Adds empty space between elements.

| Property | Type | Required | Default | Range/Notes |
|----------|------|----------|---------|-------------|
| `type` | `"spacer"` | **yes** | — | |
| `id` | string | **yes** | — | Unique |
| `height` | number | **yes** | — | Pixels, range: 4–400 |
| + all BaseElement props | | | | (most unused) |

```json
{
  "id": "sp1a2b3c4d5e",
  "type": "spacer",
  "height": 40
}
```
