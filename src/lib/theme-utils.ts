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
    // Colors
    '--bg': colors.background,
    '--bg-subtle': colors.backgroundSubtle,
    '--text': colors.text,
    '--text-secondary': colors.textSecondary,
    '--text-muted': colors.textMuted,
    '--highlight': colors.highlight,
    '--accent': colors.accent,
    '--divider': colors.divider,
    '--card-bg': colors.cardBackground,
    '--highlight-soft': colors.highlightSoft,
    '--highlight-border': colors.highlightBorder,
    '--icon-color': colors.iconColor,
    '--icon-color-alt': colors.iconColorAlt,

    // Typography — families
    '--font-heading': `'${typography.heading.family}', sans-serif`,
    '--font-paragraph': `'${typography.paragraph.family}', sans-serif`,
    '--font-subtitle': `'${typography.subtitle.family}', sans-serif`,
    '--font-tag': `'${typography.tag.family}', sans-serif`,
    '--font-quote': `'${typography.quote.family}', sans-serif`,
    '--font-stat': `'${typography.stat.family}', sans-serif`,

    // Typography — weights
    '--weight-heading': String(typography.heading.weight),
    '--weight-paragraph': String(typography.paragraph.weight),
    '--weight-subtitle': String(typography.subtitle.weight),
    '--weight-tag': String(typography.tag.weight),
    '--weight-quote': String(typography.quote.weight),
    '--weight-stat': String(typography.stat.weight),

    // Font scale
    '--font-scale': String(fontScale),
  };

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
 * Returns true if the given hex color is perceived as light.
 * Uses the YIQ brightness formula.
 */
export function isLightColor(hex: string): boolean {
  const num = parseInt(hex.replace('#', ''), 16);
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
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Lighten a hex color by a factor (0–1).
 */
export function lightenHex(hex: string, factor: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
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
  const num = parseInt(hex.replace('#', ''), 16);
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
