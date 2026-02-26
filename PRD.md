# PRD — Carousel Editor V2: UI/UX Overhaul

> Gerado automaticamente pela varredura de 3 agentes exploradores.
> Data: 2026-02-25

---

## FASE 1: BUGS CRÍTICOS (Bloqueia uso)

### BUG-01: Freeform handles hardcoded amarelo (#fbbf24)
- **Arquivo**: `src/styles/slide.css` linhas 365, 370, 382, 405, 414
- **Problema**: Outline de seleção, drag handle e resize handle usam #fbbf24 hardcoded
- **Fix**: Usar CSS variable `var(--highlight)` que já é definida pelo tema
- **Impacto**: Visual quebrado em qualquer tema

### BUG-02: ElementControls com cores hardcoded
- **Arquivo**: `src/components/editor/SlideRenderer.tsx` linhas 54-58, 94-96
- **Problema**: Background `rgba(30,30,40,0.85)`, text `#aaa`, delete hover `#f87171`
- **Fix**: Usar Tailwind classes com tokens semânticos

### BUG-03: ProjectCard cores hardcoded
- **Arquivo**: `src/components/gallery/ProjectCard.tsx` linhas 43, 67
- **Problema**: `bg-black/60`, `text-white`, `bg-black/40` hardcoded
- **Fix**: Usar tokens de tema (`bg-card/80`, `text-card-foreground`)

### BUG-04: Slider thumb bg-white
- **Arquivo**: `src/components/ui/slider.tsx` linha 56
- **Problema**: `bg-white` hardcoded, invisível no tema claro com fundo claro
- **Fix**: Usar `bg-background`

### BUG-05: exportAllSlidesPng() incompleto
- **Arquivo**: `src/lib/export-png.ts` linhas 55-104
- **Problema**: Só exporta o slide visível, ignora `slideCount`
- **Fix**: Iterar todos os slides navegando um por um e capturando cada PNG

### BUG-06: PNG export filter frágil
- **Arquivo**: `src/lib/export-png.ts` linhas 33-36
- **Problema**: Filtra por título em português hardcoded ("Mover pra cima")
- **Fix**: Usar data-attributes (`data-editor-control`) para filtrar

---

## FASE 2: FREEFORM EDITOR — Smart Guides & Alignment

### FEAT-01: Smart Guides (Guias Inteligentes)
- **Hook novo**: `src/hooks/useSmartGuides.ts`
- **Comportamento**:
  - Linhas horizontais e verticais aparecem quando um elemento se alinha com outro
  - Snap ao centro do slide (540px H, 720px V)
  - Snap às bordas do slide (0, 1080, 0, 1440)
  - Snap a bordas e centros de outros elementos
  - Threshold de snap: 5px em coordenadas do slide
  - Linhas guia: 1px dashed com cor `var(--highlight)`
- **Renderização**: SVG overlay no slide durante drag
- **Integração**: Modificar `useFreeformDrag.ts` para chamar snap logic

### FEAT-02: Alinhamento via Toolbar
- **Componente**: Botões de alinhamento no `FormattingToolbar.tsx` ou novo `AlignmentToolbar.tsx`
- **Ações** (para freeform):
  - Alinhar à esquerda, centro, direita (relativo ao slide)
  - Alinhar ao topo, meio, base (relativo ao slide)
- **Keyboard shortcuts**: (opcionais, fase futura)

### FEAT-03: Arrow Key Nudge
- **Arquivo**: `src/components/editor/EditorWorkspace.tsx`
- **Comportamento**: Quando um elemento freeform está selecionado:
  - Arrow keys movem 1px
  - Shift+Arrow movem 10px
- **Integração**: Adicionar ao `handleKeyDown` existente

### FEAT-04: Centralização de Texto
- **Arquivo**: `src/components/editor/FormattingToolbar.tsx`
- **Adicionar**: Botões text-align (left, center, right)
- **Implementação**: `document.execCommand('justify*')` ou CSS class no elemento
- **Schema**: Adicionar `textAlign?: 'left' | 'center' | 'right'` ao BaseElement

---

## FASE 3: UI POLISH — Padronização Visual

### POLISH-01: Freeform selection consistente com flow layout
- **Problema**: Flow usa `outline-primary/60` (Tailwind), Freeform usa `#fbbf24` (CSS)
- **Fix**: Ambos devem usar a mesma cor. Freeform CSS → `var(--highlight)` ou manter um padrão único de editor

### POLISH-02: ElementControls modernizado
- **Problema**: Inline styles, cores hardcoded
- **Fix**: Refatorar para Tailwind classes, usar shadcn/ui Button mini

### POLISH-03: FormattingToolbar melhorado
- **Adicionar**: Botões de text-align (left/center/right)
- **Adicionar**: Color picker inline para texto
- **Melhorar**: Layout responsivo

### POLISH-04: Drag handle e resize handle estilizados
- **Fix slide.css**: Trocar todas referências #fbbf24 por `var(--highlight)`
- **Fix resize border**: `#0a0e1a` → `var(--bg)` para funcionar em ambos temas

### POLISH-05: RightPanel propriedades freeform
- **Melhorar**: Inputs de x, y, w, h com labels claros
- **Adicionar**: Botões de alinhamento rápido (center H, center V)

---

## FASE 4: FUNCIONALIDADES COMPLEMENTARES

### FEAT-05: Keyboard Shortcuts Completos
- `Ctrl/Cmd+Z` — Undo (JÁ EXISTE em editor-client.tsx)
- `Ctrl/Cmd+Shift+Z` — Redo (JÁ EXISTE)
- `Ctrl/Cmd+S` — Save (JÁ EXISTE)
- `Ctrl/Cmd+D` — Duplicar elemento selecionado (NOVO)
- `Delete/Backspace` — Deletar elemento (JÁ EXISTE)
- `Escape` — Deselecionar (JÁ EXISTE)
- `Arrow Keys` — Nudge freeform element (NOVO - FEAT-03)

### FEAT-06: Batch PNG Export Real
- Implementar navegação programática entre slides
- Capturar cada slide em sequência
- Empacotar todos os PNGs no ZIP

### FEAT-07: Context Menu (Right-click)
- **Em elementos**: Duplicar, Deletar, Mover pra cima/baixo, Copiar estilo
- **No slide vazio**: Adicionar elemento, Colar
- **Implementação**: Radix ContextMenu

---

## PRIORIDADES DE EXECUÇÃO

| # | Item | Tipo | Complexidade | Dependência |
|---|------|------|-------------|-------------|
| 1 | BUG-01 | Bug | Baixa | - |
| 2 | BUG-02 | Bug | Baixa | - |
| 3 | BUG-03 | Bug | Baixa | - |
| 4 | BUG-04 | Bug | Trivial | - |
| 5 | POLISH-01 | Polish | Baixa | BUG-01 |
| 6 | POLISH-04 | Polish | Baixa | BUG-01 |
| 7 | POLISH-02 | Polish | Média | BUG-02 |
| 8 | FEAT-04 | Feature | Média | - |
| 9 | FEAT-01 | Feature | Alta | - |
| 10 | FEAT-03 | Feature | Baixa | - |
| 11 | FEAT-02 | Feature | Média | FEAT-01 |
| 12 | BUG-05 | Bug | Alta | - |
| 13 | BUG-06 | Bug | Baixa | - |
| 14 | FEAT-05 | Feature | Baixa | - |
| 15 | POLISH-03 | Polish | Média | FEAT-04 |
| 16 | POLISH-05 | Polish | Baixa | - |
| 17 | FEAT-06 | Feature | Alta | BUG-06 |
| 18 | FEAT-07 | Feature | Média | - |

---

## ARQUIVOS CRÍTICOS

| Arquivo | Motivo |
|---------|--------|
| `src/styles/slide.css` | Cores hardcoded, freeform handles |
| `src/components/editor/SlideRenderer.tsx` | ElementControls, ElementWrapper |
| `src/components/editor/FreeformElement.tsx` | Drag/resize wrapper |
| `src/hooks/useFreeformDrag.ts` | Lógica de drag/resize |
| `src/components/editor/FormattingToolbar.tsx` | Toolbar de formatação |
| `src/components/editor/EditorWorkspace.tsx` | Keyboard shortcuts, layout |
| `src/components/editor/RightPanel.tsx` | Propriedades de elemento |
| `src/components/gallery/ProjectCard.tsx` | Cores hardcoded |
| `src/lib/export-png.ts` | Export bugado |
| `src/types/schema.ts` | Default themes amber |
