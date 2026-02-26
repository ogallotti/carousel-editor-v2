# KIE API — Geração de Imagens

Serviço recomendado para geração de imagens via API: [kie.ai](https://kie.ai)

## Modelos Disponíveis

| Modelo | ID na API | Tipo | Aspect Ratios | Melhor Para |
|--------|-----------|------|---------------|-------------|
| **GPT Image 1.5** (preferencial) | `gpt-image/1.5-text-to-image` | Text → Image | 1:1, 2:3, 3:2 | Cenas editoriais, hero shots, qualidade máxima |
| **GPT Image 1.5 i2i** | `gpt-image/1.5-image-to-image` | Image → Image | 1:1, 2:3, 3:2 | Variações, refinamento, consistência visual |
| **Gemini 3 Pro** (preferencial 2) | `nano-banana-pro` | Text → Image | 1:1, 4:5, 2:3, 3:2, 16:9, 9:16 | Suporta 4:5 nativo (Instagram), resolução até 4K |

### Qual modelo usar?

```
Cenas editoriais / hero shots → gpt-image/1.5-text-to-image (quality: high)
Variações de uma imagem existente → gpt-image/1.5-image-to-image
Precisa de ratio 4:5 exato → nano-banana-pro
Título tipográfico (PNG) → gpt-image/1.5-text-to-image (quality: high)
```

**Nota sobre aspect ratio**: O canvas do carrossel é 1080x1440 (4:5). O `nano-banana-pro` suporta `4:5` nativamente. Os modelos GPT Image suportam `2:3` como mais próximo — gera ~1024x1536 que precisa de crop/resize mínimo.

## Autenticação

Todas as requisições precisam de Bearer Token no header:

```
Authorization: Bearer YOUR_API_KEY
```

Obter API Key: [kie.ai/api-key](https://kie.ai/api-key)

**Variável de ambiente**: `KIE_API_KEY`

## Fluxo Assíncrono (Todos os Modelos)

```
1. POST createTask  →  recebe taskId
2. GET recordInfo?taskId=...  →  poll até state=success
3. Extrair URLs do resultJson.resultUrls[]
4. Download das imagens
```

---

## 1. GPT Image 1.5 — Text to Image

### Criar Tarefa

```
POST https://api.kie.ai/api/v1/jobs/createTask
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

```json
{
  "model": "gpt-image/1.5-text-to-image",
  "input": {
    "prompt": "Editorial cinematic photograph for Instagram carousel...",
    "aspect_ratio": "2:3",
    "quality": "high"
  }
}
```

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `input.prompt` | string | Sim | Descrição da imagem (max 3000 chars) |
| `input.aspect_ratio` | string | Sim | `1:1`, `2:3`, `3:2` |
| `input.quality` | string | Sim | `medium` (rápido) ou `high` (detalhado, mais lento) |

**Para carrosséis**: Usar `aspect_ratio: "2:3"` e `quality: "high"`.

### Resposta

```json
{
  "code": 200,
  "msg": "success",
  "data": { "taskId": "abc123..." }
}
```

---

## 2. GPT Image 1.5 — Image to Image

### Criar Tarefa

```
POST https://api.kie.ai/api/v1/jobs/createTask
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

```json
{
  "model": "gpt-image/1.5-image-to-image",
  "input": {
    "prompt": "Maintain the same composition, adjust lighting to warm golden hour...",
    "input_urls": ["https://example.com/original-scene.jpg"],
    "aspect_ratio": "2:3",
    "quality": "high"
  }
}
```

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `input.prompt` | string | Sim | Instruções de transformação |
| `input.input_urls` | string[] | Sim | URLs das imagens de referência |
| `input.aspect_ratio` | string | Sim | `1:1`, `2:3`, `3:2` |
| `input.quality` | string | Sim | `medium` ou `high` |

**Uso no carrossel**: Gerar hero shot primeiro com text-to-image, depois usar image-to-image para criar variações consistentes para as cenas narrativas.

---

## 3. Gemini 3 Pro (nano-banana-pro)

### Criar Tarefa

```
POST https://api.kie.ai/api/v1/jobs/createTask
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

```json
{
  "model": "nano-banana-pro",
  "input": {
    "prompt": "Editorial cinematic photograph for Instagram carousel...",
    "aspect_ratio": "4:5",
    "resolution": "2K",
    "output_format": "jpg"
  }
}
```

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `input.prompt` | string | Sim | Descrição da imagem |
| `input.aspect_ratio` | string | Não | `1:1`, `4:5`, `2:3`, `3:2`, `16:9`, `9:16` (default: `1:1`) |
| `input.resolution` | string | Não | `1K`, `2K`, `4K` (default: `1K`) |
| `input.output_format` | string | Não | `png`, `jpg` (default: `png`) |
| `input.input_urls` | string[] | Não | Até 8 imagens de referência |

**Vantagem para carrosséis**: Suporta `aspect_ratio: "4:5"` que corresponde exatamente ao canvas 1080x1440.

---

## Consultar Status (Todos os Modelos)

```
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=abc123...
Authorization: Bearer YOUR_API_KEY
```

### Resposta

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "abc123...",
    "model": "gpt-image/1.5-text-to-image",
    "state": "success",
    "resultJson": "{\"resultUrls\":[\"https://static.aiquickdraw.com/tools/example/image.webp\"]}",
    "failCode": null,
    "failMsg": null,
    "costTime": 12345,
    "completeTime": 1757584200000,
    "createTime": 1757584164490
  }
}
```

### Estados

| State | Significado | Ação |
|-------|------------|------|
| `waiting` | Na fila / processando | Continuar polling (intervalo: 3-5s) |
| `success` | Concluído | Extrair `resultJson.resultUrls[]` |
| `fail` | Falhou | Verificar `failCode` e `failMsg` |

### Extrair URLs do Resultado

```python
import json
result = json.loads(data["resultJson"])
image_urls = result["resultUrls"]  # Lista de URLs das imagens geradas
```

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Parâmetros inválidos |
| 401 | Autenticação falhou — verificar API Key |
| 402 | Saldo insuficiente |
| 404 | Recurso não encontrado |
| 422 | Validação de parâmetros falhou |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

## Estratégia de Geração para Carrosséis

### Sequência Recomendada (Hero-First Consistency)

1. **Título tipográfico** → `gpt-image/1.5-text-to-image` com quality `high`
2. **Hero editorial** → `gpt-image/1.5-text-to-image` com quality `high` — **ÂNCORA VISUAL**
3. **Cenas narrativas** → `gpt-image/1.5-image-to-image` passando a URL do hero como `input_urls` para garantir consistência de paleta, iluminação e textura
4. **Alternativa 4:5**: Usar `nano-banana-pro` com `aspect_ratio: "4:5"` se precisar de ratio exato

**Fallback**: Se o hero falhar ou i2i não estiver disponível, gerar todas via `gpt-image/1.5-text-to-image` com o mesmo bloco `visual_direction` copiado em todos os prompts.

O script `generate_images.py --prompt-pack` executa esse fluxo automaticamente. Use `--no-ref` para forçar text-to-image puro.

### Template de Prompt para a API

```
Editorial cinematic photograph for Instagram carousel.
Theme: [TEMA]. Audience: [PÚBLICO].
Scene [N] of [TOTAL]. Narrative beat: [OBJETIVO DO FRAME].
Visual direction locked: [PALETA + LUZ + TEXTURA + LENTE + ATMOSFERA].
Clean composition with negative space for text overlay.
No text, no logos, no watermarks. Photorealistic, magazine-grade.
```

### Checklist Pré-Geração

- [ ] Visual direction definido e travado (mesmo bloco em todos os prompts)
- [ ] Aspect ratio correto: `2:3` (GPT) ou `4:5` (Gemini)
- [ ] Quality: `high` para imagens finais
- [ ] Cada prompt inclui "Scene N of TOTAL" para coesão narrativa
- [ ] Prompts incluem "No text, no logos, no watermarks"
