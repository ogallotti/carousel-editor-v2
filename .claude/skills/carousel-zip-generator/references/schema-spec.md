# CarouselSchema — Full Specification

Complete JSON schema for the carousel interchange format (v1).

## Top-Level: CarouselSchema

```json
{
  "$schema": "https://carousel-editor.app/schema/v1.json",
  "version": 1,
  "generator": "ai-carousel-generator",
  "generatorVersion": "1.0.0",
  "createdAt": "ISO-8601 string",
  "updatedAt": "ISO-8601 string",

  "id": "string (unique project ID)",
  "title": "string (project title)",
  "description": "string (optional)",
  "tags": ["string array (optional)"],
  "format": "carousel | single-post",

  "canvas": {
    "width": 1080,
    "height": 1440
  },

  "header": {
    "handle": "@username",
    "showCounter": true
  },

  "footer": {
    "text": "BRAND NAME",
    "style": "uppercase | normal"
  },

  "theme": { "→ see Theme section below" },
  "slides": [ "→ see Slide section below" ]
}
```

### Field Reference

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `$schema` | string | no | — | Optional URL reference |
| `version` | number | **yes** | — | Always `1` |
| `generator` | string | no | — | Tool that created this schema |
| `generatorVersion` | string | no | — | Version of the generator |
| `createdAt` | string | **yes** | — | ISO-8601 timestamp |
| `updatedAt` | string | **yes** | — | ISO-8601 timestamp |
| `id` | string | **yes** | — | Unique project ID (overwritten on import) |
| `title` | string | **yes** | — | Displayed in project gallery |
| `description` | string | no | — | Project description |
| `tags` | string[] | no | — | Searchable tags |
| `format` | string | **yes** | `"carousel"` | `"carousel"` or `"single-post"` |
| `canvas.width` | number | **yes** | `1080` | Always 1080 |
| `canvas.height` | number | **yes** | `1440` | Always 1440 |
| `header.handle` | string | **yes** | `"@meuhandle"` | Instagram handle displayed in header |
| `header.showCounter` | boolean | **yes** | `true` | Show slide counter (e.g., "1/5") |
| `footer.text` | string | **yes** | `"MINHA MARCA"` | Brand text in footer |
| `footer.style` | string | **yes** | `"uppercase"` | `"uppercase"` or `"normal"` |
| `theme` | Theme | **yes** | — | See Theme section |
| `slides` | Slide[] | **yes** | — | Array of slides |

Unknown fields are preserved (forward compatibility).

---

## Slide

```json
{
  "id": "unique-slide-id",
  "layout": "title-body",
  "elements": [ ... ],
  "background": "#0a0e1a",
  "backgroundImage": "assets/bg.jpg",
  "backgroundPosition": "center"
}
```

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | string | **yes** | — | Unique within carousel |
| `layout` | SlideLayout | **yes** | `"title-body"` | One of 11 layout types |
| `elements` | SlideElement[] | **yes** | `[]` | Ordered array of elements |
| `background` | string \| null | no | `null` | Hex color or CSS gradient string |
| `backgroundImage` | string \| null | no | `null` | Asset path (e.g., `"assets/bg.jpg"`) |
| `backgroundPosition` | string | no | `"center"` | CSS background-position value |

### SlideLayout (11 types)

`"cover"` · `"title-body"` · `"full-text"` · `"image-top"` · `"image-bottom"` · `"image-full"` · `"quote"` · `"list"` · `"highlight"` · `"cta"` · `"freeform"`

### Background Priority

1. If `backgroundImage` is set → full-slide background image
2. Else if `background` is set → solid color or CSS gradient
3. Else → theme background color (`theme.colors.background`)

### Gradient Backgrounds

Gradients are stored as CSS strings in the `background` field:

```json
"background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
"background": "radial-gradient(circle at center, #1a1a2e 0%, #16213e 100%)"
```

---

## Theme

```json
{
  "name": "Custom Theme",
  "colors": { "→ see ThemeColors" },
  "typography": { "→ see ThemeTypography" },
  "fontScale": 1,
  "elementGap": 24
}
```

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `name` | string | **yes** | `"Dark"` | Theme display name |
| `colors` | ThemeColors | **yes** | — | All 13 color properties |
| `typography` | ThemeTypography | **yes** | — | 5 typography categories |
| `fontScale` | number | **yes** | `1` | Range: 0.7–1.3 |
| `elementGap` | number | no | `24` | Range: 0–80px, gap between elements |

### ThemeColors (13 properties, all required)

```json
{
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
}
```

| Color | Purpose | CSS Variable |
|-------|---------|-------------|
| `background` | Slide background | `--bg` |
| `backgroundSubtle` | Subtle bg variant | `--bg-subtle` |
| `text` | Primary text (headings) | `--text` |
| `textSecondary` | Body text, paragraphs | `--text-secondary` |
| `textMuted` | Footer, header text | `--text-muted` |
| `highlight` | Primary accent (tags, icons) | `--highlight` |
| `accent` | Secondary accent | `--accent` |
| `divider` | Divider lines | `--divider` |
| `cardBackground` | Card/container bg | `--card-bg` |
| `highlightSoft` | Highlight block background | `--highlight-soft` |
| `highlightBorder` | Highlight block border | `--highlight-border` |
| `iconColor` | List item icons, quote marks | `--icon-color` |
| `iconColorAlt` | Secondary icon color | `--icon-color-alt` |

### ThemeTypography (5 categories, all required)

```json
{
  "heading":   { "family": "Archivo", "weight": 700 },
  "paragraph": { "family": "Archivo", "weight": 400 },
  "subtitle":  { "family": "Archivo", "weight": 500 },
  "tag":       { "family": "Archivo", "weight": 700 },
  "quote":     { "family": "Archivo", "weight": 500 }
}
```

Each category: `{ "family": "FontName", "weight": 400–900 }`

**Available families**: Afacad, Adamina, Archivo, Inter, Space Grotesk, DM Sans, Poppins, Montserrat, Playfair Display, Merriweather, JetBrains Mono, Fira Code

**Available weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extra), 900 (Black)

---

## BaseElement (shared by all element types)

Every element inherits these fields:

```json
{
  "id": "unique-element-id",
  "type": "heading",

  "marginTop": 0,
  "marginBottom": 0,
  "fontSize": null,
  "textAlign": "center",
  "fontFamily": null,
  "fontWeight": null,
  "color": null,
  "opacity": null,

  "x": null,
  "y": null,
  "w": null,
  "h": null,
  "rotation": null,
  "zIndex": null
}
```

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | string | **yes** | — | Unique within slide |
| `type` | ElementType | **yes** | — | One of 12 element types |
| `marginTop` | number | no | — | Pixels, top margin |
| `marginBottom` | number | no | — | Pixels, bottom margin |
| `fontSize` | number | no | — | Pixels, overrides theme default |
| `textAlign` | string | no | `"center"` | `"left"`, `"center"`, or `"right"` |
| `fontFamily` | string | no | — | Overrides theme font for this element |
| `fontWeight` | number | no | — | Overrides theme weight |
| `color` | string | no | — | Hex color, overrides theme |
| `opacity` | number | no | `1` | Range: 0–1 |
| `x` | number | no | — | Freeform only: left position (px) |
| `y` | number | no | — | Freeform only: top position (px) |
| `w` | number | no | — | Freeform only: width (px) |
| `h` | number | no | — | Freeform only: height (px) |
| `rotation` | number | no | — | Freeform only: degrees |
| `zIndex` | number | no | — | Freeform only: stacking order |

Freeform fields (`x`, `y`, `w`, `h`, `rotation`, `zIndex`) are only meaningful when the slide's `layout` is `"freeform"`. In other layouts they are ignored.

---

## Validation Rules (Import)

The importer validates:
1. `version` must be a number
2. `slides` must be an array
3. `theme` must be an object
4. `canvas` must be an object

Missing fields are auto-filled with defaults during migration. Unknown fields are preserved.

The `id` field is overwritten with a new project ID on import — you can use any value.
