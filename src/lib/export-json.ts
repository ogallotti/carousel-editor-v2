import type { CarouselSchema } from '@/types/schema';

// ─── Helpers ────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'carrossel';
}

export function downloadTextFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

// ─── Schema → JSON string ──────────────────────────────────

export function schemaToJson(schema: CarouselSchema): string {
  const output = { ...schema, updatedAt: new Date().toISOString() };
  return JSON.stringify(output, null, 2);
}
