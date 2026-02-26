# Formato do Brief Criativo

## Estrutura do Brief

```json
{
  "topic": "assunto central do post",
  "audience": "para quem é (ser específico)",
  "big_idea": "tese principal em UMA frase",
  "tone": "tom de voz",
  "title": "frase curta para o título tipográfico",
  "tagline": "subfrase opcional",
  "visual_hook": "imagem mental que para o scroll",
  "visual_direction": "paleta + iluminação + textura + lente + atmosfera",
  "scene_focus": "mapa narrativo visual",
  "cta": "ação final desejada (UMA só)",
  "handle": "@usuario",
  "brand": "NOME DA MARCA"
}
```

## Campos Obrigatórios

| Campo | Regra |
|-------|-------|
| `topic` | Assunto em linguagem direta |
| `audience` | Específico (não "todo mundo") |
| `big_idea` | Afirmação, **nunca pergunta**. Ex: "X funciona porque Y" |
| `tone` | Concreto: "direto e confiante", "provocativo com humor", "didático e acessível" |
| `visual_direction` | **Descritivo e concreto**. Proibido: "bonito", "premium", "de qualidade" sem detalhes |

## Campos Opcionais

| Campo | Quando Usar |
|-------|------------|
| `title` | Se já tem a frase da capa. Se não, derivar de `big_idea` |
| `tagline` | Complemento do título (subtítulo na capa) |
| `visual_hook` | Descrever a primeira imagem que para o scroll (familiar + surpresa) |
| `scene_focus` | Mapa narrativo: "dor → insight → 3 passos → prova → fechamento" |
| `cta` | UMA ação: salvar **ou** comentar **ou** compartilhar |
| `handle` | @username do Instagram |
| `brand` | Texto do footer (nome da marca) |

## Exemplo Bom

```json
{
  "topic": "carrosséis que convertem sem parecer venda",
  "audience": "infoprodutores que publicam no Instagram e querem mais engajamento",
  "big_idea": "carrossel converte quando entrega clareza prática em sequência visual memorável",
  "tone": "direto e confiante, sem guru",
  "title": "Carrossel que Converte",
  "tagline": "sem parecer anúncio",
  "visual_hook": "editorial de estúdio com contraste alto e textura analógica",
  "visual_direction": "paleta vinho + roxo profundo, luz lateral dura com recorte, grão fino de filme 35mm, lente 50mm, clima noturno sofisticado",
  "scene_focus": "dor confusa → insight → método em 3 passos → prova social → fechamento",
  "cta": "salvar este post",
  "handle": "@meuconteudo",
  "brand": "MEU CONTEÚDO"
}
```

## Exemplo Ruim (e por quê)

```json
{
  "topic": "marketing",
  "audience": "empreendedores",
  "big_idea": "como melhorar seu marketing?",
  "tone": "profissional",
  "visual_direction": "premium e moderno"
}
```

**Problemas:**
- `topic` genérico demais (marketing de quê? para quê?)
- `audience` vago (quais empreendedores?)
- `big_idea` é pergunta em vez de afirmação
- `tone` não diz nada (profissional como? sério? leve? provocativo?)
- `visual_direction` sem detalhes concretos (premium não é instrução visual)

## Tons de Voz — Referência

| Tom | Quando Usar | Exemplo de Frase |
|-----|------------|------------------|
| Direto e confiante | Autoridade, sem rodeios | "Isso funciona. Ponto." |
| Provocativo | Desafiar crença comum | "Tudo que te ensinaram está errado" |
| Didático | Ensinar passo a passo | "Vou te mostrar exatamente como" |
| Inspiracional | Motivar ação | "Você pode. E aqui está o mapa" |
| Storytelling | Narrativa pessoal | "Há 2 anos eu estava no zero..." |
| Humor seco | Engajamento jovem | "Spoiler: não vai dar certo assim" |

## Direção Visual — Exemplos Concretos

**Tech/Startup:**
"Paleta azul escuro + ciano elétrico, iluminação de ambiente frio tipo sala de servidor, textura digital clean, lente 35mm wide, atmosfera futurista controlada"

**Fitness/Wellness:**
"Paleta verde floresta + dourado quente, luz natural golden hour, textura orgânica suave, lente 85mm com bokeh, atmosfera de manhã calma ao ar livre"

**Negócios/Finanças:**
"Paleta azul marinho + dourado, iluminação lateral dura tipo retrato executivo, textura de papel premium, lente 50mm, atmosfera de escritório sofisticado"

**Criativo/Design:**
"Paleta roxo + rosa neon, iluminação contrastada tipo editorial de moda, grão de filme 35mm, lente 50mm f/1.4, atmosfera noturna de estúdio"
