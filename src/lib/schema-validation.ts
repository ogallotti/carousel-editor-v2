import type { CarouselSchema, Theme, ThemeColors, ThemeTypography, Slide } from '@/types/schema';
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
      layout: (slide.layout as string) || 'title-body',
      elements: Array.isArray(slide.elements) ? slide.elements : [],
      background: slide.background ?? null,
      backgroundImage: slide.backgroundImage ?? null,
    })) as Slide[];
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
