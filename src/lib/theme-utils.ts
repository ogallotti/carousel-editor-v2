// ============================================================
// Theme Utilities
// Maps Theme objects to CSS custom properties for slide rendering
// ============================================================

import type { Theme, ThemeColors } from '@/types/schema';

/**
 * Convert a Theme object to a Record of CSS custom property name → value
 * that the slide.css expects.
 */
export function themeToCSVars(theme: Theme): Record<string, string> {
  const { colors, typography, fontScale } = theme;

  const vars: Record<string, string> = {
    // Colors (--slide- prefix to avoid collision with shadcn/Tailwind vars)
    '--slide-bg': colors.background,
    '--slide-bg-subtle': colors.backgroundSubtle,
    '--slide-text': colors.text,
    '--slide-text-secondary': colors.textSecondary,
    '--slide-text-muted': colors.textMuted,
    '--slide-highlight': colors.highlight,
    '--slide-accent': colors.accent,
    '--slide-divider': colors.divider,
    '--slide-card-bg': colors.cardBackground,
    '--slide-highlight-soft': colors.highlightSoft,
    '--slide-highlight-border': colors.highlightBorder,
    '--slide-icon-color': colors.iconColor,
    '--slide-icon-color-alt': colors.iconColorAlt,

    // Typography — families
    '--slide-font-heading': `'${typography.heading.family}', sans-serif`,
    '--slide-font-paragraph': `'${typography.paragraph.family}', sans-serif`,
    '--slide-font-subtitle': `'${typography.subtitle.family}', sans-serif`,
    '--slide-font-tag': `'${typography.tag.family}', sans-serif`,
    '--slide-font-quote': `'${typography.quote.family}', sans-serif`,

    // Typography — weights
    '--slide-weight-heading': String(typography.heading.weight),
    '--slide-weight-paragraph': String(typography.paragraph.weight),
    '--slide-weight-subtitle': String(typography.subtitle.weight),
    '--slide-weight-tag': String(typography.tag.weight),
    '--slide-weight-quote': String(typography.quote.weight),

    // Font scale
    '--slide-font-scale': String(fontScale),
  };

  if (theme.elementGap !== undefined) {
    vars['--element-gap'] = `${theme.elementGap}px`;
  }

  return vars;
}

/**
 * Auto-derive secondary color tokens from the core ThemeColors.
 * Useful when a user changes a core color (e.g. highlight) and we need
 * to recalculate highlightSoft, highlightBorder, bgSubtle, etc.
 */
export function derivedColors(colors: ThemeColors): Partial<ThemeColors> {
  const isLight = isLightColor(colors.background);
  return {
    highlightSoft: hexToRgba(colors.highlight, isLight ? 0.08 : 0.10),
    highlightBorder: hexToRgba(colors.highlight, isLight ? 0.20 : 0.25),
    backgroundSubtle: isLight
      ? darkenHex(colors.background, 0.03)
      : lightenHex(colors.background, 0.03),
    cardBackground: isLight
      ? darkenHex(colors.background, 0.02)
      : lightenHex(colors.background, 0.02),
    divider: isLight
      ? darkenHex(colors.background, 0.10)
      : lightenHex(colors.background, 0.10),
    iconColor: colors.highlight,
    iconColorAlt: colors.accent,
  };
}

/**
 * Normalize 3-digit hex (#abc) to 6-digit (#aabbcc).
 */
function normalizeHex(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return '#' + h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return '#' + h;
}

/**
 * Returns true if the given hex color is perceived as light.
 * Uses the YIQ brightness formula.
 */
export function isLightColor(hex: string): boolean {
  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

/**
 * Convert hex color to rgba string.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Lighten a hex color by a factor (0–1).
 */
export function lightenHex(hex: string, factor: number): string {
  const num = parseInt(normalizeHex(hex).replace('#', ''), 16);
  const amt = Math.round(2.55 * factor * 100);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

/**
 * Darken a hex color by a factor (0–1).
 */
export function darkenHex(hex: string, factor: number): string {
  const num = parseInt(normalizeHex(hex).replace('#', ''), 16);
  const amt = Math.round(2.55 * factor * 100);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    '#' +
    (
      0x1000000 +
      (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)
    )
      .toString(16)
      .slice(1)
  );
}
