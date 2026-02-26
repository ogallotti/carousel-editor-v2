# Playbook de Geração de Imagens

## Princípios Fundamentais

1. **Travar direção visual antes da primeira imagem** — uma vez definida, não mudar no meio.
2. **Tratar o carrossel como ensaio fotográfico único** — todas as imagens do mesmo "set".
3. **Nunca misturar estilos** — editorial + ilustração, 3D + foto, cartoon + realismo = proibido.
4. **Título tipográfico sempre separado** — texto isolado em fundo transparente, nunca dentro da cena.
5. **Imagens limpas para texto** — as cenas devem ter espaço para receber copy por cima.

## Ordem de Geração

Seguir esta sequência para manter consistência:

### 1. Título Tipográfico (PNG Transparente)

Gerar primeiro para definir o tom visual.

```
Render only the phrase "[TÍTULO]" as premium custom typography.
Transparent background. No scene, no objects, no particles, no decorations.
Style: [bold/elegant/handwritten/minimal] matching [TONE].
High contrast, sharp edges, production-ready PNG with alpha channel.
```

**Onde usar**: Slide 1 (cover) como imagem de background ou elemento.

### 2. Hero Editorial (Cena Principal)

A imagem de maior impacto — usada na capa ou num slide chave.

```
Editorial cinematic photograph for Instagram carousel.
Theme: [TEMA]. Target audience: [PÚBLICO].
Central message: [BIG IDEA].
[DIREÇÃO VISUAL COMPLETA - paleta, luz, lente, textura, atmosfera].
Clean composition with negative space for text overlay.
No text, no logos, no watermarks, no UI elements.
Photorealistic, editorial quality, magazine-grade.
```

### 3. Cenas Narrativas (Sequência)

Gerar em sequência para manter progressão visual.

**Estratégia de consistência**: Usar o hero editorial como imagem de referência via `image-to-image` (`gpt-image/1.5-image-to-image` com `input_urls` apontando para a URL do hero). Isso garante que paleta, iluminação e textura se mantenham iguais em todas as cenas. O script `generate_images.py` faz isso automaticamente.

```
Scene [N] of [TOTAL] for Instagram carousel about "[TEMA]".
Narrative beat: [OBJETIVO DESTE FRAME - ex: "mostrar a dor/frustração"].
Visual continuity with previous scene: [DESCREVER CONEXÃO].
[DIREÇÃO VISUAL COMPLETA - mesma de todas as outras].
Angle/composition: [ESPECÍFICO - close-up, wide, overhead, etc].
Clean for text overlay. No text, no logos, no watermarks.
```

## Template Genérico de Prompt

```
[TIPO DE CENA] para carrossel sobre [TEMA], para [PÚBLICO].
Objetivo narrativo deste frame: [OBJETIVO].
Direção visual fixa: [DIREÇÃO VISUAL COMPLETA].
Composição: [ENQUADRAMENTO/LENTE].
Restrições: fotografia realista editorial, sem cartoon, sem texto embutido, sem watermark.
```

## Checklist por Imagem

Antes de aceitar cada imagem gerada, verificar:

- [ ] **Paleta** — Usa as cores definidas na direção visual?
- [ ] **Iluminação** — Mesma qualidade de luz das outras imagens?
- [ ] **Textura** — Mesmo grão/estilo das outras?
- [ ] **Narrativa** — Avança a história do slide anterior?
- [ ] **Coesão** — Parece parte do mesmo ensaio fotográfico?
- [ ] **Espaço para texto** — Tem área limpa para receber copy?
- [ ] **Sem texto** — Nenhum texto/logo/watermark na imagem?

## Nomeação de Arquivos

```
assets/
├── title-typography.png          # Título isolado (fundo transparente)
├── hero-editorial.jpg            # Cena editorial principal
├── scene-03-problema.jpg         # Cena do slide 3 (descrever função)
├── scene-04-metodo.jpg           # Cena do slide 4
├── scene-05-exemplo.jpg          # Cena do slide 5
├── scene-06-prova.jpg            # Cena do slide 6
└── bg-cta.jpg                    # Background do slide CTA (se houver)
```

**Extensões**: `.jpg` para fotos, `.png` para tipografia/transparência, `.webp` como alternativa.

## Referência no Schema

No `schema.json`, referenciar imagens assim:

**Como elemento image (dentro do slide):**
```json
{
  "id": "img-slide3",
  "type": "image",
  "src": "assets/scene-03-problema.jpg",
  "variant": "area",
  "borderRadius": 16,
  "imageHeight": 550
}
```

**Como background do slide:**
```json
{
  "id": "slide-1",
  "layout": "image-full",
  "backgroundImage": "assets/hero-editorial.jpg",
  "backgroundPosition": "center",
  "elements": [
    { "id": "ov1", "type": "overlay", "fill": "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)" },
    { "id": "h1", "type": "heading", "level": 1, "content": "Título Aqui" }
  ]
}
```

## Overlays Recomendados

**REGRA: SEMPRE usar overlay quando o slide tiver `backgroundImage`.** Escolher o preset com base na posição do texto.

| Preset | CSS `fill` | Quando Usar |
|--------|-----------|------------|
| Escuro | `rgba(0,0,0,0.6)` | Overlay uniforme, texto em qualquer posição |
| Muito escuro | `rgba(0,0,0,0.85)` | Imagem serve só de textura, texto domina |
| ↓ Fraco | `linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 33%)` | Texto no topo, imagem limpa embaixo |
| ↓ Forte | `linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 50%)` | Texto no topo com mais conteúdo |
| ↑ Fraco | `linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 33%)` | Texto na base (capa, CTA), imagem limpa em cima |
| ↑ Forte | `linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 50%)` | Texto na base com mais conteúdo |
| ↕ Fraco | `linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 33%, transparent 67%, rgba(0,0,0,1) 100%)` | Tag no topo + texto na base, imagem visível no meio |
| ↕ Forte | `linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 50%, transparent 50%, rgba(0,0,0,1) 100%)` | Tag no topo + texto na base com mais conteúdo |
| Radial | `radial-gradient(circle, rgba(0,0,0,0.7) 0%, transparent 70%)` | Texto centralizado, destaque no centro |
| Vinheta | `radial-gradient(circle, transparent 30%, rgba(0,0,0,0.7) 100%)` | Foco na imagem central, escurece bordas |

## Falhas Comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| Imagens parecem de carrosséis diferentes | Direção visual não travada | Copiar exatamente o mesmo bloco de visual_direction em todos os prompts |
| Texto ilegível sobre imagem | Sem overlay | Adicionar overlay gradient |
| Título dentro da cena | Prompt pediu texto na imagem | Separar: gerar tipografia isolada + cena separada |
| Resultado cartoon/3D | Prompt ambíguo | Sempre incluir "photorealistic, editorial quality" |
| Cena sem conexão narrativa | Prompt genérico | Incluir "Scene N of TOTAL" e descrever conexão com anterior |

## Quantidade de Imagens por Carrossel

Para um carrossel de 10 slides:
- **Mínimo**: 4 imagens (hero + 3 cenas) → ~40% com imagem
- **Ideal**: 6-7 imagens (hero + 5-6 cenas) → ~60-70% com imagem
- **Máximo**: Não precisa de imagem em todo slide — slides de lista, quote e highlight funcionam bem sem
