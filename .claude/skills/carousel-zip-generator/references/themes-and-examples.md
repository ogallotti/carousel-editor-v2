# Themes & Complete Examples

## Built-in Theme: Dark (Default)

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
    "heading": { "family": "Archivo", "weight": 700 },
    "paragraph": { "family": "Archivo", "weight": 400 },
    "subtitle": { "family": "Archivo", "weight": 500 },
    "tag": { "family": "Archivo", "weight": 700 },
    "quote": { "family": "Archivo", "weight": 500 }
  },
  "fontScale": 1,
  "elementGap": 24
}
```

## Built-in Theme: Light

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
    "heading": { "family": "Archivo", "weight": 700 },
    "paragraph": { "family": "Archivo", "weight": 400 },
    "subtitle": { "family": "Archivo", "weight": 500 },
    "tag": { "family": "Archivo", "weight": 700 },
    "quote": { "family": "Archivo", "weight": 500 }
  },
  "fontScale": 1,
  "elementGap": 24
}
```

## Custom Theme Tips

When creating a custom theme:

1. **Start from Dark or Light** and change the accent colors
2. **Derived colors** — `highlightSoft` should be your `highlight` color at 8–10% opacity. `highlightBorder` at 20–25% opacity.
3. **Contrast** — Ensure `text` has high contrast against `background`. Use `textSecondary` for body text (slightly muted).
4. **Icon colors** — Typically match `highlight` and `accent`.

### Popular Color Schemes

**Dark + Blue accent:**
```json
"highlight": "#3b82f6", "accent": "#2563eb",
"highlightSoft": "rgba(59,130,246,0.10)", "highlightBorder": "rgba(59,130,246,0.25)",
"iconColor": "#3b82f6", "iconColorAlt": "#2563eb"
```

**Dark + Green accent:**
```json
"highlight": "#22c55e", "accent": "#16a34a",
"highlightSoft": "rgba(34,197,94,0.10)", "highlightBorder": "rgba(34,197,94,0.25)",
"iconColor": "#22c55e", "iconColorAlt": "#16a34a"
```

**Dark + Rose accent:**
```json
"highlight": "#f43f5e", "accent": "#e11d48",
"highlightSoft": "rgba(244,63,94,0.10)", "highlightBorder": "rgba(244,63,94,0.25)",
"iconColor": "#f43f5e", "iconColorAlt": "#e11d48"
```

**Dark + Purple accent:**
```json
"highlight": "#a855f7", "accent": "#9333ea",
"highlightSoft": "rgba(168,85,247,0.10)", "highlightBorder": "rgba(168,85,247,0.25)",
"iconColor": "#a855f7", "iconColorAlt": "#9333ea"
```

## Available Font Families

| Font | Style | Best For |
|------|-------|----------|
| Archivo | Geometric sans-serif | Default, versatile |
| Inter | Clean sans-serif | Modern, readable |
| Space Grotesk | Geometric display | Tech, modern |
| DM Sans | Friendly sans-serif | Casual, approachable |
| Poppins | Rounded sans-serif | Friendly, modern |
| Montserrat | Elegant sans-serif | Professional, elegant |
| Playfair Display | Serif display | Luxurious, editorial |
| Merriweather | Readable serif | Classic, literary |
| JetBrains Mono | Monospace | Code, technical |
| Fira Code | Monospace with ligatures | Code, technical |
| Afacad | Modern sans-serif | Contemporary, clean |
| Adamina | Serif | Traditional, refined |

### Font Pairing Suggestions

| Heading | Body | Vibe |
|---------|------|------|
| Archivo (700) | Archivo (400) | Clean, consistent |
| Playfair Display (700) | Inter (400) | Elegant + readable |
| Space Grotesk (700) | DM Sans (400) | Tech + friendly |
| Montserrat (800) | Poppins (400) | Modern + approachable |
| Merriweather (700) | Inter (400) | Classic + clean |

---

## Example 1: Simple 5-Slide Dark Carousel (Text-Only)

Topic: "5 Dicas de Produtividade"

```json
{
  "version": 1,
  "generator": "ai-carousel-generator",
  "generatorVersion": "1.0.0",
  "createdAt": "2026-02-26T12:00:00.000Z",
  "updatedAt": "2026-02-26T12:00:00.000Z",
  "id": "prod-tips-001",
  "title": "5 Dicas de Produtividade",
  "format": "carousel",
  "canvas": { "width": 1080, "height": 1440 },
  "header": { "handle": "@seuperfil", "showCounter": true },
  "footer": { "text": "SEU PERFIL", "style": "uppercase" },
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
      "heading": { "family": "Archivo", "weight": 700 },
      "paragraph": { "family": "Inter", "weight": 400 },
      "subtitle": { "family": "Inter", "weight": 500 },
      "tag": { "family": "Archivo", "weight": 700 },
      "quote": { "family": "Playfair Display", "weight": 500 }
    },
    "fontScale": 1,
    "elementGap": 24
  },
  "slides": [
    {
      "id": "slide-cover",
      "layout": "cover",
      "elements": [
        { "id": "em01", "type": "emoji", "content": "⚡", "size": 96 },
        { "id": "hd01", "type": "heading", "level": 1, "content": "5 Dicas de Produtividade", "textAlign": "center" },
        { "id": "st01", "type": "subtitle", "content": "Transforme sua rotina hoje", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-tip1",
      "layout": "title-body",
      "elements": [
        { "id": "tg02", "type": "tag", "content": "DICA 1" },
        { "id": "hd02", "type": "heading", "level": 2, "content": "Comece Pelo Mais Difícil", "textAlign": "center" },
        { "id": "pr02", "type": "paragraph", "content": "Faça a tarefa mais desafiadora logo pela manhã, quando sua energia está no pico. O resto do dia fica mais leve.", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-tip2",
      "layout": "title-body",
      "elements": [
        { "id": "tg03", "type": "tag", "content": "DICA 2" },
        { "id": "hd03", "type": "heading", "level": 2, "content": "Use Blocos de Tempo", "textAlign": "center" },
        { "id": "pr03", "type": "paragraph", "content": "Divida seu dia em blocos de 90 minutos focados. Faça pausas de 15 minutos entre eles.", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-tip3",
      "layout": "highlight",
      "elements": [
        { "id": "hd04", "type": "heading", "level": 2, "content": "Dica Bônus", "textAlign": "center" },
        { "id": "hl04", "type": "highlight", "content": "Pessoas que planejam o dia na noite anterior são 25% mais produtivas.", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-cta",
      "layout": "cta",
      "elements": [
        { "id": "hd05", "type": "heading", "level": 1, "content": "Gostou?", "textAlign": "center" },
        { "id": "pr05", "type": "paragraph", "content": "Salve este post e compartilhe com alguém que precisa dessas dicas!", "textAlign": "center" },
        { "id": "em05", "type": "emoji", "content": "👉", "size": 96 }
      ]
    }
  ]
}
```

---

## Example 2: Image Carousel with Background Photo

Topic: "Destinos de Viagem" (requires image assets in ZIP)

```json
{
  "version": 1,
  "generator": "ai-carousel-generator",
  "generatorVersion": "1.0.0",
  "createdAt": "2026-02-26T12:00:00.000Z",
  "updatedAt": "2026-02-26T12:00:00.000Z",
  "id": "travel-001",
  "title": "Destinos Incríveis 2026",
  "format": "carousel",
  "canvas": { "width": 1080, "height": 1440 },
  "header": { "handle": "@viajemais", "showCounter": true },
  "footer": { "text": "VIAJE MAIS", "style": "uppercase" },
  "theme": {
    "name": "Dark Travel",
    "colors": {
      "background": "#0f172a",
      "backgroundSubtle": "#1e293b",
      "text": "#ffffff",
      "textSecondary": "#e2e8f0",
      "textMuted": "#94a3b8",
      "highlight": "#38bdf8",
      "accent": "#0ea5e9",
      "divider": "#334155",
      "cardBackground": "#1e293b",
      "highlightSoft": "rgba(56,189,248,0.10)",
      "highlightBorder": "rgba(56,189,248,0.25)",
      "iconColor": "#38bdf8",
      "iconColorAlt": "#0ea5e9"
    },
    "typography": {
      "heading": { "family": "Montserrat", "weight": 800 },
      "paragraph": { "family": "DM Sans", "weight": 400 },
      "subtitle": { "family": "DM Sans", "weight": 500 },
      "tag": { "family": "Montserrat", "weight": 700 },
      "quote": { "family": "Playfair Display", "weight": 500 }
    },
    "fontScale": 1,
    "elementGap": 24
  },
  "slides": [
    {
      "id": "slide-1",
      "layout": "image-full",
      "backgroundImage": "assets/cover-beach.jpg",
      "backgroundPosition": "center",
      "elements": [
        { "id": "ov01", "type": "overlay", "fill": "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)" },
        { "id": "hd01", "type": "heading", "level": 1, "content": "Destinos Incríveis Para 2026", "textAlign": "center", "marginTop": 40 }
      ]
    },
    {
      "id": "slide-2",
      "layout": "image-top",
      "elements": [
        { "id": "im02", "type": "image", "src": "assets/santorini.jpg", "variant": "area", "borderRadius": 16, "imageHeight": 550 },
        { "id": "hd02", "type": "heading", "level": 2, "content": "Santorini, Grécia", "textAlign": "center" },
        { "id": "pr02", "type": "paragraph", "content": "Pôr do sol mágico, vilas brancas e o mar Egeu. Um destino dos sonhos.", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-3",
      "layout": "image-top",
      "elements": [
        { "id": "im03", "type": "image", "src": "assets/kyoto.jpg", "variant": "area", "borderRadius": 16, "imageHeight": 550 },
        { "id": "hd03", "type": "heading", "level": 2, "content": "Kyoto, Japão", "textAlign": "center" },
        { "id": "pr03", "type": "paragraph", "content": "Templos milenares, jardins zen e a beleza da cultura japonesa.", "textAlign": "center" }
      ]
    },
    {
      "id": "slide-4",
      "layout": "cta",
      "elements": [
        { "id": "em04", "type": "emoji", "content": "✈️", "size": 96 },
        { "id": "hd04", "type": "heading", "level": 1, "content": "Qual é o Seu Próximo Destino?", "textAlign": "center" },
        { "id": "pr04", "type": "paragraph", "content": "Comente aqui embaixo e salve para planejar sua viagem!", "textAlign": "center" }
      ]
    }
  ]
}
```

**ZIP structure for this example:**
```
carousel.zip
├── schema.json
└── assets/
    ├── cover-beach.jpg
    ├── santorini.jpg
    └── kyoto.jpg
```

---

## Example 3: Quote + List Carousel (Light Theme)

Topic: "Liderança" — motivational/educational

```json
{
  "version": 1,
  "generator": "ai-carousel-generator",
  "generatorVersion": "1.0.0",
  "createdAt": "2026-02-26T12:00:00.000Z",
  "updatedAt": "2026-02-26T12:00:00.000Z",
  "id": "leadership-001",
  "title": "Lições de Liderança",
  "format": "carousel",
  "canvas": { "width": 1080, "height": 1440 },
  "header": { "handle": "@lideranca", "showCounter": true },
  "footer": { "text": "LIDERANÇA PRÁTICA", "style": "uppercase" },
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
      "heading": { "family": "Playfair Display", "weight": 700 },
      "paragraph": { "family": "Inter", "weight": 400 },
      "subtitle": { "family": "Inter", "weight": 500 },
      "tag": { "family": "Montserrat", "weight": 700 },
      "quote": { "family": "Playfair Display", "weight": 500 }
    },
    "fontScale": 1,
    "elementGap": 28
  },
  "slides": [
    {
      "id": "s1",
      "layout": "cover",
      "elements": [
        { "id": "e1a", "type": "emoji", "content": "🏆", "size": 80 },
        { "id": "e1b", "type": "heading", "level": 1, "content": "Lições de Liderança", "textAlign": "center" },
        { "id": "e1c", "type": "subtitle", "content": "O que todo líder precisa saber", "textAlign": "center" }
      ]
    },
    {
      "id": "s2",
      "layout": "quote",
      "elements": [
        { "id": "e2a", "type": "quote", "content": "Antes de ser um líder, sucesso é sobre crescer a si mesmo. Quando você se torna um líder, sucesso é sobre crescer os outros.", "attribution": "Jack Welch", "textAlign": "center" }
      ]
    },
    {
      "id": "s3",
      "layout": "list",
      "elements": [
        { "id": "e3a", "type": "heading", "level": 2, "content": "5 Hábitos de Grandes Líderes", "textAlign": "center" },
        { "id": "e3b", "type": "list-item", "icon": "👂", "content": "Escutam mais do que falam", "textAlign": "left" },
        { "id": "e3c", "type": "list-item", "icon": "🎯", "content": "Definem metas claras e mensuráveis", "textAlign": "left" },
        { "id": "e3d", "type": "list-item", "icon": "🤝", "content": "Dão crédito à equipe pelas conquistas", "textAlign": "left" },
        { "id": "e3e", "type": "list-item", "icon": "📚", "content": "Nunca param de aprender", "textAlign": "left" },
        { "id": "e3f", "type": "list-item", "icon": "💪", "content": "Assumem responsabilidade nos erros", "textAlign": "left" }
      ]
    },
    {
      "id": "s4",
      "layout": "highlight",
      "elements": [
        { "id": "e4a", "type": "tag", "content": "INSIGHT" },
        { "id": "e4b", "type": "heading", "level": 2, "content": "O Poder do Exemplo", "textAlign": "center" },
        { "id": "e4c", "type": "highlight", "content": "Líderes que praticam o que pregam têm equipes 4x mais engajadas. A ação sempre fala mais alto que palavras.", "textAlign": "center" }
      ]
    },
    {
      "id": "s5",
      "layout": "cta",
      "elements": [
        { "id": "e5a", "type": "heading", "level": 1, "content": "Compartilhe Com Seu Time", "textAlign": "center" },
        { "id": "e5b", "type": "paragraph", "content": "Marque alguém que é um grande líder nos comentários!", "textAlign": "center" },
        { "id": "e5c", "type": "emoji", "content": "⬇️", "size": 64 }
      ]
    }
  ]
}
```

---

## Example 4: Editorial Freeform Carousel (PADRÃO PREMIUM)

**Este é o padrão de maior qualidade.** Todos os slides usam `freeform` + `backgroundImage` + overlay + texto posicionado. Resultado: visual cinematográfico editorial.

Topic: "Produtividade para Desenvolvedores"

```json
{
  "version": 1,
  "generator": "ai-carousel-generator",
  "generatorVersion": "1.0.0",
  "createdAt": "2026-02-26T12:00:00.000Z",
  "updatedAt": "2026-02-26T12:00:00.000Z",
  "id": "dev-produtividade-001",
  "title": "O Segredo dos Devs que Entregam 3x Mais",
  "format": "carousel",
  "canvas": { "width": 1080, "height": 1440 },
  "header": { "handle": "@devpro", "showCounter": true },
  "footer": { "text": "DEV PRO", "style": "uppercase" },
  "theme": {
    "name": "Dark Tech",
    "colors": {
      "background": "#0a0e1a",
      "backgroundSubtle": "#111827",
      "text": "#f8fafc",
      "textSecondary": "#cbd5e1",
      "textMuted": "#64748b",
      "highlight": "#3b82f6",
      "accent": "#2563eb",
      "divider": "#1e293b",
      "cardBackground": "#0f172a",
      "highlightSoft": "rgba(59,130,246,0.10)",
      "highlightBorder": "rgba(59,130,246,0.25)",
      "iconColor": "#3b82f6",
      "iconColorAlt": "#2563eb"
    },
    "typography": {
      "heading": { "family": "Space Grotesk", "weight": 700 },
      "paragraph": { "family": "Inter", "weight": 400 },
      "subtitle": { "family": "Inter", "weight": 500 },
      "tag": { "family": "Space Grotesk", "weight": 700 },
      "quote": { "family": "Space Grotesk", "weight": 500 }
    },
    "fontScale": 1,
    "elementGap": 24
  },
  "slides": [
    {
      "id": "s01",
      "layout": "freeform",
      "backgroundImage": "assets/hero-editorial.jpg",
      "elements": [
        {
          "id": "s01-ov", "type": "overlay",
          "fill": "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.3) 100%)",
          "x": 0, "y": 0, "w": 1080, "h": 1440, "zIndex": 1
        },
        {
          "id": "s01-h1", "type": "heading", "level": 1,
          "content": "O Segredo dos Devs que Entregam <span class=\"hl\">3x Mais</span>.",
          "x": 80, "y": 1040, "w": 920, "fontSize": 52, "zIndex": 2
        },
        {
          "id": "s01-sub", "type": "paragraph",
          "content": "Não é talento. É sistema.",
          "x": 80, "y": 1240, "w": 920, "fontSize": 28, "zIndex": 2
        }
      ]
    },
    {
      "id": "s02",
      "layout": "freeform",
      "backgroundImage": "assets/scene-02.jpg",
      "elements": [
        {
          "id": "s02-ov", "type": "overlay",
          "fill": "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.85) 100%)",
          "x": 0, "y": 0, "w": 1080, "h": 1440, "zIndex": 1
        },
        {
          "id": "s02-tag", "type": "tag",
          "content": "O PROBLEMA",
          "x": 80, "y": 100, "w": 300, "zIndex": 2
        },
        {
          "id": "s02-h1", "type": "heading", "level": 1,
          "content": "Você trabalha 10h e entrega menos que queria.",
          "x": 80, "y": 170, "w": 920, "fontSize": 44, "zIndex": 2
        },
        {
          "id": "s02-p1", "type": "paragraph",
          "content": "Reunião, Slack, code review, refactor, bug urgente. No fim do dia, a feature que importava não saiu. E amanhã repete.",
          "x": 80, "y": 1120, "w": 920, "fontSize": 24, "zIndex": 2
        }
      ]
    },
    {
      "id": "s03",
      "layout": "freeform",
      "backgroundImage": "assets/scene-03.jpg",
      "elements": [
        {
          "id": "s03-ov", "type": "overlay",
          "fill": "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.85) 100%)",
          "x": 0, "y": 0, "w": 1080, "h": 1440, "zIndex": 1
        },
        {
          "id": "s03-tag", "type": "tag",
          "content": "O INSIGHT",
          "x": 80, "y": 100, "w": 250, "zIndex": 2
        },
        {
          "id": "s03-h1", "type": "heading", "level": 1,
          "content": "Produtividade não é velocidade. É foco.",
          "x": 80, "y": 170, "w": 920, "fontSize": 44, "zIndex": 2
        },
        {
          "id": "s03-p1", "type": "paragraph",
          "content": "Os devs mais produtivos não digitam mais rápido. Eles eliminam decisões desnecessárias, automatizam o repetitivo e protegem blocos de 2h para código que importa.",
          "x": 80, "y": 1080, "w": 920, "fontSize": 23, "zIndex": 2
        }
      ]
    },
    {
      "id": "s04",
      "layout": "freeform",
      "backgroundImage": "assets/scene-04.jpg",
      "elements": [
        {
          "id": "s04-ov", "type": "overlay",
          "fill": "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.9) 100%)",
          "x": 0, "y": 0, "w": 1080, "h": 1440, "zIndex": 1
        },
        {
          "id": "s04-tag", "type": "tag",
          "content": "MÉTODO",
          "x": 80, "y": 100, "w": 200, "zIndex": 2
        },
        {
          "id": "s04-h1", "type": "heading", "level": 1,
          "content": "3 blocos por dia. Sem exceção.",
          "x": 80, "y": 170, "w": 920, "fontSize": 44, "zIndex": 2
        },
        {
          "id": "s04-p1", "type": "paragraph",
          "content": "Manhã: deep work (feature principal). Tarde: code review + comunicação. Final: automação e cleanup. O segredo não é fazer mais coisas, é fazer as certas na hora certa.",
          "x": 80, "y": 1060, "w": 920, "fontSize": 23, "zIndex": 2
        }
      ]
    },
    {
      "id": "s05",
      "layout": "freeform",
      "backgroundImage": "assets/scene-05.jpg",
      "elements": [
        {
          "id": "s05-ov", "type": "overlay",
          "fill": "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.9) 100%)",
          "x": 0, "y": 0, "w": 1080, "h": 1440, "zIndex": 1
        },
        {
          "id": "s05-h1", "type": "heading", "level": 1,
          "content": "O resultado fala por si.",
          "x": 80, "y": 120, "w": 920, "fontSize": 44, "zIndex": 2
        },
        {
          "id": "s05-p1", "type": "paragraph",
          "content": "Menos horas, mais entregas. Menos contexto perdido, mais código que funciona de primeira. O sistema se paga na primeira semana.",
          "x": 80, "y": 1140, "w": 920, "fontSize": 24, "zIndex": 2
        }
      ]
    },
    {
      "id": "s06",
      "layout": "freeform",
      "backgroundImage": "assets/scene-06.jpg",
      "elements": [
        {
          "id": "s06-ov", "type": "overlay",
          "fill": "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.3) 100%)",
          "x": 0, "y": 0, "w": 1080, "h": 1440, "zIndex": 1
        },
        {
          "id": "s06-h1", "type": "heading", "level": 1,
          "content": "Salva e testa amanhã de manhã.",
          "x": 80, "y": 1040, "w": 920, "fontSize": 44, "zIndex": 2
        },
        {
          "id": "s06-p1", "type": "paragraph",
          "content": "Começa com um bloco de 2h sem interrupção. Só isso.",
          "x": 80, "y": 1220, "w": 920, "fontSize": 26, "zIndex": 2
        },
        {
          "id": "s06-handle", "type": "paragraph",
          "content": "@devpro",
          "x": 430, "y": 1350, "w": 300, "fontSize": 24, "zIndex": 2
        }
      ]
    }
  ]
}
```

**Padrão deste exemplo:**
- **TODOS** os slides usam `layout: "freeform"` + `backgroundImage`
- **Overlay** em todos os slides: `x:0, y:0, w:1080, h:1440, zIndex:1`
- **Textos** sempre `zIndex: 2`, padding `x:80, w:920`
- **Capa** (slide 1): texto na base, overlay fade-to-top
- **Corpo** (slides 2-5): tag no topo + heading abaixo + parágrafo na base
- **CTA** (slide 6): texto na base, overlay fade-to-top, handle centralizado

**ZIP structure:**
```
carousel.zip
├── schema.json
└── assets/
    ├── hero-editorial.jpg
    ├── scene-02.jpg
    ├── scene-03.jpg
    ├── scene-04.jpg
    ├── scene-05.jpg
    └── scene-06.jpg
```
