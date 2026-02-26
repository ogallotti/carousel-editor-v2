---
name: carousel-zip-generator
description: "Pipeline completo para criar carrosséis de alto impacto para Instagram: estratégia, copy, direção visual, geração de imagens via API e montagem de ZIP (schema.json + assets) validado para o Carousel Editor V2. Use sempre que o usuário pedir para criar, gerar ou montar um carrossel, slides para Instagram, conteúdo visual para redes sociais, ou quiser produzir um .zip com schema.json + assets. Também ativar quando mencionar carousel schema, slide generation, AI carousel, geração de carrossel, criação de posts visuais, ou qualquer tipo de conteúdo em formato carrossel."
---

# Carousel Generator — Pipeline Completo

Ideia → Estratégia → Direção Visual → Imagens → Schema JSON → ZIP importável.

## Visão Geral

Este skill executa o pipeline completo para criar carrosséis profissionais para Instagram. O output final é um arquivo `.zip` contendo `schema.json` + `assets/` importável pelo Carousel Editor V2.

**O pipeline tem 5 fases:**

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐
│ 1. ESTRATÉGIA│ →  │ 2. APROVAÇÃO │ →  │ 3. CRIATIVO  │ →  │ 4. IMAGENS   │ →  │ 5. MONTAGEM │
│ Brief + Copy │    │ Copy c/ user │    │ Visual Dir.  │    │ API Generate │    │ JSON + ZIP  │
└─────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └─────────────┘
```

**IMPORTANTE**: Nunca avançar para imagens ou montagem sem o usuário aprovar a copy.

## Fase 1: Estratégia

Antes de qualquer slide, definir a fundação. Perguntar ou inferir do contexto:

### 1.1 Definir o Brief Criativo

```json
{
  "topic": "assunto central do post",
  "audience": "para quem é (específico)",
  "big_idea": "tese principal em uma frase (afirmação, não pergunta)",
  "tone": "tom de voz (direto, provocativo, didático, inspiracional...)",
  "title": "frase curta para o título/capa",
  "tagline": "subfrase opcional",
  "visual_hook": "imagem mental que para o scroll (familiar + surpresa)",
  "visual_direction": "paleta + iluminação + textura + estilo de lente + atmosfera",
  "scene_focus": "mapa narrativo visual (ex: dor -> tensão -> método -> prova)",
  "cta": "ação final desejada (UMA só: salvar, comentar ou compartilhar)",
  "handle": "@usuario",
  "brand": "NOME DA MARCA"
}
```

**Campos obrigatórios**: `topic`, `audience`, `big_idea`, `tone`, `visual_direction`

Para spec completo e exemplos, ler `references/creative-brief-spec.md`.
Para regras de escrita e anti-padrões de IA na copy, ler `references/copy-direction.md`.

### 1.2 Definir a Estrutura Narrativa

Planejar a sequência de slides seguindo uma progressão clara:

| # | Função | Layout |
|---|--------|--------|
| 1 | **Hook** — título que para o scroll | `freeform` + backgroundImage + overlay + texto na base |
| 2 | **Problema** — dor que o público sente | `freeform` + backgroundImage + overlay + tag topo + texto base |
| 3-7 | **Desenvolvimento** — método, exemplos, provas | `freeform` + backgroundImage (slides com imagem) OU `list`/`quote`/`highlight` (slides texto puro) |
| 8-9 | **Virada** — insight ou resultado | `freeform` + backgroundImage OU `quote` |
| 10 | **CTA** — uma ação clara | `freeform` + backgroundImage + overlay + texto na base |

**REGRA**: Se o slide tem imagem, usar `freeform` + `backgroundImage`. Nunca `image-top`/`image-bottom` para visual editorial.

**Regras editoriais (não negociar):**
- 8 a 12 slides (sweet spot para Instagram)
- Uma ideia central por slide
- **Carrosséis com imagens**: mínimo ~80% de slides freeform (com backgroundImage + overlay + texto posicionado). Máximo ~20% texto puro (list, quote, highlight)
- **Carrosséis 100% texto**: se o usuário optar por não usar imagens, todos os slides podem ser text-only (title-body, list, quote, highlight, etc.) com fundo sólido ou gradiente. A regra dos 80% freeform não se aplica nesse caso.
- CTA final único (salvar **ou** comentar **ou** compartilhar — nunca 3 de uma vez)
- Progressão lógica: dor → tensão → método → prova → CTA
- Linguagem concreta, sem abstração vazia

### 1.3 Gerar o Prompt Pack (opcional)

Se o brief já existe como JSON:

```bash
python3 .claude/skills/carousel-zip-generator/scripts/build_prompt_pack.py \
  --brief brief.json --output prompt-pack.json --slides 10
```

Gera prompts estruturados para título tipográfico + cena editorial + cenas narrativas.

### 1.4 Imagens Fornecidas pelo Usuário

O usuário pode fornecer imagens próprias (logo, mascote, fotos, assets da marca). Identificar o uso pretendido e tratar de acordo:

**Caso A: Imagem como referência visual para geração (i2i)**

O usuário quer que o estilo/elemento da imagem influencie as imagens geradas.

Exemplo: *"Quero que os slides usem o mascote da minha empresa mascote.png"*

Fluxo:
1. Copiar o arquivo para `carousel-build/assets/` (será incluído no ZIP)
2. Na geração de imagens (Fase 4), usar a imagem como `input_urls` no modo i2i para gerar o hero editorial, incorporando o elemento visual do usuário
3. Depois usar o hero como referência para as cenas narrativas (mantendo consistência + elemento do usuário)

```bash
# Hero usando mascote como referência i2i
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt "Editorial cinematic photo featuring [DESCRIÇÃO DO MASCOTE]..." \
  --model gpt-image/1.5-image-to-image \
  --input-urls "carousel-build/assets/mascote.png" \
  --output-dir carousel-build/assets/ \
  --filename hero-editorial.jpg \
  --quality high
```

**Caso B: Imagem como asset direto no slide**

O usuário quer que a imagem apareça como está, sem transformação.

Exemplo: *"Quero a logo da empresa no último slide logo.png"*

Fluxo:
1. Copiar o arquivo para `carousel-build/assets/` (ex: `assets/logo.png`)
2. No schema.json, referenciar como elemento `image` no slide desejado:

```json
{
  "id": "logo-cta",
  "type": "image",
  "src": "assets/logo.png",
  "variant": "inline",
  "x": 390, "y": 400, "w": 300,
  "zIndex": 3
}
```

**Caso C: Ambos**

O usuário pode querer referência visual E assets diretos. Tratar cada imagem individualmente conforme o contexto.

**Regra**: Sempre perguntar ao usuário como ele quer usar a imagem se não estiver claro. Não assumir.

## Fase 2: Aprovação da Copy

**PARAR AQUI e apresentar a copy ao usuário antes de avançar.**

Depois de definir o brief e a estrutura narrativa, apresentar ao usuário:

1. **Título do carrossel**
2. **Sequência completa de slides** — para cada slide mostrar:
   - Número e função (Hook, Problema, Método, etc.)
   - Tag (se houver)
   - Heading (título do slide)
   - Texto do corpo (parágrafo)
3. **CTA final**
4. **Verificação anti-IA** (conferir contra `references/copy-direction.md`):
   - Sem anáforas, sem fórmula "X vs Y", sem revelações épicas pré-fabricadas
   - Sem palavras proibidas (gamechanger, invisível, propósito, etc.)
   - Frases com cadência humana (longa + curta), sem falso Hemingway
   - Zero emojis no texto, zero travessões reflexivos
   - Listas com substância narrativa, não jargão solto

Formato sugerido para apresentação:

```
📋 COPY DO CARROSSEL: "Título"

Slide 1 (HOOK): "Frase de impacto"
→ "Subtítulo ou complemento"

Slide 2 (PROBLEMA): TAG: CONTEXTO
→ "Heading do slide"
→ "Texto do corpo explicando a dor..."

Slide 3 (MÉTODO): TAG: COMO FUNCIONA
→ "Heading do slide"
→ "Texto do corpo com o método..."

[...]

Slide 10 (CTA):
→ "Frase de fechamento"
→ "Call-to-action"
```

**Aguardar aprovação explícita do usuário.** Ajustar o que for pedido. Só avançar para Fase 3 (Direção Visual) após "ok", "aprovado", "pode seguir" ou equivalente.

---

## Fase 3: Criativo (Direção Visual)

**Travar antes de gerar qualquer imagem.** Tratar o carrossel como ensaio fotográfico único.

### 3.1 Definir Paleta + Tema

Escolher um tema para o schema. Opções:

- **Dark** (default) — navy #0a0e1a, texto branco, acento dourado #fbbf24
- **Light** — branco #ffffff, texto escuro, acento âmbar #f59e0b
- **Custom** — definir todas as 13 cores (ver `references/themes-and-examples.md`)

**Sugestões de paleta por tom:**

| Tom | Paleta | Acento |
|-----|--------|--------|
| Autoridade / Executivo | Dark navy + dourado | `#fbbf24` |
| Tech / Moderno | Dark + azul elétrico | `#3b82f6` |
| Energia / Urgência | Dark + rosa/vermelho | `#f43f5e` |
| Criativo / Premium | Dark + roxo | `#a855f7` |
| Clean / Minimalista | Light + âmbar | `#f59e0b` |
| Natural / Wellness | Light + verde | `#22c55e` |

### 3.2 Definir Tipografia

Escolher fontes entre as 12 disponíveis:

| Font | Vibe |
|------|------|
| **Archivo** | Default, versátil, geométrica |
| **Montserrat** | Elegante, profissional |
| **Playfair Display** | Luxo, editorial |
| **Space Grotesk** | Tech, moderno |
| **DM Sans** | Casual, amigável |
| **Poppins** | Arredondada, moderna |
| **Inter** | Clean, legível |
| **Merriweather** | Clássico, serifada |

Pairings recomendados: heading serifada + body sans-serif (ex: Playfair Display 700 + Inter 400).

### 3.3 Definir Direção Visual Unificada

Descrever de forma concreta (não usar "bonito", "premium" sem detalhes):
- **Paleta**: cores dominantes + acento
- **Iluminação**: lateral dura, suave difusa, dourada, fria...
- **Textura**: grão de filme, clean digital, analógico...
- **Lente**: 35mm wide, 50mm natural, 85mm portrait, macro...
- **Atmosfera**: noturno, amanhecer, studio, urbano...

## Fase 4: Geração de Imagens

Para detalhes completos de prompts e checklist, ler `references/image-generation-playbook.md`.
Para documentação da API de geração, ler `references/kie-api.md`.

### 4.1 Serviço Recomendado: KIE (kie.ai)

| Modelo | ID na API | Uso |
|--------|-----------|-----|
| **GPT Image 1.5** (preferencial) | `gpt-image/1.5-text-to-image` | Cenas editoriais, hero, tipografia |
| **GPT Image 1.5 i2i** | `gpt-image/1.5-image-to-image` | Variações consistentes a partir de referência |
| **Gemini 3 Pro** (preferencial 2) | `nano-banana-pro` | Suporta 4:5 nativo, resolução até 4K |

**Pré-requisito**: Definir `export KIE_API_KEY="sua-chave"` (obter em [kie.ai/api-key](https://kie.ai/api-key)).

### 4.2 Ordem de Geração (Hero-First Consistency)

1. **Título tipográfico** — text-to-image (PNG transparente, sem referência)
2. **Hero editorial** — text-to-image quality `high` (**ÂNCORA VISUAL** — define paleta, luz e textura)
3. **Cenas narrativas** — **image-to-image usando o hero como referência** para garantir consistência visual

O script `generate_images.py` faz isso automaticamente no modo `--prompt-pack`. O hero é gerado primeiro, sua URL é capturada e passada como `input_urls` para todas as cenas seguintes via `gpt-image/1.5-image-to-image`.

### 4.3 Padrões de Prompt

**Título (tipografia isolada):**
```
Render only the phrase "[TÍTULO]" as premium custom typography.
Transparent background. No scene. No objects. No particles.
High contrast, sharp edges, production-ready PNG.
```

**Cena editorial:**
```
Editorial cinematic photo for Instagram carousel.
Theme: [TEMA]. Audience: [PÚBLICO].
Narrative intent: [INTENÇÃO DESTE FRAME].
Visual direction locked: [DIREÇÃO VISUAL COMPLETA].
No text overlays, no logos, no watermark.
```

### 4.4 Checklist por Imagem

- Mantém paleta e iluminação do conjunto?
- Continua a narrativa do slide anterior?
- Parece parte do mesmo ensaio fotográfico?
- Está limpa para receber texto por cima?

### 4.5 Gerar via Script

**Prompt pack com consistência automática (recomendado):**
```bash
# Hero é gerado primeiro via t2i, depois cenas usam hero como referência via i2i
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt-pack prompt-pack.json \
  --output-dir carousel-build/assets/ \
  --quality high
```

**Sem referência (text-to-image puro):**
```bash
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt-pack prompt-pack.json \
  --output-dir carousel-build/assets/ \
  --no-ref
```

**Imagem avulsa:**
```bash
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt "Editorial cinematic photo..." \
  --output-dir carousel-build/assets/ \
  --filename hero-editorial.jpg \
  --quality high
```

**Com Gemini 3 Pro (4:5 nativo):**
```bash
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt "..." \
  --model nano-banana-pro \
  --aspect-ratio 4:5 \
  --resolution 2K \
  --output-dir carousel-build/assets/ \
  --filename scene-03.jpg
```

**Image-to-image manual:**
```bash
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt "Same scene, different angle..." \
  --model gpt-image/1.5-image-to-image \
  --input-urls "https://url-da-hero.jpg" \
  --output-dir carousel-build/assets/ \
  --filename scene-04.jpg
```

### 4.6 Estrutura de Assets

```
assets/
├── cover-title.png         # Título tipográfico
├── hero-editorial.jpg      # Cena principal
├── scene-03.jpg            # Cena slide 3
├── scene-04.jpg            # Cena slide 4
└── ...
```

**Formatos aceitos**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.svg`

## Fase 5: Montagem (Schema JSON + ZIP)

### 5.1 Gerar Scaffold

Para gerar rapidamente um esqueleto do carrossel:

```bash
python3 .claude/skills/carousel-zip-generator/scripts/scaffold_carousel.py \
  --title "Título do Carrossel" \
  --handle "@seuhandle" \
  --brand "SUA MARCA" \
  --slides 10 \
  --output carousel-build/schema.json
```

Depois preencher o copy e os caminhos das imagens manualmente.

### 5.2 Ou Construir o JSON Diretamente

Construir o `schema.json` seguindo a CarouselSchema v1. Estrutura mínima:

```json
{
  "version": 1,
  "generator": "ai-carousel-generator",
  "generatorVersion": "1.0.0",
  "createdAt": "2026-02-26T12:00:00.000Z",
  "updatedAt": "2026-02-26T12:00:00.000Z",
  "id": "carousel-id",
  "title": "Título",
  "format": "carousel",
  "canvas": { "width": 1080, "height": 1440 },
  "header": { "handle": "@usuario", "showCounter": true },
  "footer": { "text": "MARCA", "style": "uppercase" },
  "theme": { "→ ver references/themes-and-examples.md" },
  "slides": [ "→ ver 4.3" ]
}
```

Para spec completo com todos os campos, ler `references/schema-spec.md`.

### 5.3 Montar os Slides

Cada slide:

```json
{
  "id": "slide-unique-id",
  "layout": "title-body",
  "elements": [ ... ],
  "background": null,
  "backgroundImage": null
}
```

**11 layouts disponíveis:**

| Layout | Melhor Para |
|--------|------------|
| **`freeform`** | **PADRÃO EDITORIAL** — imagem de fundo + overlay + texto posicionado. Usar em TODOS os slides com imagem. |
| `cover` | Capa simples sem imagem (texto centralizado) |
| `title-body` | Conteúdo texto puro (tag + título + texto) |
| `full-text` | Texto longo sem imagem |
| `image-top` | Imagem como elemento acima do texto (sem fundo) |
| `image-bottom` | Texto acima, imagem como elemento abaixo |
| `image-full` | Similar a freeform mas sem posicionamento livre |
| `quote` | Citação / depoimento (texto puro) |
| `list` | Lista com ícones (texto puro) |
| `highlight` | Caixa de destaque (texto puro) |
| `cta` | Call-to-action final |

### Padrão Editorial Freeform (USAR SEMPRE QUE TIVER IMAGEM)

Para carrosséis com imagens, **TODOS os slides com foto devem usar `freeform`** com este padrão:

```json
{
  "id": "slide-id",
  "layout": "freeform",
  "backgroundImage": "assets/scene-03.jpg",
  "elements": [
    {
      "id": "overlay-id",
      "type": "overlay",
      "fill": "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.85) 100%)",
      "x": 0, "y": 0, "w": 1080, "h": 1440, "zIndex": 1
    },
    {
      "id": "tag-id",
      "type": "tag",
      "content": "TÓPICO",
      "x": 80, "y": 100, "w": 300, "zIndex": 2
    },
    {
      "id": "heading-id",
      "type": "heading",
      "level": 1,
      "content": "Frase de impacto do slide.",
      "x": 80, "y": 170, "w": 920, "fontSize": 44, "zIndex": 2
    },
    {
      "id": "paragraph-id",
      "type": "paragraph",
      "content": "Texto detalhado posicionado na parte inferior do slide.",
      "x": 80, "y": 1100, "w": 920, "fontSize": 24, "zIndex": 2
    }
  ]
}
```

**Regras de posicionamento (canvas 1080x1440):**
- **Padding lateral**: `x: 80`, `w: 920` (80px de cada lado)
- **Tag no topo**: `y: 80–120`
- **Heading abaixo da tag**: `y: 150–200`
- **Texto longo na base**: `y: 1000–1200` (ajustar conforme tamanho do texto)
- **Overlay sempre**: `x:0, y:0, w:1080, h:1440, zIndex:1`
- **Texto sempre**: `zIndex: 2` (acima do overlay)
- **Slide de capa (primeiro)**: texto na base (`y: 1040+`), overlay fade-to-top
- **Slide de CTA (último)**: texto na base, overlay fade-to-top

**REGRA: SEMPRE usar overlay quando o slide tiver `backgroundImage`.** Escolher o preset com base na posição do texto.

**Overlays disponíveis (10 presets):**

| Preset | CSS `fill` | Quando usar |
|--------|-----------|------------|
| Escuro | `rgba(0,0,0,0.6)` | Overlay uniforme, texto em qualquer posição |
| Muito escuro | `rgba(0,0,0,0.85)` | Imagem serve só de textura, texto precisa dominar |
| ↓ Fraco | `linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 33%)` | Texto no topo, imagem limpa embaixo |
| ↓ Forte | `linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 50%)` | Texto no topo com mais conteúdo |
| ↑ Fraco | `linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 33%)` | Texto na base (capa, CTA), imagem limpa em cima |
| ↑ Forte | `linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 50%)` | Texto na base com mais conteúdo |
| ↕ Fraco | `linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 33%, transparent 67%, rgba(0,0,0,1) 100%)` | Tag no topo + texto na base, imagem visível no meio |
| ↕ Forte | `linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 50%, transparent 50%, rgba(0,0,0,1) 100%)` | Tag no topo + texto na base com mais conteúdo |
| Radial | `radial-gradient(circle, rgba(0,0,0,0.7) 0%, transparent 70%)` | Texto centralizado, destaque no centro |
| Vinheta | `radial-gradient(circle, transparent 30%, rgba(0,0,0,0.7) 100%)` | Foco na imagem central, escurece bordas |

**Gradientes customizados**: Além dos 10 presets, o campo `fill` aceita qualquer CSS gradient válido. Usar gradientes customizados quando os presets não atendem ao layout específico de texto do slide.

**IMPORTANTE**: Não usar `image-top`, `image-bottom` ou `image-full` quando a imagem deve ser o fundo do slide. Esses layouts colocam a imagem como elemento separado, não como background. Para visual editorial cinematográfico, **sempre usar `freeform` + `backgroundImage` + overlay**.

**12 tipos de elementos:**

| Tipo | Props Chave | Font Size Default |
|------|-------------|-------------------|
| `tag` | `content` | 22px |
| `heading` | `content`, `level` (1/2/3) | 72/56/44px |
| `paragraph` | `content` | 38px |
| `subtitle` | `content` | 32px |
| `emoji` | `content`, `size` | 96px |
| `image` | `src`, `variant` (area/background/inline) | — |
| `overlay` | `fill` (CSS gradient) | — |
| `quote` | `content`, `attribution` | 46px |
| `list-item` | `content`, `icon` | 36px |
| `highlight` | `content`, `backgroundColor` | 38px |
| `divider` | `dividerWidth`, `dividerHeight` | — |
| `spacer` | `height` | — |

Para spec completo de cada elemento, ler `references/elements.md`.

### 5.4 Regras do Schema

- **Canvas**: Sempre 1080x1440px
- **IDs**: Strings únicas (alfanumérico, 12 chars)
- **Imagens**: Referenciar como `"assets/filename.jpg"`
- **Backgrounds de slide**: Cor hex, CSS gradient, ou `"assets/bg.jpg"` em `backgroundImage`
- **Font families**: Apenas as 12 disponíveis (Afacad, Adamina, Archivo, Inter, Space Grotesk, DM Sans, Poppins, Montserrat, Playfair Display, Merriweather, JetBrains Mono, Fira Code)
- **Texto em PT-BR**: Todo texto visível ao usuário em português brasileiro (salvo instrução contrária)
- **Inline HTML**: `<b>`, `<i>`, `<u>`, `<span style="color:...">` — proibido `<div>`, `<p>`, `<h1-h6>`, `<script>`

### 5.5 Validar

```bash
python3 .claude/skills/carousel-zip-generator/scripts/validate_carousel.py carousel-build/schema.json
```

### 5.6 Empacotar ZIP

```bash
python3 .claude/skills/carousel-zip-generator/scripts/generate-carousel.py \
  --schema carousel-build/schema.json \
  --output carousel.zip \
  --assets carousel-build
```

Ou manualmente:
```bash
cd carousel-build && zip -r ../carousel.zip schema.json assets/
```

### 5.7 Entregar

Informar ao usuário:
- Localização do ZIP
- Como importar: abrir o editor → clicar "Importar ZIP" na galeria
- Tudo pode ser editado visualmente após a importação (cores, fontes, textos, layout)

## Regras de Qualidade (Não Negociar)

1. **Travar direção visual antes de gerar qualquer imagem**
2. **Consistência**: paleta, luz e textura iguais em todas as cenas
3. **Título tipográfico separado** (fundo transparente, nunca dentro da cena)
4. **Se tem imagens, mínimo ~80% slides freeform** (não se aplica a carrosséis 100% texto)
5. **Progressão narrativa clara**: dor → tensão → método → prova → CTA
6. **CTA único** (uma ação, sem múltiplos pedidos)
7. **Uma ideia por slide** — se precisou de "e também", dividir em 2 slides
8. **Hook forte no slide 1** — se não para o scroll, o resto não importa
9. **Linguagem concreta** — sem "potencialize seus resultados", com "aumente 30% em 2 semanas"
10. **Copy anti-IA** — seguir `references/copy-direction.md` rigorosamente. Sem clichês, sem buzzwords, sem padrões repetitivos de escrita genérica.

## Comandos Essenciais

```bash
# Gerar prompt pack a partir do brief
python3 scripts/build_prompt_pack.py --brief brief.json --output prompt-pack.json --slides 10

# Gerar imagens via KIE API (requer KIE_API_KEY)
python3 scripts/generate_images.py --prompt-pack prompt-pack.json --output-dir carousel-build/assets/ --quality high

# Gerar scaffold do carrossel (preencher copy depois)
python3 scripts/scaffold_carousel.py --title "Título" --handle "@user" --brand "MARCA" --slides 10 --output schema.json

# Validar schema final
python3 scripts/validate_carousel.py schema.json

# Empacotar ZIP
python3 scripts/generate-carousel.py --schema schema.json --output carousel.zip --assets ./
```

(Todos os scripts em `scripts/` dentro desta skill. Caminhos relativos à raiz da skill.)

## Referências

| Arquivo | Quando Ler |
|---------|-----------|
| `references/creative-brief-spec.md` | Montando o brief criativo, precisa de exemplos |
| `references/image-generation-playbook.md` | Gerando imagens, precisa de padrões de prompt |
| `references/kie-api.md` | Documentação da API KIE (GPT Image 1.5, Gemini 3 Pro) |
| `references/schema-spec.md` | Campos do schema, tipos de dados, defaults |
| `references/elements.md` | Properties de cada tipo de elemento |
| `references/themes-and-examples.md` | Escolhendo tema, precisa de exemplos completos |
| `references/copy-direction.md` | Escrevendo copy, regras anti-IA e anti-clichê |
