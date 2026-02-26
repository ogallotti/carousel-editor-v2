# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Carousel Editor V2 — Local-First, AI-First visual editor for Instagram carousels. Users create, edit, and export carousel slides as PNG images. Data persists locally in IndexedDB. Interoperability with AI agents via .zip packages containing schema.json + assets.

## Commands

```bash
npm run dev        # Start Next.js dev server
npm run build      # Build static export to out/
npm run start      # Serve the static build
npm run lint       # ESLint
```

## Architecture

### 100% Client-Side (No Backend)
- Next.js 16 with App Router, `output: 'export'` for static hosting
- ALL pages use `'use client'` — this is a CSR-only app
- No API routes, no server components for data
- Deploy target: Vercel (static), localhost for dev

### Local-First Persistence
- **Dexie.js 4** wrapping IndexedDB
- Database defined in `src/lib/db.ts`
- Tables: projects, projectData, assets, settings, customThemes
- Auto-save with 2s debounce

### AI Interoperability (ZIP Standard)
- Import/export .zip files containing `schema.json` + `assets/` folder
- Schema contract defined in `src/types/schema.ts`
- ZIP handling via JSZip in `src/lib/zip-*.ts`

### Frontend Stack
- **UI**: shadcn/ui (Radix primitives) in `src/components/ui/`
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **Fonts**: 9 Google Fonts loaded via next/font (Archivo, Inter, Space Grotesk, DM Sans, Poppins, Montserrat, Playfair Display, Merriweather, JetBrains Mono)

### Key Files
- `src/types/schema.ts` — CarouselSchema type (core data model)
- `src/types/editor.ts` — EditorState + EditorAction types
- `src/lib/db.ts` — Dexie database definition
- `src/lib/projects.ts` — Project CRUD operations
- `src/hooks/useEditorReducer.ts` — Editor state management (50-level undo/redo)
- `src/components/editor/SlideRenderer.tsx` — Visual slide rendering
- `src/components/editor/EditorWorkspace.tsx` — Editor layout, keyboard shortcuts, panel wiring
- `src/components/editor/RightPanel.tsx` — Element list + properties panel + theme editor
- `src/styles/slide.css` — Slide CSS (1080x1440px, CSS variables)
- `src/lib/theme-utils.ts` — Theme to CSS variable mapping

### Canvas & Export
- Slide dimensions: 1080x1440px (Instagram 4:5 portrait)
- PNG export via html-to-image
- Batch export as ZIP of PNGs via JSZip

### CSS Variable Architecture
- `--highlight`, `--accent`, `--bg`, etc. = **slide theme** colors (content styling)
- `--editor-accent`, `--editor-accent-soft`, `--editor-accent-border` = **editor UI** colors (selection, handles) — always indigo #6366f1, independent of slide theme

### Editor Patterns
- **Background pseudo-element**: `BG_PSEUDO_ID = '__bg__'` in RightPanel — slide background appears as the last item in the element list (bottom = back in z-stack). No delete/move buttons. Click to edit background properties (theme/solid/gradient/image).
- **Image crop mode**: Double-click on images (element or slide background) enters crop mode — drag to reposition `objectPosition`/`backgroundPosition`. Escape exits.
- **Freeform layout**: Elements use absolute positioning with drag/resize handles, smart guides, and arrow key nudge.
- **data-editor-control**: Attribute on UI controls that should be excluded from PNG export.

## Schema Version
Current: v1. See `src/types/schema.ts` for the full spec.

## UI Language
All user-facing text is in **Brazilian Portuguese**.

## Element Types (13)
tag, heading, paragraph, subtitle, emoji, image, overlay, quote, stat, list-item, highlight, divider, spacer

## Layout Types (12)
cover, title-body, full-text, image-top, image-bottom, image-full, stats, quote, list, highlight, cta, freeform
