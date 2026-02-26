// ============================================================
// Schema v1 — Universal carousel interchange format
// This is the TypeScript representation of schema.json
// ============================================================

export type ElementType =
  | 'tag'
  | 'heading'
  | 'paragraph'
  | 'subtitle'
  | 'emoji'
  | 'image'
  | 'overlay'
  | 'quote'
  | 'stat'
  | 'list-item'
  | 'highlight'
  | 'divider'
  | 'spacer';

export interface BaseElement {
  id: string;
  type: ElementType;
  marginTop?: number;
  marginBottom?: number;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  // Freeform positioning (only used when slide layout is 'freeform')
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  rotation?: number;
  zIndex?: number;
}

export interface TagElement extends BaseElement {
  type: 'tag';
  content: string;
}

export interface HeadingElement extends BaseElement {
  type: 'heading';
  level: 1 | 2 | 3;
  content: string;
}

export interface ParagraphElement extends BaseElement {
  type: 'paragraph';
  content: string;
}

export interface SubtitleElement extends BaseElement {
  type: 'subtitle';
  content: string;
}

export interface EmojiElement extends BaseElement {
  type: 'emoji';
  content: string;
  size?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  objectPosition?: string;
  variant: 'area' | 'background' | 'inline';
  borderRadius?: number;
}

export interface OverlayElement extends BaseElement {
  type: 'overlay';
  fill: string;
}

export interface QuoteElement extends BaseElement {
  type: 'quote';
  content: string;
  attribution?: string;
}

export interface StatElement extends BaseElement {
  type: 'stat';
  items: Array<{ value: string; label: string }>;
}

export interface ListItemElement extends BaseElement {
  type: 'list-item';
  icon?: string;
  content: string;
}

export interface HighlightElement extends BaseElement {
  type: 'highlight';
  content: string;
}

export interface DividerElement extends BaseElement {
  type: 'divider';
}

export interface SpacerElement extends BaseElement {
  type: 'spacer';
  height: number;
}

export type SlideElement =
  | TagElement
  | HeadingElement
  | ParagraphElement
  | SubtitleElement
  | EmojiElement
  | ImageElement
  | OverlayElement
  | QuoteElement
  | StatElement
  | ListItemElement
  | HighlightElement
  | DividerElement
  | SpacerElement;

export type SlideLayout =
  | 'cover'
  | 'title-body'
  | 'full-text'
  | 'image-top'
  | 'image-bottom'
  | 'image-full'
  | 'stats'
  | 'quote'
  | 'list'
  | 'highlight'
  | 'cta'
  | 'freeform';

export interface Slide {
  id: string;
  layout: SlideLayout;
  elements: SlideElement[];
  background?: string | null;
  backgroundImage?: string | null;
  backgroundPosition?: string;
}

// ─── Theme ──────────────────────────────────────────────────

export interface ThemeColors {
  background: string;
  backgroundSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  highlight: string;
  accent: string;
  divider: string;
  cardBackground: string;
  highlightSoft: string;
  highlightBorder: string;
  iconColor: string;
  iconColorAlt: string;
}

export interface TypographyStyle {
  family: string;
  weight: number;
}

export interface ThemeTypography {
  heading: TypographyStyle;
  paragraph: TypographyStyle;
  subtitle: TypographyStyle;
  tag: TypographyStyle;
  quote: TypographyStyle;
  stat: TypographyStyle;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  fontScale: number;
}

// ─── Full Schema ────────────────────────────────────────────

export interface CarouselSchema {
  $schema?: string;
  version: number;
  generator?: string;
  generatorVersion?: string;
  createdAt: string;
  updatedAt: string;

  id: string;
  title: string;
  description?: string;
  tags?: string[];
  format: 'carousel' | 'single-post';

  canvas: {
    width: number;
    height: number;
  };

  header: {
    handle: string;
    showCounter: boolean;
  };

  footer: {
    text: string;
    style: 'uppercase' | 'normal';
  };

  theme: Theme;
  slides: Slide[];

  // Forward compatibility: preserve unknown fields
  [key: string]: unknown;
}

// ─── Defaults ───────────────────────────────────────────────

export const DEFAULT_THEME_DARK: Theme = {
  name: 'Dark',
  colors: {
    background: '#0a0e1a',
    backgroundSubtle: '#111827',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    highlight: '#fbbf24',
    accent: '#f59e0b',
    divider: '#1e293b',
    cardBackground: '#0f172a',
    highlightSoft: 'rgba(251,191,36,0.10)',
    highlightBorder: 'rgba(251,191,36,0.25)',
    iconColor: '#fbbf24',
    iconColorAlt: '#f59e0b',
  },
  typography: {
    heading: { family: 'Archivo', weight: 700 },
    paragraph: { family: 'Archivo', weight: 400 },
    subtitle: { family: 'Archivo', weight: 500 },
    tag: { family: 'Archivo', weight: 700 },
    quote: { family: 'Archivo', weight: 500 },
    stat: { family: 'Archivo', weight: 900 },
  },
  fontScale: 1,
};

export const DEFAULT_THEME_LIGHT: Theme = {
  name: 'Light',
  colors: {
    background: '#ffffff',
    backgroundSubtle: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    highlight: '#f59e0b',
    accent: '#d97706',
    divider: '#e2e8f0',
    cardBackground: '#ffffff',
    highlightSoft: 'rgba(245,158,11,0.08)',
    highlightBorder: 'rgba(245,158,11,0.20)',
    iconColor: '#f59e0b',
    iconColorAlt: '#d97706',
  },
  typography: {
    heading: { family: 'Archivo', weight: 700 },
    paragraph: { family: 'Archivo', weight: 400 },
    subtitle: { family: 'Archivo', weight: 500 },
    tag: { family: 'Archivo', weight: 700 },
    quote: { family: 'Archivo', weight: 500 },
    stat: { family: 'Archivo', weight: 900 },
  },
  fontScale: 1,
};

export const SCHEMA_VERSION = 1;

export function createEmptySchema(id: string): CarouselSchema {
  const now = new Date().toISOString();
  return {
    $schema: 'https://carousel-editor.app/schema/v1.json',
    version: SCHEMA_VERSION,
    generator: 'carousel-editor',
    generatorVersion: '2.0.0',
    createdAt: now,
    updatedAt: now,
    id,
    title: 'Novo Carrossel',
    format: 'carousel',
    canvas: { width: 1080, height: 1440 },
    header: { handle: '@meuhandle', showCounter: true },
    footer: { text: 'MINHA MARCA', style: 'uppercase' },
    theme: DEFAULT_THEME_DARK,
    slides: [],
  };
}
