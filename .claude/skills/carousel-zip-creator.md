# Skill: Carousel ZIP Creator

**Purpose**: Generate 100% compatible `.zip` files for **Carousel Editor V2** — a local-first visual editor for Instagram carousels (1080x1440px, portrait 4:5).

**When to use**: Whenever a user asks you to create, generate, or produce a carousel ZIP package, carousel JSON, or carousel content. The output is a `.zip` file containing `schema.json` plus an optional `assets/` folder with images.

**Important**: This skill is self-contained. You do NOT need to read any source code. Everything you need is documented here.

---

## 1. ZIP File Structure

```
carousel.zip
  schema.json          # Required. The carousel data.
  assets/              # Optional folder. Only needed if slides use images.
    cover-photo.jpg    # Image files referenced by elements or slide backgrounds.
    team.png
    ...
```

- `schema.json` MUST be at the root of the ZIP (not inside a subfolder).
- Asset filenames are referenced in the schema as `"assets/cover-photo.jpg"` (the path inside the ZIP).
- Supported image formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`.

---

## 2. schema.json Complete Reference

### 2.1 Top-Level Fields

```typescript
{
  "$schema": "https://carousel-editor.app/schema/v1.json",   // Optional. Schema URL.
  "version": 1,                                              // Required. Always 1.
  "generator": "ai-agent",                                   // Optional. Tool that created this.
  "generatorVersion": "1.0.0",                               // Optional.
  "createdAt": "2026-01-15T10:30:00.000Z",                   // Required. ISO 8601.
  "updatedAt": "2026-01-15T10:30:00.000Z",                   // Required. ISO 8601.

  "id": "my-carousel-001",                                   // Required. Unique string identifier.
  "title": "Meu Carrossel",                                  // Required. Display title.
  "description": "Descrição opcional",                       // Optional.
  "tags": ["marketing", "instagram"],                        // Optional. String array.
  "format": "carousel",                                      // Required. "carousel" or "single-post".

  "canvas": { "width": 1080, "height": 1440 },              // Required. Always 1080x1440.

  "header": {
    "handle": "@meuhandle",                                  // Required. Instagram handle shown top-left.
    "showCounter": true                                      // Required. Show "01/05" counter top-right.
  },

  "footer": {
    "text": "MINHA MARCA",                                   // Required. Brand text shown at bottom center.
    "style": "uppercase"                                     // Required. "uppercase" or "normal".
  },

  "theme": { ... },                                          // Required. See Section 3.
  "slides": [ ... ]                                          // Required. Array of Slide objects. See Section 4.
}
```

### 2.2 Validation Rules (what the editor checks on import)

The editor validates that:
1. `version` is a number
2. `slides` is an array (each item is an object with `elements` array)
3. `theme` is an object
4. `canvas` is an object
5. `header` is an object with `handle` (string) and `showCounter` (boolean)
6. `footer` is an object with `text` (string)

If critical fields (1-4) fail, the import is rejected. Other missing fields are filled with defaults via deep merge with `createEmptySchema()`.

**Element normalization on import**: The editor normalizes every element — fills missing `textAlign` with CSS defaults per type, validates `type`/`level`/`variant`, clamps `opacity` to 0-1, generates missing IDs, deduplicates IDs, and sanitizes HTML content (strips `<script>`, `<iframe>`, `<object>`, `<embed>` tags).

**Asset validation**: Image `src` paths starting with `assets/` are verified against the ZIP contents. Broken references are cleared silently.

**Default values applied during migration** (if fields are missing):
- `id`: `"imported"`
- `title`: `"Novo Carrossel"`
- `format`: `"carousel"`
- `canvas`: `{ width: 1080, height: 1440 }`
- `header`: `{ handle: "@meuhandle", showCounter: true }`
- `footer`: `{ text: "MINHA MARCA", style: "uppercase" }`
- `theme`: The Dark theme preset (see Section 3)
- Each slide gets `id: "slide-{index+1}"` if missing, `layout: "title-body"` if missing, `elements: []` if missing

---

## 3. Theme Object

The theme controls all visual styling of slides. It has 4 sections: `name`, `colors` (13 fields), `typography` (6 categories), and `fontScale`.

### 3.1 Theme Structure

```json
{
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
    "iconColorAlt": "#f59e0b"
  },
  "typography": {
    "heading":   { "family": "Archivo", "weight": 700 },
    "paragraph": { "family": "Archivo", "weight": 400 },
    "subtitle":  { "family": "Archivo", "weight": 500 },
    "tag":       { "family": "Archivo", "weight": 700 },
    "quote":     { "family": "Archivo", "weight": 500 }
  },
  "fontScale": 1
}
```

### 3.2 Color Fields Reference

| Field | CSS Variable | Purpose | Used by |
|---|---|---|---|
| `background` | `--slide-bg` | Slide background color | `.slide` background |
| `backgroundSubtle` | `--slide-bg-subtle` | Slightly lighter/darker variant of background | Subtle backgrounds |
| `text` | `--slide-text` | Primary text (headings, strong) | `h1`, `h2`, `h3`, `strong` |
| `textSecondary` | `--slide-text-secondary` | Body text, subtitles, list items | `p`, `.sub`, `.list-item` |
| `textMuted` | `--slide-text-muted` | Header/footer text, attribution | `.hd`, `.ft` |
| `highlight` | `--slide-highlight` | Primary accent color (highlighted text) | `.hl` |
| `accent` | `--slide-accent` | Secondary accent (tags, footer brand) | `.tag`, `.ft-theme` |
| `divider` | `--slide-divider` | Divider line color | `.divider-line` |
| `cardBackground` | `--slide-card-bg` | Card/container background | Containers |
| `highlightSoft` | `--slide-highlight-soft` | Highlight block background (low-opacity highlight) | `.highlight-block` background |
| `highlightBorder` | `--slide-highlight-border` | Highlight block border (medium-opacity highlight) | `.highlight-block` border |
| `iconColor` | `--slide-icon-color` | List item icon color, quote marks | `.list-icon`, `.quote-mark` |
| `iconColorAlt` | `--slide-icon-color-alt` | Alternate icon color | Quote mark color |

### 3.3 Typography Fields

Each typography category has `family` (font name) and `weight` (CSS font-weight number).

| Category | Elements it styles | Default CSS size |
|---|---|---|
| `heading` | `h1` (72px), `h2` (56px), `h3` (44px) | Varies by level |
| `paragraph` | `p` elements | 38px |
| `subtitle` | `.sub` elements | 32px |
| `tag` | `.tag` elements | 22px, uppercase, letter-spacing 0.15em |
| `quote` | `.quote-text` elements | 46px, italic |

### 3.4 Available Font Families

The editor bundles these 9 Google Fonts. Use ONLY these values for `family`:

- `Archivo` (default, geometric sans-serif)
- `Inter` (clean sans-serif)
- `Space Grotesk` (geometric with character)
- `DM Sans` (friendly sans-serif)
- `Poppins` (rounded sans-serif)
- `Montserrat` (versatile sans-serif)
- `Playfair Display` (elegant serif)
- `Merriweather` (readable serif)
- `JetBrains Mono` (monospace)

### 3.5 Font Weight Values

Valid weight values: `400` (Regular), `500` (Medium), `600` (Semibold), `700` (Bold), `800` (Extra Bold), `900` (Black).

### 3.6 Font Scale

`fontScale` is a multiplier (default `1`). Range: `0.70` to `1.30`. It applies a CSS `zoom` on the content area, scaling all text proportionally.

---

## 4. Slides Array

Each slide is an object in the `slides` array:

```json
{
  "id": "slide-1",                             // Required. Unique across the carousel.
  "layout": "cover",                           // Required. One of 12 layout types (see Section 5).
  "elements": [ ... ],                         // Required. Array of SlideElement objects (see Section 6).
  "background": null,                          // Optional. CSS background value (solid color or gradient).
  "backgroundImage": null,                     // Optional. Image path (e.g., "assets/bg.jpg").
  "backgroundPosition": "50% 50%"              // Optional. CSS background-position. Default: center.
}
```

### Slide Background Options

You can set a slide background in three ways (applied in this priority):

1. **`backgroundImage`**: An image file path like `"assets/bg.jpg"`. Rendered with `background-size: cover`.
2. **`background`**: A CSS background value. Can be:
   - Solid color: `"#1a1a2e"`
   - Linear gradient: `"linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"`
   - Radial gradient: `"radial-gradient(circle at center, #1a1a2e 0%, #0a0e1a 100%)"`
3. **Theme default**: If neither is set, `theme.colors.background` is used.

`backgroundPosition` only affects `backgroundImage`. Format is CSS `background-position` (e.g., `"50% 50%"`, `"center"`, `"0% 100%"`).

---

## 5. Layout Types (11)

The `layout` field determines how elements are arranged within the slide.

### Flow Layouts (10 types)
These use CSS flexbox with `flex-direction: column`, `align-items: center`, `justify-content: center`. Elements flow vertically, centered. Padding is `60px 100px` on the content area.

| Layout | Description | Typical Elements |
|---|---|---|
| `cover` | Title/cover slide. Big heading, optional emoji/subtitle. | emoji, heading (h1), subtitle |
| `title-body` | Heading + body text. Most versatile general-purpose layout. | tag, heading (h2), paragraph |
| `full-text` | Text-heavy content. | heading, paragraph(s) |
| `image-top` | Image area at top, text below. | image (area variant), heading, paragraph |
| `image-bottom` | Text at top, image area at bottom. | heading, paragraph, image (area variant) |
| `image-full` | Full-bleed background image with overlay text. | image (background variant), overlay, heading |
| `quote` | Quotation with decorative quote mark. | quote, emoji |
| `list` | Bulleted/icon list items. | heading, list-item(s) |
| `highlight` | Important text in a highlighted box. | heading, highlight |
| `cta` | Call-to-action / closing slide. | heading (h1), paragraph, emoji |

### Freeform Layout (1 type)
| Layout | Description |
|---|---|
| `freeform` | Absolute positioning. Each element uses `x`, `y`, `w`, `h` coordinates on the 1080x1440 canvas. Elements must specify position explicitly. |

**Key difference**: In flow layouts, elements are rendered in a centered flex column and `x`/`y`/`w`/`h` are ignored. In `freeform`, every element MUST have `x`, `y`, and `w` set (at minimum). `h` is optional for text elements (auto-sized) but required for images.

### Flow Layout: Overlay Behavior

In flow layouts (not freeform), `overlay` elements are treated specially: they are rendered as **full-slide covers** positioned `absolute` with `inset: 0`, behind the content. This means an overlay fills the entire slide as a color/gradient layer. All non-overlay elements are rendered on top.

---

## 6. Element Types (12)

All elements share these **base fields** from `BaseElement`:

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | string | Yes | - | Unique across the ENTIRE carousel (not just per slide). |
| `type` | string | Yes | - | Element type identifier. |
| `marginTop` | number | No | 0 | Top margin in pixels (flow layouts only). |
| `marginBottom` | number | No | 0 | Bottom margin in pixels (flow layouts only). |
| `fontSize` | number | No | (theme default) | Override font size in pixels. Omit to use theme default. |
| `textAlign` | `"left"` \| `"center"` \| `"right"` | No | `"center"` | Text alignment. |
| `x` | number | No | - | X position in pixels (freeform layout only). |
| `y` | number | No | - | Y position in pixels (freeform layout only). |
| `w` | number | No | - | Width in pixels (freeform layout only). |
| `h` | number | No | - | Height in pixels (freeform layout only). |
| `rotation` | number | No | 0 | Rotation in degrees (freeform layout only). |
| `zIndex` | number | No | - | Stacking order (freeform layout only). |

### 6.1 `tag`

A small uppercase label, typically used as a category indicator above a heading.

```json
{ "id": "el-tag-1", "type": "tag", "content": "MARKETING DIGITAL" }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | Tag text. Supports inline HTML (`<span class="hl">highlighted</span>`). |

**Rendering**: Uppercase, letter-spacing 0.15em, accent color, 22px, font-tag/weight-tag.

### 6.2 `heading`

Main headings with 3 size levels.

```json
{ "id": "el-h1", "type": "heading", "level": 1, "content": "Titulo Principal" }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `level` | `1` \| `2` \| `3` | Yes | Heading level. `1` = 72px, `2` = 56px, `3` = 44px. |
| `content` | string | Yes | Heading text. Supports inline HTML (`<span class="hl">text</span>` for highlight color, `<strong>` for bold). |

**Rendering**: Uppercase (h1/h2), text color, font-heading/weight-heading. `text-wrap: balance`. Centered by default.

### 6.3 `paragraph`

Body text for explanations and descriptions.

```json
{ "id": "el-p1", "type": "paragraph", "content": "Texto do paragrafo aqui." }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | Paragraph text. Supports inline HTML. |

**Rendering**: 38px, textSecondary color, font-paragraph/weight-paragraph. `text-wrap: balance`. Centered.

### 6.4 `subtitle`

Smaller secondary text, used under headings.

```json
{ "id": "el-sub1", "type": "subtitle", "content": "Subtitulo explicativo" }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | Subtitle text. Supports inline HTML. |

**Rendering**: 32px, textSecondary color, font-subtitle/weight-subtitle. `text-wrap: balance`. Centered.

### 6.5 `emoji`

A large emoji, typically used as a visual anchor on cover/CTA slides.

```json
{ "id": "el-emoji1", "type": "emoji", "content": "\ud83d\ude80", "size": 96 }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | The emoji character(s). |
| `size` | number | No | Font size in pixels. Default: `96`. |

**Rendering**: Centered, line-height 1.

### 6.6 `image`

An image element with three display variants.

```json
{
  "id": "el-img1",
  "type": "image",
  "src": "assets/cover.jpg",
  "alt": "Foto de capa",
  "variant": "area",
  "objectPosition": "50% 50%",
  "borderRadius": 16
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `src` | string | Yes | Image source. Use `"assets/filename.jpg"` for ZIP assets. Also supports `https://` URLs. Empty string `""` = placeholder. |
| `alt` | string | No | Alt text for accessibility. |
| `variant` | `"area"` \| `"background"` \| `"inline"` | Yes | How the image is displayed (see below). |
| `objectPosition` | string | No | CSS object-position. Default: `"50% 50%"` (center). |
| `borderRadius` | number | No | Border radius in pixels. Default: `16`. |

**Variants**:
- `"area"`: Displays in a contained box (width: 100%, height: 500px, rounded corners, `object-fit: cover`). Best for `image-top` / `image-bottom` layouts.
- `"background"`: Displays as absolute full-slide cover (`position: absolute; inset: 0; object-fit: cover`). Best for `image-full` layout.
- `"inline"`: Standard inline image display.

### 6.7 `overlay`

A color/gradient layer that covers the slide. In flow layouts, overlays are rendered as full-slide absolute covers behind content.

```json
{ "id": "el-overlay1", "type": "overlay", "fill": "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `fill` | string | Yes | CSS background value. Can be a solid color (`"rgba(0,0,0,0.5)"`) or gradient. |

**Common use**: Pair with a background image to darken it so text is readable.

### 6.8 `quote`

A quotation with decorative quote mark.

```json
{
  "id": "el-quote1",
  "type": "quote",
  "content": "Uma frase inspiradora aqui.",
  "attribution": "Autor"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | Quote text. Supports inline HTML. |
| `attribution` | string | No | Author/source attribution shown below the quote. |

**Rendering**: Large opening `"` mark (96px, iconColorAlt), italic quote text (46px, font-quote), optional attribution in textMuted color.

### 6.9 `list-item`

A single list item with an optional icon. Consecutive list-items are automatically grouped into a `.list-items` container.

```json
{ "id": "el-li1", "type": "list-item", "icon": "\u2713", "content": "Primeiro item" }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `icon` | string | No | Icon character/emoji, or an image URL. Default: `"\u25cf"` (bullet). |
| `content` | string | Yes | List item text. Supports inline HTML (`<strong>bold</strong>`). |

**Rendering**: Flexbox row with icon (48x48px, iconColor) + text (36px, textSecondary). Left-aligned by default.

### 6.10 `highlight`

Text displayed in a highlighted box with a subtle background and border.

```json
{ "id": "el-hl1", "type": "highlight", "content": "Texto importante em destaque." }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | Yes | Highlighted text. Supports inline HTML. |

**Rendering**: Rounded box (16px radius) with highlightSoft background, highlightBorder border, 32px padding. Text uses primary text color.

### 6.11 `divider`

A small horizontal line separator.

```json
{ "id": "el-div1", "type": "divider" }
```

No additional fields. **Rendering**: 80px wide, 3px tall, divider color, rounded.

### 6.12 `spacer`

Invisible vertical space.

```json
{ "id": "el-spacer1", "type": "spacer", "height": 40 }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `height` | number | Yes | Height in pixels. |

---

## 7. Inline HTML in Content Fields

Text content fields (`content` in tag, heading, paragraph, subtitle, quote, highlight, list-item) support inline HTML:

- `<span class="hl">text</span>` -- Renders in the highlight color (--slide-highlight). Use for emphasis.
- `<strong>text</strong>` -- Bold text (weight 700, primary text color).
- `<br>` -- Line break.

Example: `"content": "Como <span class=\"hl\">triplicar</span> suas <strong>vendas</strong>"`

---

## 8. Built-in Theme Presets

The editor ships with 2 built-in presets. You can use either as-is, or create a custom theme.

### 8.1 Dark Theme (Default)

```json
{
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
    "iconColorAlt": "#f59e0b"
  },
  "typography": {
    "heading":   { "family": "Archivo", "weight": 700 },
    "paragraph": { "family": "Archivo", "weight": 400 },
    "subtitle":  { "family": "Archivo", "weight": 500 },
    "tag":       { "family": "Archivo", "weight": 700 },
    "quote":     { "family": "Archivo", "weight": 500 }
  },
  "fontScale": 1
}
```

### 8.2 Light Theme

```json
{
  "name": "Light",
  "colors": {
    "background": "#ffffff",
    "backgroundSubtle": "#f8fafc",
    "text": "#0f172a",
    "textSecondary": "#475569",
    "textMuted": "#94a3b8",
    "highlight": "#f59e0b",
    "accent": "#d97706",
    "divider": "#e2e8f0",
    "cardBackground": "#ffffff",
    "highlightSoft": "rgba(245,158,11,0.08)",
    "highlightBorder": "rgba(245,158,11,0.20)",
    "iconColor": "#f59e0b",
    "iconColorAlt": "#d97706"
  },
  "typography": {
    "heading":   { "family": "Archivo", "weight": 700 },
    "paragraph": { "family": "Archivo", "weight": 400 },
    "subtitle":  { "family": "Archivo", "weight": 500 },
    "tag":       { "family": "Archivo", "weight": 700 },
    "quote":     { "family": "Archivo", "weight": 500 }
  },
  "fontScale": 1
}
```

### 8.3 Custom Theme Tips

When creating a custom theme:

- `highlightSoft` should be the highlight color at 8-10% opacity: use `rgba(R,G,B,0.08)` for light backgrounds, `rgba(R,G,B,0.10)` for dark.
- `highlightBorder` should be the highlight color at 20-25% opacity: use `rgba(R,G,B,0.20)` for light, `rgba(R,G,B,0.25)` for dark.
- `backgroundSubtle` should be slightly different from `background` (3% darker for light themes, 3% lighter for dark themes).
- `cardBackground` should be slightly different from `background` (2% darker for light themes, 2% lighter for dark themes).
- `divider` should be about 10% different from `background`.
- `iconColor` typically matches `highlight`. `iconColorAlt` typically matches `accent`.
- Set `name` to `"Custom"` for custom themes so the editor does not highlight a built-in preset.

---

## 9. Common Pitfalls and Tips

### Element IDs Must Be Globally Unique
Every element `id` across ALL slides must be unique. Use a pattern like `"slide1-heading"`, `"slide2-tag"`, or `"el-001"`, `"el-002"`, etc.

### Asset References
- Images stored in the ZIP `assets/` folder are referenced as `"assets/filename.jpg"` (no leading slash, no `asset://` protocol).
- External images can use full `https://` URLs.
- An empty `src: ""` on an image element shows a placeholder in the editor.

### Background Position Format
Use CSS `background-position` syntax: `"50% 50%"` (center), `"0% 0%"` (top-left), `"100% 100%"` (bottom-right).

### Theme Colors Format
- Solid colors: hex format `"#RRGGBB"` (e.g., `"#0a0e1a"`).
- Semi-transparent colors: `rgba()` format (e.g., `"rgba(251,191,36,0.10)"`).

### Freeform Layout Coordinates
The canvas is 1080px wide and 1440px tall. Coordinates are absolute pixels from the top-left corner.
- `x`: horizontal position from left edge.
- `y`: vertical position from top edge.
- `w`: element width.
- `h`: element height (optional for text, required for images).
- Typical safe text area: x=80 to x=1000, y=100 to y=1340 (accounting for header/footer).

### Layout Choice Guide
- Use `cover` for the first slide (title slide).
- Use `title-body` for general content slides.
- Use `list` when you have 3+ bullet points.
- Use `stats` when showing numbers/metrics.
- Use `quote` for testimonials or citations.
- Use `cta` for the last slide (call-to-action).
- Use `image-full` + `overlay` for dramatic image backgrounds with text.
- Use `freeform` only when you need precise positioning.

### Text Content Tips
- Content supports inline HTML: `<span class="hl">` for highlight, `<strong>` for bold, `<br>` for line break.
- Keep text concise -- Instagram carousels are visual. Short punchy text works best.
- Headings are automatically uppercase in h1/h2 (CSS text-transform).

---

## 10. Worked Examples

### Example 1: Simple Cover + Content + CTA Carousel (3 slides)

```json
{
  "$schema": "https://carousel-editor.app/schema/v1.json",
  "version": 1,
  "generator": "ai-agent",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z",
  "id": "example-simple",
  "title": "5 Dicas de Marketing",
  "format": "carousel",
  "canvas": { "width": 1080, "height": 1440 },
  "header": { "handle": "@agenciacriativa", "showCounter": true },
  "footer": { "text": "AGENCIA CRIATIVA", "style": "uppercase" },
  "theme": {
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
      "iconColorAlt": "#f59e0b"
    },
    "typography": {
      "heading":   { "family": "Archivo", "weight": 700 },
      "paragraph": { "family": "Archivo", "weight": 400 },
      "subtitle":  { "family": "Archivo", "weight": 500 },
      "tag":       { "family": "Archivo", "weight": 700 },
      "quote":     { "family": "Archivo", "weight": 500 }
    },
    "fontScale": 1
  },
  "slides": [
    {
      "id": "slide-1",
      "layout": "cover",
      "elements": [
        { "id": "s1-emoji", "type": "emoji", "content": "\ud83d\ude80", "size": 96 },
        { "id": "s1-heading", "type": "heading", "level": 1, "content": "5 Dicas para <span class=\"hl\">Triplicar</span> suas Vendas", "textAlign": "center" },
        { "id": "s1-subtitle", "type": "subtitle", "content": "Estrategias que realmente funcionam", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-2",
      "layout": "title-body",
      "elements": [
        { "id": "s2-tag", "type": "tag", "content": "DICA #1", "textAlign": "center" },
        { "id": "s2-heading", "type": "heading", "level": 2, "content": "Conheca seu Publico", "textAlign": "center" },
        { "id": "s2-divider", "type": "divider" },
        { "id": "s2-paragraph", "type": "paragraph", "content": "Antes de vender qualquer coisa, voce precisa entender <strong>quem</strong> e o seu cliente ideal e <span class=\"hl\">o que ele realmente precisa</span>.", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-3",
      "layout": "cta",
      "elements": [
        { "id": "s3-heading", "type": "heading", "level": 1, "content": "Gostou?", "textAlign": "center" },
        { "id": "s3-paragraph", "type": "paragraph", "content": "Salve este post e compartilhe com quem precisa ver isso!", "textAlign": "center" },
        { "id": "s3-emoji", "type": "emoji", "content": "\ud83d\udc49", "size": 96 }
      ]
    }
  ]
}
```

### Example 2: Image-Heavy Carousel (2 slides)

This example assumes the ZIP contains `assets/hero.jpg` and `assets/product.jpg`.

```json
{
  "version": 1,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z",
  "id": "example-images",
  "title": "Lancamento do Produto",
  "format": "carousel",
  "canvas": { "width": 1080, "height": 1440 },
  "header": { "handle": "@minhamarca", "showCounter": true },
  "footer": { "text": "MINHA MARCA", "style": "uppercase" },
  "theme": {
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
      "iconColorAlt": "#f59e0b"
    },
    "typography": {
      "heading":   { "family": "Archivo", "weight": 700 },
      "paragraph": { "family": "Archivo", "weight": 400 },
      "subtitle":  { "family": "Archivo", "weight": 500 },
      "tag":       { "family": "Archivo", "weight": 700 },
      "quote":     { "family": "Archivo", "weight": 500 }
    },
    "fontScale": 1
  },
  "slides": [
    {
      "id": "slide-1",
      "layout": "image-full",
      "elements": [
        { "id": "s1-img", "type": "image", "src": "assets/hero.jpg", "alt": "Hero image", "variant": "background" },
        { "id": "s1-overlay", "type": "overlay", "fill": "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" },
        { "id": "s1-tag", "type": "tag", "content": "NOVO", "textAlign": "center" },
        { "id": "s1-heading", "type": "heading", "level": 1, "content": "Conheca nosso <span class=\"hl\">novo produto</span>", "textAlign": "center" },
        { "id": "s1-subtitle", "type": "subtitle", "content": "Design premium para quem exige o melhor", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-2",
      "layout": "image-top",
      "elements": [
        { "id": "s2-img", "type": "image", "src": "assets/product.jpg", "alt": "Foto do produto", "variant": "area", "objectPosition": "50% 30%", "borderRadius": 16 },
        { "id": "s2-heading", "type": "heading", "level": 2, "content": "Detalhes que Importam", "textAlign": "center" },
        { "id": "s2-paragraph", "type": "paragraph", "content": "Cada detalhe foi pensado para oferecer a <span class=\"hl\">melhor experiencia</span> possivel.", "textAlign": "center" }
      ]
    }
  ]
}
```

### Example 3: Stats + Quote Carousel (2 slides)

```json
{
  "version": 1,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z",
  "id": "example-stats-quote",
  "title": "Nossos Resultados",
  "format": "carousel",
  "canvas": { "width": 1080, "height": 1440 },
  "header": { "handle": "@consultoria", "showCounter": true },
  "footer": { "text": "CONSULTORIA PRO", "style": "uppercase" },
  "theme": {
    "name": "Light",
    "colors": {
      "background": "#ffffff",
      "backgroundSubtle": "#f8fafc",
      "text": "#0f172a",
      "textSecondary": "#475569",
      "textMuted": "#94a3b8",
      "highlight": "#f59e0b",
      "accent": "#d97706",
      "divider": "#e2e8f0",
      "cardBackground": "#ffffff",
      "highlightSoft": "rgba(245,158,11,0.08)",
      "highlightBorder": "rgba(245,158,11,0.20)",
      "iconColor": "#f59e0b",
      "iconColorAlt": "#d97706"
    },
    "typography": {
      "heading":   { "family": "Space Grotesk", "weight": 700 },
      "paragraph": { "family": "DM Sans",       "weight": 400 },
      "subtitle":  { "family": "DM Sans",       "weight": 500 },
      "tag":       { "family": "Space Grotesk", "weight": 700 },
      "quote":     { "family": "Playfair Display", "weight": 500 }
    },
    "fontScale": 1
  },
  "slides": [
    {
      "id": "slide-1",
      "layout": "highlight",
      "elements": [
        { "id": "s1-tag", "type": "tag", "content": "RESULTADOS", "textAlign": "center" },
        { "id": "s1-heading", "type": "heading", "level": 2, "content": "Em Numeros", "textAlign": "center" },
        { "id": "s1-highlight", "type": "highlight", "content": "<strong>500+</strong> clientes atendidos, <strong>R$2M</strong> em faturamento gerado, <strong>98%</strong> de satisfacao e <strong>15+</strong> anos de experiencia.", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-2",
      "layout": "quote",
      "elements": [
        {
          "id": "s2-quote",
          "type": "quote",
          "content": "A consultoria transformou completamente a forma como gerenciamos nosso negocio. Os resultados falam por si.",
          "attribution": "Maria Silva, CEO da TechBrasil",
          "textAlign": "center"
        },
        { "id": "s2-divider", "type": "divider" },
        { "id": "s2-highlight", "type": "highlight", "content": "Agende uma conversa gratuita e descubra como podemos ajudar sua empresa.", "textAlign": "center" }
      ]
    }
  ]
}
```

### Example 4: List Carousel with Custom Colors

```json
{
  "version": 1,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z",
  "id": "example-list",
  "title": "Checklist de Lancamento",
  "format": "carousel",
  "canvas": { "width": 1080, "height": 1440 },
  "header": { "handle": "@produtividade", "showCounter": true },
  "footer": { "text": "PRODUTIVIDADE+", "style": "uppercase" },
  "theme": {
    "name": "Custom",
    "colors": {
      "background": "#1a1a2e",
      "backgroundSubtle": "#1f1f38",
      "text": "#eef0ff",
      "textSecondary": "#a8b2d1",
      "textMuted": "#6272a4",
      "highlight": "#50fa7b",
      "accent": "#3ad68a",
      "divider": "#2a2a4a",
      "cardBackground": "#1e1e36",
      "highlightSoft": "rgba(80,250,123,0.10)",
      "highlightBorder": "rgba(80,250,123,0.25)",
      "iconColor": "#50fa7b",
      "iconColorAlt": "#3ad68a"
    },
    "typography": {
      "heading":   { "family": "Inter", "weight": 700 },
      "paragraph": { "family": "Inter", "weight": 400 },
      "subtitle":  { "family": "Inter", "weight": 500 },
      "tag":       { "family": "Inter", "weight": 700 },
      "quote":     { "family": "Inter", "weight": 500 }
    },
    "fontScale": 1
  },
  "slides": [
    {
      "id": "slide-1",
      "layout": "cover",
      "elements": [
        { "id": "s1-emoji", "type": "emoji", "content": "\u2705", "size": 96 },
        { "id": "s1-heading", "type": "heading", "level": 1, "content": "Checklist de <span class=\"hl\">Lancamento</span>", "textAlign": "center" },
        { "id": "s1-subtitle", "type": "subtitle", "content": "Tudo o que voce precisa antes de lancar", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-2",
      "layout": "list",
      "elements": [
        { "id": "s2-heading", "type": "heading", "level": 2, "content": "Antes do Lancamento", "textAlign": "center" },
        { "id": "s2-li1", "type": "list-item", "icon": "\u2713", "content": "<strong>Valide</strong> a ideia com seu publico", "textAlign": "left" },
        { "id": "s2-li2", "type": "list-item", "icon": "\u2713", "content": "Crie uma <span class=\"hl\">landing page</span>", "textAlign": "left" },
        { "id": "s2-li3", "type": "list-item", "icon": "\u2713", "content": "Prepare o <strong>conteudo</strong> de lancamento", "textAlign": "left" },
        { "id": "s2-li4", "type": "list-item", "icon": "\u2713", "content": "Configure o <span class=\"hl\">funil de vendas</span>", "textAlign": "left" },
        { "id": "s2-li5", "type": "list-item", "icon": "\u2713", "content": "Teste tudo antes de publicar", "textAlign": "left" }
      ]
    }
  ]
}
```

---

## 11. Generating the ZIP File (for AI agents)

When creating a ZIP programmatically (e.g., in a Node.js script or browser):

```javascript
import JSZip from 'jszip';

const zip = new JSZip();

// 1. Add schema.json
const schema = { /* ... your schema object ... */ };
zip.file('schema.json', JSON.stringify(schema, null, 2));

// 2. Add assets (if any)
// zip.file('assets/cover.jpg', imageBuffer);
// zip.file('assets/photo.png', imageBuffer);

// 3. Generate the ZIP
const blob = await zip.generateAsync({ type: 'blob' });
// or for Node.js:
// const buffer = await zip.generateAsync({ type: 'nodebuffer' });
```

If you cannot programmatically generate a ZIP, provide the `schema.json` content as a code block and instruct the user to place it in a ZIP with any required images in an `assets/` folder.

---

## 12. Quick Validation Checklist

Before delivering a schema.json, verify:

- [ ] `version` is `1` (number, not string)
- [ ] `slides` is a non-empty array
- [ ] `theme` is an object with `colors` (13 fields), `typography` (5 categories), `fontScale`
- [ ] `canvas` is `{ "width": 1080, "height": 1440 }`
- [ ] Every element has a unique `id` across all slides
- [ ] Every element has a valid `type` from the 12 types
- [ ] Heading elements have a `level` (1, 2, or 3)
- [ ] Image elements have a `variant` ("area", "background", or "inline")
- [ ] Image elements have a `src` (can be empty string for placeholder)
- [ ] Spacer elements have a `height` number
- [ ] Overlay elements have a `fill` string
- [ ] Font families are from the 12 supported fonts
- [ ] Asset references match files in the `assets/` folder
- [ ] Freeform elements have `x`, `y`, and `w` set
- [ ] `createdAt` and `updatedAt` are valid ISO 8601 strings
- [ ] `format` is `"carousel"` or `"single-post"`
