---
name: carousel-zip-generator
description: "Pipeline completo para criar carrosséis de alto impacto para Instagram: estratégia, copy, direção visual, geração de imagens via API e montagem de ZIP (schema.json + assets) validado para o Carousel Editor V2. Use sempre que o usuário pedir para criar, gerar ou montar um carrossel, slides para Instagram, conteúdo visual para redes sociais, ou quiser produzir um .zip com schema.json + assets. Também ativar quando mencionar carousel schema, slide generation, AI carousel, geração de carrossel, criação de posts visuais, ou qualquer tipo de conteúdo em formato carrossel."
---

# Carousel Generator — Pipeline Completo

Ideia → Estratégia → Direção Visual → Imagens → Schema JSON → ZIP importável.

## Visão Geral

Este skill executa o pipeline completo para criar carrosséis profissionais para Instagram. O output final é um arquivo `.zip` contendo `schema.json` + `assets/` importável pelo Carousel Editor V2.

### Antes de Começar

1. **Ler preferências do usuário**: Verificar se o auto-memory (`~/.claude/projects/*/memory/`) contém preferências salvas (handle, marca, tom de voz, estilo de copy, etc.). Usar essas preferências como defaults sem perguntar novamente.
2. **Criar pasta de trabalho**: No diretório atual, criar uma pasta dedicada para este carrossel:
   ```bash
   mkdir -p carousel-{slug}/assets
   ```
   Onde `{slug}` é o título do carrossel em kebab-case (ex: `carousel-5-erros-de-copy`). Todos os assets, schema.json e o ZIP final ficam dentro dessa pasta.
3. **Ao finalizar a sessão**: Salvar no auto-memory as preferências do usuário que foram reveladas durante o trabalho (handle, marca, tom preferido, ajustes recorrentes de copy, direção visual favorita). Isso evita repetir as mesmas perguntas em sessões futuras.

**O pipeline tem 5 fases com 3 pontos de aprovação:**

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐
│ 1. ESTRATÉGIA│ →  │ 2. APROVAÇÃO │ →  │ 3. CRIATIVO  │ →  │ 4. IMAGENS   │ →  │ 5. MONTAGEM │
│ Brief + Copy │    │ Copy c/ user │    │ Visual Dir.  │    │ API Generate │    │ JSON + ZIP  │
└─────────────┘    └──────▲───────┘    └──────▲───────┘    └──────▲───────┘    └─────────────┘
                   APROVAÇÃO 1:         APROVAÇÃO 2:         APROVAÇÃO 3:
                   Copy (feedback       Design (paleta,      Hero editorial
                   aberto, sem          tipografia,          (antes de gerar
                   AskUserQuestion)     direção visual)      as cenas)
```

**IMPORTANTE**: Nunca avançar para a próxima fase sem aprovação explícita do usuário.

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

Planejar a sequência de slides como um arco narrativo. Cada slide tem uma FUNÇÃO no arco. Os ELEMENTOS que compõem cada slide devem ser escolhidos com base no conteúdo específico daquele slide, não copiados de um template.

**Arco narrativo (funções, não templates):**

1. **Hook** — para o scroll. Uma frase, um dado, uma imagem. Menos é mais.
2. **Tensão** — a dor, o problema, o gap. Fazer o leitor se reconhecer.
3-7. **Desenvolvimento** — método, exemplos, dados, provas. Cada slide avança um passo lógico. Variar a forma: um slide pode ser só um número grande, outro uma lista de 3 passos, outro uma citação.
8-9. **Virada** — o insight, o resultado, a mudança de perspectiva.
10. **CTA** — uma ação clara e única.

**Princípio de composição**: Para cada slide, perguntar "qual é a informação central?" e escolher os elementos que melhor comunicam ESSA informação. Consultar `references/elements.md` para specs de cada tipo de elemento. Não existe combinação "correta" — existe a que serve o conteúdo.

**REGRA**: Se o slide tem imagem, usar `freeform` + `backgroundImage`. Nunca `image-top`/`image-bottom` para visual editorial.

**Regras editoriais (não negociar):**
- 8 a 12 slides (sweet spot para Instagram)
- Uma ideia central por slide
- **Carrosséis com imagens**: mínimo ~80% de slides freeform (com backgroundImage + overlay + texto posicionado). Máximo ~20% texto puro (list, quote, highlight)
- **Carrosséis 100% texto**: se o usuário optar por não usar imagens, todos os slides podem ser text-only (title-body, list, quote, highlight, etc.) com fundo sólido ou gradiente. A regra dos 80% freeform não se aplica nesse caso.
- CTA final único (salvar **ou** comentar **ou** compartilhar — nunca 3 de uma vez)
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
1. Copiar o arquivo para `carousel-{slug}/assets/` (será incluído no ZIP)
2. Na geração de imagens (Fase 4), usar a imagem como `input_urls` no modo i2i para gerar o hero editorial, incorporando o elemento visual do usuário
3. Depois usar o hero como referência para as cenas narrativas (mantendo consistência + elemento do usuário)

```bash
# Hero usando mascote como referência i2i
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt "Editorial cinematic photo featuring [DESCRIÇÃO DO MASCOTE]..." \
  --model gpt-image/1.5-image-to-image \
  --input-urls "carousel-{slug}/assets/mascote.png" \
  --output-dir carousel-{slug}/assets/ \
  --filename hero-editorial.jpg \
  --quality high
```

**Caso B: Imagem como asset direto no slide**

O usuário quer que a imagem apareça como está, sem transformação.

Exemplo: *"Quero a logo da empresa no último slide logo.png"*

Fluxo:
1. Copiar o arquivo para `carousel-{slug}/assets/` (ex: `assets/logo.png`)
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

### 2.1 Autovalidação Anti-IA (OBRIGATÓRIA antes de mostrar ao usuário)

Antes de apresentar a copy, reler `references/copy-direction.md` e revisar cada slide contra estas regras. Se encontrar violações, corrigir ANTES de mostrar:

- **Travessões**: Buscar qualquer uso de em-dash (—) ou en-dash (–) no meio de frases. Reformular com vírgula ou dividir em duas frases.
- **Anáforas**: Verificar se 3+ slides seguidos começam com a mesma palavra/estrutura. Variar.
- **Fórmula "X vs Y"**: Eliminar qualquer "Não é X, é Y" ou "É mais do que X, é Y".
- **Revelações épicas**: Cortar "E aqui está a verdade", "Isso muda tudo", "O que ninguém te conta".
- **Palavras proibidas**: Conferir a tabela completa em `copy-direction.md` (gamechanger, invisível, propósito, etc.).
- **Falso Hemingway**: Identificar sequências de frases curtas metralhadas. Inserir fluidez com frases longas.
- **Adjetivos**: Máximo 1 por frase. Substituir adjetivos por dados concretos.
- **Emojis no texto**: Zero. Nenhum emoji em heading, paragraph, subtitle, quote.
- **Ponto final em títulos**: Elementos `heading` e `subtitle` NUNCA terminam com ponto final (`.`). Verificar todos e remover.

**Esta validação não é opcional.** Se na segunda iteração (após ajustes do usuário) a copy ainda tiver violações, corrigir novamente antes de mostrar.

### 2.2 Apresentar a Copy

Depois de definir o brief e a estrutura narrativa, apresentar ao usuário:

1. **Título do carrossel**
2. **Sequência completa de slides** — para cada slide mostrar:
   - Número e função (Hook, Problema, Método, etc.)
   - Tag (se houver)
   - Heading (título do slide)
   - Texto do corpo (parágrafo)
3. **CTA final**

Formato sugerido para apresentação:

```
COPY DO CARROSSEL: "Título"

Slide 1 (HOOK): "Frase de impacto"
  "Subtítulo ou complemento"

Slide 2 (PROBLEMA): TAG: CONTEXTO
  "Heading do slide"
  "Texto do corpo explicando a dor..."

Slide 3 (MÉTODO): TAG: COMO FUNCIONA
  "Heading do slide"
  "Texto do corpo com o método..."

[...]

Slide 10 (CTA):
  "Frase de fechamento"
  "Call-to-action"
```

### 2.3 Aguardar Feedback Aberto

**NUNCA usar a ferramenta AskUserQuestion com opções pré-definidas para aprovar a copy.** O usuário precisa de espaço para dar feedback aberto, sugerir mudanças pontuais, reescrever frases, mudar o tom. Apresentar a copy como texto normal e aguardar a resposta livre do usuário.

Só avançar para Fase 3 (Direção Visual) após "ok", "aprovado", "pode seguir" ou equivalente. Se o usuário pedir ajustes, aplicar e rodar a autovalidação anti-IA novamente antes de reapresentar.

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

### 3.4 Aprovação do Design

**PARAR AQUI e apresentar o design ao usuário antes de gerar imagens.**

Apresentar um resumo visual claro:

```
DESIGN DO CARROSSEL: "Título"

Tema: Dark / Light / Custom
Cores: background #0a0e1a, texto #f8fafc, acento #fbbf24
Tipografia: Playfair Display 700 (headings) + Inter 400 (body)
Direção visual: iluminação dourada lateral, textura grão de filme, lente 50mm, atmosfera studio
Overlays: fade-to-top na capa/CTA, bidirecional nos slides de corpo
```

**NUNCA usar AskUserQuestion com opções pré-definidas.** Apresentar como texto e aguardar feedback aberto. Só avançar para geração de imagens após aprovação explícita.

---

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

### 4.3 Aprovação do Hero

**PARAR após gerar o Hero editorial e mostrar ao usuário.** O hero é a âncora visual de todo o carrossel — todas as cenas narrativas serão geradas usando o hero como referência i2i. Se o hero não está bom (paleta errada, iluminação inadequada, composição ruim), regenerar até o usuário aprovar.

Só gerar as cenas narrativas DEPOIS que o hero for aprovado. Gerar cenas com um hero ruim desperdiça créditos de API e produz um carrossel inconsistente.

### 4.4 Padrões de Prompt

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

### 4.5 Checklist por Imagem

- Mantém paleta e iluminação do conjunto?
- Continua a narrativa do slide anterior?
- Parece parte do mesmo ensaio fotográfico?
- Está limpa para receber texto por cima?

### 4.6 Gerar via Script

**Prompt pack com consistência automática (recomendado):**
```bash
# Hero é gerado primeiro via t2i, depois cenas usam hero como referência via i2i
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt-pack prompt-pack.json \
  --output-dir carousel-{slug}/assets/ \
  --quality high
```

**Sem referência (text-to-image puro):**
```bash
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt-pack prompt-pack.json \
  --output-dir carousel-{slug}/assets/ \
  --no-ref
```

**Imagem avulsa:**
```bash
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt "Editorial cinematic photo..." \
  --output-dir carousel-{slug}/assets/ \
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
  --output-dir carousel-{slug}/assets/ \
  --filename scene-03.jpg
```

**Image-to-image manual:**
```bash
python3 .claude/skills/carousel-zip-generator/scripts/generate_images.py \
  --prompt "Same scene, different angle..." \
  --model gpt-image/1.5-image-to-image \
  --input-urls "https://url-da-hero.jpg" \
  --output-dir carousel-{slug}/assets/ \
  --filename scene-04.jpg
```

### 4.7 Estrutura de Assets

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
  --output carousel-{slug}/schema.json
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

Para carrosséis com imagens, **TODOS os slides com foto devem usar `freeform`** com overlay + elementos posicionados.

**Única regra obrigatória**: overlay (zIndex 1) + pelo menos um elemento de texto (zIndex 2+). Tudo o mais é decisão de composição baseada no conteúdo.

**Princípios de composição para freeform:**

1. **O conteúdo determina os elementos.** Se o slide é só um dado impactante, use apenas um heading grande. Se precisa de contexto, adicione um paragraph. Se tem uma lista, use list-items. Não adicionar elementos "porque o template pede" — adicionar porque o conteúdo precisa.

2. **Variar entre slides.** Cada slide no arco tem função diferente. Alternar: slides densos (3-4 elementos) com slides minimalistas (1-2 elementos).

3. **Overlay segue o texto, não o contrário.** Primeiro decidir ONDE o texto fica (topo, base, centro), depois escolher o overlay que protege essa região. Ver tabela de overlays abaixo.

4. **Menos é mais.** Um slide com apenas um heading centralizado de 52px sobre uma foto forte tem mais impacto que um slide lotado de elementos.

**Dimensões de composição** (usar como vocabulário, não como receita):
- **Densidade**: minimalista (1-2 elementos) vs. denso (4-5 elementos). Alternar ao longo do carrossel.
- **Posição do texto**: topo, centro, base, ou distribuído (topo + base). A posição determina o overlay.
- **Escala tipográfica**: heading de 52px = autoridade. Heading de 36px + paragraph de 24px = nuance. Escolher conforme o peso da informação.
- **Presença de tag**: tag categoriza. Usar quando o slide precisa de rótulo. A maioria dos slides NÃO precisa de tag.
- **Tipo de conteúdo**: heading-only (dado, afirmação forte), heading+paragraph (contexto), heading+list-items (passos), quote (voz externa). Escolher com base no QUE o slide comunica.

**Anti-padrão**: Copiar a mesma estrutura de elementos em todos os slides (ex: tag + heading + paragraph em 8 de 10 slides). Isso é o equivalente visual de uma apresentação genérica. Cada slide merece sua própria composição.

Exemplo de sintaxe JSON para slide freeform:

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
      "id": "heading-id",
      "type": "heading",
      "level": 2,
      "content": "Frase de impacto do slide.",
      "x": 80, "y": 1040, "w": 920, "fontSize": 44, "zIndex": 2
    },
    {
      "id": "paragraph-id",
      "type": "paragraph",
      "content": "Texto detalhado posicionado na parte inferior do slide.",
      "x": 80, "y": 1200, "w": 920, "fontSize": 24, "zIndex": 2
    }
  ]
}
```

**Regras de posicionamento (canvas 1080x1440):**
- **Padding lateral**: `x: 80`, `w: 920` (80px de cada lado)
- **Tag (quando usar)**: `y: 80–120`, no topo. Usar apenas quando o slide precisa de categorização.
- **Heading**: posição varia conforme layout do slide (topo `y: 100–200`, centro `y: 600`, base `y: 1000–1100`)
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
python3 .claude/skills/carousel-zip-generator/scripts/validate_carousel.py carousel-{slug}/schema.json
```

### 5.6 Empacotar ZIP

```bash
python3 .claude/skills/carousel-zip-generator/scripts/generate-carousel.py \
  --schema carousel-{slug}/schema.json \
  --output carousel.zip \
  --assets carousel-{slug}
```

Ou manualmente:
```bash
cd carousel-{slug} && zip -r ../carousel.zip schema.json assets/
```

### 5.7 Entregar

Informar ao usuário:
- Localização do ZIP (dentro da pasta `carousel-{slug}/`)
- Como importar: abrir o editor → clicar "Importar ZIP" na galeria
- Tudo pode ser editado visualmente após a importação (cores, fontes, textos, layout)

### 5.8 Salvar Preferências do Usuário

Ao finalizar, atualizar o auto-memory com as preferências reveladas durante a sessão. Salvar no arquivo de memória do projeto (ou criar se não existir):

Dados a persistir (quando revelados):
- **handle**: @username do Instagram
- **brand**: nome da marca para o footer
- **tom de voz preferido**: ex: "direto e confiante, sem guru"
- **estilo de copy**: ajustes recorrentes que o usuário pediu (ex: "prefere frases mais curtas", "gosta de dados numéricos", "não usar perguntas retóricas")
- **direção visual padrão**: paleta, tipografia, atmosfera que o usuário escolheu
- **formato preferido**: ex: "sempre 10 slides", "prefere 100% freeform"

Isso evita repetir as mesmas perguntas e calibrações em sessões futuras.

## Regras de Qualidade (Não Negociar)

1. **Travar direção visual antes de gerar qualquer imagem**
2. **Consistência**: paleta, luz e textura iguais em todas as cenas
3. **Título tipográfico separado** (fundo transparente, nunca dentro da cena)
4. **Se tem imagens, mínimo ~80% slides freeform** (não se aplica a carrosséis 100% texto)
5. **Progressão narrativa clara**: o arco deve avançar logicamente do hook ao CTA
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
python3 scripts/generate_images.py --prompt-pack prompt-pack.json --output-dir carousel-{slug}/assets/ --quality high

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
