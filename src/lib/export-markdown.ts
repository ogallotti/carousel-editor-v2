import type {
  CarouselSchema,
  SlideElement,
  HeadingElement,
  QuoteElement,
  ListItemElement,
  ImageElement,
  EmojiElement,
  HighlightElement,
  Slide,
} from '@/types/schema';

// ─── HTML → Markdown conversion ────────────────────────────

function htmlToMarkdown(html: string): string {
  let md = html;
  // Bold
  md = md.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**');
  // Italic
  md = md.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*');
  // Underline → plain text (MD has no native underline)
  md = md.replace(/<u>([\s\S]*?)<\/u>/gi, '$1');
  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  // Strip remaining tags, keep text content
  md = md.replace(/<[^>]+>/g, '');
  // Decode common HTML entities
  md = md
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return md.trim();
}

// ─── Freeform element sorting ──────────────────────────────

function sortFreeformElements(elements: SlideElement[]): SlideElement[] {
  return [...elements].sort((a, b) => {
    const ay = a.y ?? 0;
    const by = b.y ?? 0;
    // Same "row" (within 20px tolerance) → sort by x
    if (Math.abs(ay - by) <= 20) {
      return (a.x ?? 0) - (b.x ?? 0);
    }
    return ay - by;
  });
}

// ─── Element → Markdown ────────────────────────────────────

function elementToMarkdown(el: SlideElement): string | null {
  switch (el.type) {
    case 'heading': {
      const h = el as HeadingElement;
      const prefix = '#'.repeat(h.level);
      const text = htmlToMarkdown(h.content);
      return text ? `${prefix} ${text}` : null;
    }

    case 'tag': {
      const text = htmlToMarkdown(el.content);
      return text ? `**${text}**` : null;
    }

    case 'subtitle': {
      const text = htmlToMarkdown(el.content);
      return text ? `*${text}*` : null;
    }

    case 'paragraph': {
      const text = htmlToMarkdown(el.content);
      return text || null;
    }

    case 'quote': {
      const q = el as QuoteElement;
      const text = htmlToMarkdown(q.content);
      if (!text) return null;
      const lines = [`> "${text}"`];
      if (q.attribution) {
        lines.push(`> — ${htmlToMarkdown(q.attribution)}`);
      }
      return lines.join('\n');
    }

    case 'list-item': {
      const li = el as ListItemElement;
      const text = htmlToMarkdown(li.content);
      if (!text) return null;
      const icon = li.icon ? `${li.icon} ` : '';
      return `- ${icon}${text}`;
    }

    case 'highlight': {
      const h = el as HighlightElement;
      const text = htmlToMarkdown(h.content);
      return text ? `> **${text}**` : null;
    }

    case 'emoji': {
      const e = el as EmojiElement;
      return e.content || null;
    }

    case 'image': {
      const img = el as ImageElement;
      const alt = img.alt || 'imagem';
      return `![${alt}](${img.src})`;
    }

    case 'divider':
      return '---';

    case 'spacer':
      return '';

    case 'overlay':
      // Visual-only element, no text content
      return null;

    default:
      return null;
  }
}

// ─── Slide → Markdown ──────────────────────────────────────

function slideToMarkdown(slide: Slide, index: number): string {
  const layoutLabel = slide.layout.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const header = `## Slide ${index + 1} — ${layoutLabel}`;

  const elements =
    slide.layout === 'freeform'
      ? sortFreeformElements(slide.elements)
      : slide.elements;

  const lines: string[] = [];
  for (const el of elements) {
    const md = elementToMarkdown(el);
    if (md !== null) {
      lines.push(md);
    }
  }

  if (lines.length === 0) {
    return `${header}\n\n*(slide vazio)*`;
  }

  return `${header}\n\n${lines.join('\n\n')}`;
}

// ─── Schema → Markdown ─────────────────────────────────────

export function schemaToMarkdown(schema: CarouselSchema): string {
  const parts: string[] = [];

  // Title
  parts.push(`# ${schema.title || 'Carrossel sem título'}`);

  // Description
  if (schema.description) {
    parts.push(`> ${schema.description}`);
  }

  // Metadata
  if (schema.tags && schema.tags.length > 0) {
    parts.push(`Tags: ${schema.tags.join(', ')}`);
  }

  parts.push('---');

  // Slides
  for (let i = 0; i < schema.slides.length; i++) {
    parts.push(slideToMarkdown(schema.slides[i], i));
  }

  return parts.join('\n\n') + '\n';
}
