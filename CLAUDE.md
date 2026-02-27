# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Carousel Editor V2 — Local-First, AI-First visual editor for Instagram carousels. Users create, edit, and export carousel slides as PNG images. Data persists locally in IndexedDB. Interoperability with AI agents via .zip packages containing schema.json + assets.

## Commands

```bash
npm run dev        # Start Next.js dev server
npm run build      # Build for production (.next/)
npm run start      # Start production server
npm run lint       # ESLint
```

## Architecture

### 100% Client-Side (No Backend)
- Next.js 16 with App Router, SSR mode (no `output: 'export'`)
- ALL pages use `'use client'` — this is a CSR-only app
- No API routes, no server components for data
- Deploy target: Vercel (standard Next.js), localhost for dev

### Local-First Persistence
- **Dexie.js 4** wrapping IndexedDB
- Database defined in `src/lib/db.ts`
- Tables: projects, projectData, assets, settings, customThemes, gradientPresets
- Auto-save with 2s debounce

### AI Interoperability (ZIP Standard)
- Import/export .zip files containing `schema.json` + `assets/` folder
- Schema contract defined in `src/types/schema.ts`
- ZIP handling via JSZip in `src/lib/zip-*.ts`

### Frontend Stack
- **UI**: shadcn/ui (Radix primitives) in `src/components/ui/`
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **Fonts**: 12 Google Fonts loaded via next/font (Afacad, Adamina, Archivo, Inter, Space Grotesk, DM Sans, Poppins, Montserrat, Playfair Display, Merriweather, JetBrains Mono, Fira Code)

### Key Files
- `src/types/schema.ts` — CarouselSchema type (core data model)
- `src/types/editor.ts` — EditorState + EditorAction types
- `src/lib/db.ts` — Dexie database definition (v2)
- `src/lib/projects.ts` — Project CRUD operations
- `src/lib/custom-themes.ts` — Custom theme CRUD (IndexedDB)
- `src/lib/gradient-presets.ts` — Gradient preset CRUD (IndexedDB)
- `src/hooks/useEditorReducer.ts` — Editor state management (50-level undo/redo)
- `src/hooks/useAutoSave.ts` — Auto-save with 2s debounce to IndexedDB
- `src/hooks/useFreeformDrag.ts` — Freeform element drag/resize handling
- `src/hooks/useSmartGuides.ts` — Smart alignment guides during drag
- `src/components/editor/SlideRenderer.tsx` — Visual slide rendering + SelectionToolbar
- `src/components/editor/EditorWorkspace.tsx` — Editor layout, keyboard shortcuts, panel wiring
- `src/components/editor/LeftPanel.tsx` — Slide navigation, add/delete/duplicate/reorder slides
- `src/components/editor/RightPanel.tsx` — Element list + all element properties + DnD reorder
- `src/components/editor/EditorToolbar.tsx` — Top toolbar (undo/redo, export, zoom)
- `src/components/editor/GradientEditor.tsx` — Full gradient editor UI (stops, angle, presets)
- `src/components/editor/ThemeEditorPanel.tsx` — Theme presets, colors, typography, custom theme save/load
- `src/lib/export-png.ts` — PNG export via html-to-image
- `src/lib/schema-validation.ts` — Schema validation, migration, normalization (element defaults, HTML sanitization, ID deduplication)
- `src/lib/asset-urls.tsx` — Asset blob URL lifecycle management
- `src/styles/slide.css` — Slide CSS (1080x1440px, CSS variables)
- `src/lib/theme-utils.ts` — Theme to CSS variable mapping

### Canvas & Export
- Slide dimensions: 1080x1440px (Instagram 4:5 portrait)
- PNG export via html-to-image
- Batch export as ZIP of PNGs via JSZip

### CSS Variable Architecture
- `--slide-highlight`, `--slide-accent`, `--slide-bg`, `--slide-text`, etc. = **slide theme** colors (content styling, prefixed to avoid shadcn/Tailwind collision)
- `--editor-accent`, `--editor-accent-soft`, `--editor-accent-border` = **editor UI** colors (selection, handles) — always blue #2563eb, independent of slide theme
- Mapping: `theme.colors.background` → `--slide-bg`, `theme.colors.text` → `--slide-text`, etc. See `src/lib/theme-utils.ts` for the full mapping.

### Editor Patterns
- **Background pseudo-element**: `BG_PSEUDO_ID = '__bg__'` in RightPanel — slide background appears as the last item in the element list (bottom = back in z-stack). No delete/move buttons. Click to edit background properties (theme/solid/gradient/image).
- **Double-click text editing**: Single click selects element (move/resize). Double click enters text editing mode (`editingTextId` state in SlideRenderer). `EditableText` memo component prevents React from overwriting live DOM during contentEditable editing. Escape exits text editing first, then deselects element (two-level).
- **Image crop mode**: Double-click on images (element or slide background) enters crop mode — drag to reposition `objectPosition`/`backgroundPosition`. Escape exits.
- **Freeform layout**: Elements use absolute positioning with drag/resize handles, smart guides, and arrow key nudge. All document-level event handlers use refs to avoid stale closures.
- **data-editor-control**: Attribute on UI controls that should be excluded from PNG export (drag handles, resize handles, smart guide overlay, layout toggle, etc.).
- **Two toolbar layers**: RightPanel has ALL canonical element properties (type, font, margins, alignment, color, opacity, etc.). SelectionToolbar (floating) appears only during text editing (`editingTextId`) for inline span overrides (bold, italic, underline, color, size).
- **Undo coalesce**: Rapid same-type actions on the same element within 500ms are coalesced into a single undo entry (prevents slider dragging from flooding undo stack).
- **Schema migration on load**: Both ZIP import and IndexedDB load pass schema through `migrateSchema()` which normalizes elements (textAlign, opacity, heading level, etc.) and sanitizes HTML content.
- **Radix UI gotcha**: `<SelectItem value="">` crashes — use sentinel `"__default__"` and convert in `onValueChange`.
- **Element DnD reorder**: RightPanel element list uses HTML5 drag-and-drop (reversed display order → array index conversion).

## Schema Version
Current: v1. See `src/types/schema.ts` for the full spec.

## UI Language
All user-facing text is in **Brazilian Portuguese**.

## Element Types (12)
tag, heading, paragraph, subtitle, emoji, image, overlay, quote, list-item, highlight, divider, spacer

## Layout Types (11)
cover, title-body, full-text, image-top, image-bottom, image-full, quote, list, highlight, cta, freeform
