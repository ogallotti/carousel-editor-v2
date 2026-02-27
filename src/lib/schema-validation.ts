import type { CarouselSchema, Theme, ThemeColors, ThemeTypography, Slide, SlideElement } from '@/types/schema';
import { createEmptySchema, SCHEMA_VERSION } from '@/types/schema';

/**
 * Validates a parsed JSON object against the CarouselSchema contract.
 * Does NOT reject unknown fields (forward compatibility).
 */
export function validateSchema(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Schema deve ser um objeto'] };
  }
  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') errors.push('Campo "version" ausente ou inválido');
  if (!Array.isArray(obj.slides)) errors.push('Campo "slides" ausente ou não é um array');
  if (!obj.theme || typeof obj.theme !== 'object') errors.push('Campo "theme" ausente ou inválido');
  if (!obj.canvas || typeof obj.canvas !== 'object') errors.push('Campo "canvas" ausente ou inválido');

  // Validate header structure (warning only)
  if (obj.header) {
    if (typeof obj.header !== 'object' || Array.isArray(obj.header)) {
      errors.push('Campo "header" deveria ser um objeto');
    } else {
      const header = obj.header as Record<string, unknown>;
      if (typeof header.handle !== 'string') errors.push('Campo "header.handle" deveria ser string');
      if (typeof header.showCounter !== 'boolean') errors.push('Campo "header.showCounter" deveria ser boolean');
    }
  }

  // Validate footer structure (warning only)
  if (obj.footer) {
    if (typeof obj.footer !== 'object' || Array.isArray(obj.footer)) {
      errors.push('Campo "footer" deveria ser um objeto');
    } else {
      const footer = obj.footer as Record<string, unknown>;
      if (typeof footer.text !== 'string') errors.push('Campo "footer.text" deveria ser string');
    }
  }

  // Validate each slide has elements array (warning only)
  if (Array.isArray(obj.slides)) {
    for (let i = 0; i < obj.slides.length; i++) {
      const slide = obj.slides[i];
      if (!slide || typeof slide !== 'object' || Array.isArray(slide)) {
        errors.push(`slides[${i}] deveria ser um objeto`);
      } else {
        const s = slide as Record<string, unknown>;
        if (!Array.isArray(s.elements)) {
          errors.push(`slides[${i}].elements deveria ser um array`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Deep merge helpers ──────────────────────────────────────

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Blob);
}

function deepMerge<T extends Record<string, unknown>>(defaults: T, incoming: Record<string, unknown>): T {
  const result = { ...defaults } as Record<string, unknown>;
  for (const key of Object.keys(incoming)) {
    const src = incoming[key];
    const def = result[key];
    if (isPlainObject(def) && isPlainObject(src)) {
      result[key] = deepMerge(def as Record<string, unknown>, src);
    } else if (src !== undefined) {
      result[key] = src;
    }
  }
  return result as T;
}

// ─── Element normalization ──────────────────────────────────

// CSS defaults from slide.css per element type
const TEXT_ALIGN_DEFAULTS: Record<string, 'left' | 'center' | 'right'> = {
  tag: 'center',
  heading: 'center',
  paragraph: 'center',
  subtitle: 'center',
  quote: 'center',
  'list-item': 'left',
  highlight: 'center',
};

const VALID_TEXT_ALIGNS = new Set(['left', 'center', 'right']);

const VALID_ELEMENT_TYPES = new Set([
  'tag', 'heading', 'paragraph', 'subtitle', 'emoji', 'image',
  'overlay', 'quote', 'list-item', 'highlight', 'divider', 'spacer',
]);

const VALID_LAYOUTS = new Set([
  'cover', 'title-body', 'full-text', 'image-top', 'image-bottom',
  'image-full', 'quote', 'list', 'highlight', 'cta', 'freeform',
]);

/** Tags allowed in element content. Everything else is stripped. */
const ALLOWED_HTML_TAGS = new Set([
  'strong', 'em', 'span', 'br', 'u', 'b', 'i', 'sub', 'sup',
]);

/**
 * Strips dangerous HTML tags from content while preserving safe formatting tags.
 */
function sanitizeHtmlContent(html: string): string {
  // Remove script, iframe, object, embed, link tags and their content (for script/iframe/object/embed)
  // For self-closing or content-bearing dangerous tags:
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>\s*(?:<\/embed>)?/gi, '')
    .replace(/<link\b[^>]*rel\s*=\s*["']?stylesheet["']?[^>]*\/?>/gi, '')
    .replace(/<\/?((?!(?:strong|em|span|br|u|b|i|sub|sup)\b)\w+)(\s[^>]*)?\/?>/gi, (match, tagName) => {
      // Keep allowed tags, remove everything else
      if (ALLOWED_HTML_TAGS.has(tagName.toLowerCase())) return match;
      return '';
    });
}

/**
 * Normalizes a single element, filling textAlign to match CSS defaults
 * and clamping/fixing any invalid property values.
 * Preserves undefined for theme-inherited properties (fontFamily, fontWeight, color, opacity).
 */
function normalizeElement(el: SlideElement): SlideElement {
  const normalized = { ...el };

  // Ensure id
  if (!normalized.id) {
    normalized.id = `el-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Ensure valid type
  if (!VALID_ELEMENT_TYPES.has(normalized.type)) {
    (normalized as Record<string, unknown>).type = 'paragraph';
  }

  // textAlign: fill with CSS default if missing or invalid
  const defaultAlign = TEXT_ALIGN_DEFAULTS[normalized.type];
  if (defaultAlign !== undefined) {
    if (!normalized.textAlign || !VALID_TEXT_ALIGNS.has(normalized.textAlign)) {
      normalized.textAlign = defaultAlign;
    }
  }

  // Clamp opacity if present
  if (normalized.opacity !== undefined) {
    normalized.opacity = Math.max(0, Math.min(1, Number(normalized.opacity) || 1));
  }

  // Ensure heading level
  if (normalized.type === 'heading') {
    const h = normalized as { level?: number };
    if (!h.level || ![1, 2, 3].includes(h.level)) {
      h.level = 1;
    }
  }

  // Ensure image variant
  if (normalized.type === 'image') {
    const img = normalized as { variant?: string; src?: string };
    if (!img.variant || !['area', 'background', 'inline'].includes(img.variant)) {
      img.variant = 'area';
    }
    if (typeof img.src !== 'string') img.src = '';
  }

  // Ensure spacer height
  if (normalized.type === 'spacer') {
    const sp = normalized as { height?: number };
    if (typeof sp.height !== 'number' || sp.height < 0) sp.height = 24;
  }

  // Ensure overlay fill
  if (normalized.type === 'overlay') {
    const ov = normalized as { fill?: string };
    if (typeof ov.fill !== 'string') ov.fill = 'rgba(0,0,0,0.4)';
  }

  // Ensure content for text elements and sanitize HTML
  if ('content' in normalized) {
    const withContent = normalized as { content?: unknown };
    if (typeof withContent.content !== 'string') {
      withContent.content = '';
    } else {
      withContent.content = sanitizeHtmlContent(withContent.content);
    }
  }

  return normalized;
}

/**
 * Migrates/normalizes a parsed schema object to the current version.
 * Fills in missing fields with sensible defaults.
 * Preserves unknown fields for forward compatibility.
 */
export function migrateSchema(data: Record<string, unknown>): CarouselSchema {
  const id = (typeof data.id === 'string' && data.id) || 'imported';
  const defaults = createEmptySchema(id);

  // Deep merge preserves unknown keys from data while filling gaps from defaults
  const merged = deepMerge(
    defaults as unknown as Record<string, unknown>,
    data,
  ) as CarouselSchema;

  // Ensure version is current
  merged.version = SCHEMA_VERSION;

  // Normalize slides — each slide must have id and layout
  if (Array.isArray(merged.slides)) {
    merged.slides = (merged.slides as unknown as Record<string, unknown>[]).map((slide, idx) => ({
      ...slide,
      id: (slide.id as string) || `slide-${idx + 1}`,
      layout: (typeof slide.layout === 'string' && VALID_LAYOUTS.has(slide.layout))
        ? slide.layout
        : 'title-body',
      elements: Array.isArray(slide.elements) ? slide.elements : [],
      background: slide.background ?? null,
      backgroundImage: slide.backgroundImage ?? null,
    })) as Slide[];
  }

  // Normalize element properties so UI always reflects actual rendered state
  for (const slide of merged.slides) {
    slide.elements = slide.elements.map(normalizeElement);
  }

  // Deduplicate slide IDs
  const seenSlideIds = new Set<string>();
  for (const slide of merged.slides) {
    if (seenSlideIds.has(slide.id)) {
      slide.id = `slide-${Math.random().toString(36).slice(2, 9)}`;
    }
    seenSlideIds.add(slide.id);
  }

  // Deduplicate element IDs across all slides
  const seenElementIds = new Set<string>();
  for (const slide of merged.slides) {
    for (const el of slide.elements) {
      if (seenElementIds.has(el.id)) {
        el.id = `el-${Math.random().toString(36).slice(2, 9)}`;
      }
      seenElementIds.add(el.id);
    }
  }

  // Ensure theme has required nested structures
  if (merged.theme) {
    const t = merged.theme as Partial<Theme> & Record<string, unknown>;
    if (!t.colors || typeof t.colors !== 'object') {
      t.colors = defaults.theme.colors;
    } else {
      t.colors = { ...defaults.theme.colors, ...t.colors } as ThemeColors;
    }
    if (!t.typography || typeof t.typography !== 'object') {
      t.typography = defaults.theme.typography;
    } else {
      t.typography = { ...defaults.theme.typography, ...t.typography } as ThemeTypography;
    }
    if (typeof t.fontScale !== 'number') {
      t.fontScale = defaults.theme.fontScale;
    }
    if (typeof t.name !== 'string') {
      t.name = defaults.theme.name;
    }
  }

  // Ensure canvas has dimensions
  if (merged.canvas) {
    if (typeof merged.canvas.width !== 'number') merged.canvas.width = 1080;
    if (typeof merged.canvas.height !== 'number') merged.canvas.height = 1440;
  }

  return merged;
}
