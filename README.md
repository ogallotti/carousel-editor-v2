# Carousel Editor V2

Editor visual local-first para carrosséis de Instagram. Crie, edite e exporte slides como imagens PNG — tudo roda no navegador, sem backend.

## Stack

- **Next.js 16** (App Router, client-side rendering)
- **Tailwind CSS 4** + **shadcn/ui** (Radix)
- **Dexie.js 4** (IndexedDB, persistência local)
- **html-to-image** + **JSZip** (export PNG/ZIP)

## Começando

```bash
npm install
npm run dev        # http://localhost:3000
```

## Comandos

```bash
npm run dev        # Dev server
npm run build      # Build de produção
npm run start      # Servidor de produção
npm run lint       # ESLint
```

## Funcionalidades

- 12 tipos de elementos (heading, paragraph, tag, image, overlay, quote, list-item, etc.)
- 11 layouts (cover, title-body, freeform, image-full, quote, list, cta, etc.)
- Temas customizáveis (cores, tipografia, 12 Google Fonts)
- Modo freeform com drag/resize, smart guides e nudge por teclado
- Edição de texto inline com duplo-clique
- Undo/redo (50 níveis) com coalesce para sliders
- Export PNG individual ou ZIP em lote
- Import/export ZIP (schema.json + assets) para interoperabilidade com agentes IA
- Auto-save com debounce de 2s para IndexedDB
- Gradientes customizáveis (linear, radial)
- Temas customizados (salvar/carregar do IndexedDB)

## Dimensões

Slides: **1080x1440px** (Instagram 4:5 portrait)

## Interoperabilidade IA

O editor importa/exporta arquivos `.zip` contendo `schema.json` + pasta `assets/`. O schema segue o formato CarouselSchema v1 definido em `src/types/schema.ts`. Schemas são normalizados e sanitizados automaticamente no import.

## Deploy

Vercel (Next.js padrão) ou qualquer host que suporte Next.js.
