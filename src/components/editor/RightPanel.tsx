'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  Type,
  Heading1,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalDistributeStart,
  AlignHorizontalDistributeEnd,
  AlignHorizontalJustifyCenter,
  AlignVerticalDistributeStart,
  AlignVerticalDistributeEnd,
  AlignVerticalJustifyCenter,
  Tag,
  Quote,
  Image,
  Layers,
  List,
  Highlighter,
  Minus,
  Space,
  Smile,
  GripVertical,
  Trash2,
  Upload,
  X,
  Paintbrush,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ThemeEditorPanel } from './ThemeEditorPanel';
import { GradientEditor } from './GradientEditor';
import type {
  Slide,
  SlideElement,
  Theme,
  ElementType,
  HeadingElement,
  ImageElement,
  EmojiElement,
  SpacerElement,
  OverlayElement,
  QuoteElement,
  ListItemElement,
  HighlightElement,
  DividerElement,
} from '@/types/schema';
import { cn } from '@/lib/utils';
import { useAssetContext } from '@/lib/asset-urls';
import { saveAsset } from '@/lib/projects';

export const BG_PSEUDO_ID = '__bg__';

const FONT_FAMILIES = [
  'Archivo',
  'Inter',
  'Space Grotesk',
  'DM Sans',
  'Poppins',
  'Montserrat',
  'Playfair Display',
  'Merriweather',
  'JetBrains Mono',
];

// ─── Props ──────────────────────────────────────────────────

interface RightPanelProps {
  slide: Slide;
  slideIndex: number;
  selectedElementId: string | null;
  theme: Theme;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (elementId: string, element: SlideElement) => void;
  onDeleteElement: (elementId: string) => void;
  onReorderElement?: (elementId: string, newIndex: number) => void;
  onChangeElementType?: (elementId: string, newType: ElementType, newLevel?: number) => void;
  onSetTheme: (theme: Theme) => void;
  onSetSlideBg: (color: string | undefined) => void;
  slideBgImage?: string;
  onSetSlideBgImage?: (src: string | undefined) => void;
  slideBgPosition?: string;
  onSetSlideBgPosition?: (pos: string | undefined) => void;
  projectId?: string;
}

// ─── Element type icon mapping ──────────────────────────────

const ELEMENT_ICONS: Record<ElementType, React.ComponentType<{ className?: string }>> = {
  tag: Tag,
  heading: Heading1,
  paragraph: AlignLeft,
  subtitle: Type,
  emoji: Smile,
  image: Image,
  overlay: Layers,
  quote: Quote,
  'list-item': List,
  highlight: Highlighter,
  divider: Minus,
  spacer: Space,
};

const ELEMENT_TYPE_LABELS: Record<ElementType, string> = {
  tag: 'Tag',
  heading: 'Titulo',
  paragraph: 'Paragrafo',
  subtitle: 'Subtitulo',
  emoji: 'Emoji',
  image: 'Imagem',
  overlay: 'Overlay',
  quote: 'Citacao',
  'list-item': 'Item de Lista',
  highlight: 'Destaque',
  divider: 'Divisor',
  spacer: 'Espacador',
};

// ─── Get a text preview for an element ──────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function getElementPreview(el: SlideElement): string {
  if ('content' in el && typeof el.content === 'string') {
    const text = stripHtml(el.content);
    return text.length > 24 ? text.slice(0, 24) + '\u2026' : text || ELEMENT_TYPE_LABELS[el.type];
  }
  if (el.type === 'image') return (el as ImageElement).alt || (el as ImageElement).src.slice(0, 20) || 'Imagem';
  if (el.type === 'overlay') return 'Overlay';
  if (el.type === 'divider') return 'Divisor';
  if (el.type === 'spacer') return `${(el as SpacerElement).height}px`;
  return ELEMENT_TYPE_LABELS[el.type];
}

// ─── Number field helper ────────────────────────────────────

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
}: {
  label: string;
  value: number | undefined;
  onChange: (val: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-20 shrink-0 text-[11px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value ?? ''}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? undefined : Number(v));
        }}
        className="h-7 flex-1 font-mono text-xs"
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-20 shrink-0 text-[11px] text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 flex-1 text-xs"
      />
    </div>
  );
}

// ─── Section heading helper ─────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
      {children}
    </span>
  );
}

// ─── Text alignment buttons ─────────────────────────────────

function TextAlignButtons({
  value,
  onChange,
}: {
  value: 'left' | 'center' | 'right' | undefined;
  onChange: (align: 'left' | 'center' | 'right') => void;
}) {
  const current = value ?? 'center';
  return (
    <div className="flex items-center gap-2">
      <Label className="w-20 shrink-0 text-[11px] text-muted-foreground">Alinhamento</Label>
      <div className="flex gap-0.5">
        <Button
          variant={current === 'left' ? 'secondary' : 'ghost'}
          size="icon-xs"
          className="size-7"
          onClick={() => onChange('left')}
          title="Esquerda"
        >
          <AlignLeft className="size-3.5" />
        </Button>
        <Button
          variant={current === 'center' ? 'secondary' : 'ghost'}
          size="icon-xs"
          className="size-7"
          onClick={() => onChange('center')}
          title="Centro"
        >
          <AlignCenter className="size-3.5" />
        </Button>
        <Button
          variant={current === 'right' ? 'secondary' : 'ghost'}
          size="icon-xs"
          className="size-7"
          onClick={() => onChange('right')}
          title="Direita"
        >
          <AlignRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Color picker field helper ───────────────────────────────

function ColorPickerField({
  label,
  value,
  onChange,
  placeholder = '#000000',
}: {
  label: string;
  value: string | undefined;
  onChange: (val: string | undefined) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-20 shrink-0 text-[11px] text-muted-foreground">{label}</Label>
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border/50 bg-transparent p-0"
      />
      <Input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        className="h-7 flex-1 font-mono text-xs"
      />
    </div>
  );
}

// ─── Slider field helper ─────────────────────────────────────

function SliderField({
  label,
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  suffix = '',
}: {
  label: string;
  value: number | undefined;
  defaultValue: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  const current = value ?? defaultValue;
  return (
    <div className="flex items-center gap-2">
      <Label className="w-20 shrink-0 text-[11px] text-muted-foreground">{label}</Label>
      <Slider
        value={[current]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="flex-1"
      />
      <span className="w-10 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
        {current}{suffix}
      </span>
    </div>
  );
}

// ─── Image Properties ────────────────────────────────────────

function ImageProperties({
  element,
  onUpdate,
  projectId,
}: {
  element: ImageElement;
  onUpdate: (el: SlideElement) => void;
  projectId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resolveUrl, registerAssetUrl } = useAssetContext();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const filename = `assets/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await saveAsset(projectId, filename, file);
    registerAssetUrl(filename, file);
    onUpdate({ ...element, src: filename } as SlideElement);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [element, onUpdate, registerAssetUrl]);

  const previewSrc = element.src ? resolveUrl(element.src) : undefined;

  return (
    <>
      {/* Upload / preview */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {previewSrc ? (
        <div className="relative overflow-hidden rounded-lg border border-border/50">
          <img
            src={previewSrc}
            alt={element.alt ?? ''}
            className="h-28 w-full object-cover"
            style={{ objectPosition: element.objectPosition }}
          />
          <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 flex-1 text-[10px] text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3 mr-1" />
              Trocar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] text-white/80 hover:text-red-400 hover:bg-white/10"
              onClick={() => onUpdate({ ...element, src: '' } as SlideElement)}
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 text-xs border-dashed"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-3.5" />
          Fazer upload
        </Button>
      )}

      {/* Alt text */}
      <TextField
        label="Alt"
        value={element.alt ?? ''}
        onChange={(v) => onUpdate({ ...element, alt: v } as SlideElement)}
        placeholder="Descrição"
      />

      {/* Border Radius */}
      <div className="flex items-center gap-2">
        <Label className="w-20 shrink-0 text-[11px] text-muted-foreground">Borda</Label>
        <Slider
          value={[element.borderRadius ?? 16]}
          onValueChange={([v]) => onUpdate({ ...element, borderRadius: v } as SlideElement)}
          min={0}
          max={50}
          step={1}
          className="flex-1"
        />
        <span className="w-8 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
          {element.borderRadius ?? 16}
        </span>
      </div>

      {/* Hint: double-click image to reposition */}
      {element.src && (
        <p className="text-[10px] text-muted-foreground/60 italic">
          Duplo-clique na imagem para reposicionar
        </p>
      )}
    </>
  );
}

// ─── Slide Background (fixed at bottom of Elementos tab) ────

type BgMode = 'theme' | 'solid' | 'gradient' | 'image';

function detectBgMode(bg?: string | null, bgImage?: string | null): BgMode {
  if (bgImage) return 'image';
  if (!bg) return 'theme';
  if (bg.includes('gradient(')) return 'gradient';
  return 'solid';
}

const BG_GRADIENT_PRESETS = [
  { label: 'Amanhecer', fill: 'linear-gradient(to bottom, #ff9a9e 0%, #fecfef 100%)' },
  { label: 'Oceano', fill: 'linear-gradient(to bottom, #667eea 0%, #764ba2 100%)' },
  { label: 'Floresta', fill: 'linear-gradient(to bottom, #134e5e 0%, #71b280 100%)' },
  { label: 'Noite', fill: 'linear-gradient(to bottom, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { label: 'Quente', fill: 'linear-gradient(to bottom right, #f093fb 0%, #f5576c 100%)' },
  { label: 'Frio', fill: 'linear-gradient(to bottom, #a8c0ff 0%, #3f2b96 100%)' },
];

function SlideBackgroundSection({
  theme,
  slideBg,
  onSetSlideBg,
  slideBgImage,
  onSetSlideBgImage,
  slideBgPosition,
  onSetSlideBgPosition,
  projectId,
}: {
  theme: Theme;
  slideBg?: string | null;
  onSetSlideBg: (color: string | undefined) => void;
  slideBgImage?: string;
  onSetSlideBgImage: (src: string | undefined) => void;
  slideBgPosition?: string;
  onSetSlideBgPosition: (pos: string | undefined) => void;
  projectId: string;
}) {
  const { resolveUrl, registerAssetUrl } = useAssetContext();
  const bgFileRef = useRef<HTMLInputElement>(null);
  const detectedMode = detectBgMode(slideBg, slideBgImage);
  const [userMode, setUserMode] = useState<BgMode | null>(null);
  const mode = userMode ?? detectedMode;

  const handleModeChange = useCallback((newMode: BgMode) => {
    setUserMode(newMode);
    switch (newMode) {
      case 'theme':
        onSetSlideBg(undefined);
        onSetSlideBgImage(undefined);
        break;
      case 'solid':
        onSetSlideBgImage(undefined);
        if (!slideBg || slideBg.includes('gradient(')) {
          onSetSlideBg(theme.colors.background);
        }
        break;
      case 'gradient':
        onSetSlideBgImage(undefined);
        if (!slideBg || !slideBg.includes('gradient(')) {
          onSetSlideBg(BG_GRADIENT_PRESETS[0].fill);
        }
        break;
      case 'image':
        // Don't clear other fields yet — user still needs to upload
        break;
    }
  }, [slideBg, theme.colors.background, onSetSlideBg, onSetSlideBgImage]);

  const handleBgFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const filename = `assets/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await saveAsset(projectId, filename, file);
    registerAssetUrl(filename, file);
    onSetSlideBgImage(filename);
    if (bgFileRef.current) bgFileRef.current.value = '';
  }, [projectId, registerAssetUrl, onSetSlideBgImage]);

  const resolvedBgSrc = slideBgImage ? resolveUrl(slideBgImage) : null;

  // Determine the visual preview swatch
  const previewBg = mode === 'theme' ? theme.colors.background
    : mode === 'image' ? undefined
    : slideBg ?? theme.colors.background;

  return (
    <div className="space-y-2">
      <input ref={bgFileRef} type="file" accept="image/*" onChange={handleBgFileUpload} className="hidden" />

      <SectionLabel>Propriedades — Fundo</SectionLabel>

      {/* Mode buttons */}
      <div className="flex gap-0.5">
        {([
          { m: 'theme' as BgMode, l: 'Tema' },
          { m: 'solid' as BgMode, l: 'Cor' },
          { m: 'gradient' as BgMode, l: 'Gradiente' },
          { m: 'image' as BgMode, l: 'Imagem' },
        ]).map(({ m, l }) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeChange(m)}
            className={cn(
              'flex-1 rounded px-1 py-1 text-[10px] font-medium transition-colors',
              mode === m
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Mode content */}
      {mode === 'solid' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(slideBg && !slideBg.includes('gradient(')) ? slideBg : theme.colors.background}
            onChange={(e) => onSetSlideBg(e.target.value)}
            className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border/50 bg-transparent p-0"
          />
          <Input
            value={(slideBg && !slideBg.includes('gradient(')) ? slideBg : theme.colors.background}
            onChange={(e) => onSetSlideBg(e.target.value)}
            className="h-7 flex-1 font-mono text-xs"
          />
        </div>
      )}

      {mode === 'gradient' && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1">
            {BG_GRADIENT_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={cn(
                  'size-7 rounded-md border transition-transform hover:scale-110',
                  slideBg === p.fill ? 'border-primary ring-1 ring-primary' : 'border-border/50'
                )}
                style={{ background: p.fill }}
                title={p.label}
                onClick={() => onSetSlideBg(p.fill)}
              />
            ))}
          </div>
          <GradientEditor
            value={slideBg?.includes('gradient(') ? slideBg : BG_GRADIENT_PRESETS[0].fill}
            onChange={(css) => onSetSlideBg(css)}
            presets={BG_GRADIENT_PRESETS}
            category="background"
          />
        </div>
      )}

      {mode === 'image' && (
        <div className="space-y-2">
          {resolvedBgSrc ? (
            <div className="relative overflow-hidden rounded-lg border border-border/50">
              <img
                src={resolvedBgSrc}
                alt="Fundo"
                className="h-20 w-full object-cover"
                style={{ objectPosition: slideBgPosition ?? 'center' }}
              />
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-1 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 flex-1 text-[10px] text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => bgFileRef.current?.click()}
                >
                  <Upload className="size-2.5 mr-0.5" />
                  Trocar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[10px] text-white/80 hover:text-red-400 hover:bg-white/10"
                  onClick={() => onSetSlideBgImage(undefined)}
                >
                  <X className="size-2.5" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs border-dashed"
              onClick={() => bgFileRef.current?.click()}
            >
              <Upload className="size-3.5" />
              Escolher imagem
            </Button>
          )}

          {/* Hint: double-click slide to reposition background image */}
          {resolvedBgSrc && (
            <p className="text-[10px] text-muted-foreground/60 italic">
              Duplo-clique no slide para reposicionar
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Default font sizes from slide.css ──────────────────────

const DEFAULT_FONT_SIZES: Record<string, number> = {
  tag: 22,
  h1: 72,
  h2: 56,
  h3: 44,
  paragraph: 38,
  subtitle: 32,
  quote: 46,
  'list-item': 36,
  highlight: 38,
};

function getDefaultFontSize(type: string, level?: number): number {
  if (type === 'heading') return DEFAULT_FONT_SIZES[`h${level ?? 1}`] ?? 72;
  return DEFAULT_FONT_SIZES[type] ?? 38;
}

// Type conversion options for the element type dropdown
const CONVERTIBLE_TYPES = [
  { value: 'tag', label: 'Tag' },
  { value: 'h1', label: 'H1 — Grande' },
  { value: 'h2', label: 'H2 — Médio' },
  { value: 'h3', label: 'H3 — Pequeno' },
  { value: 'paragraph', label: 'Parágrafo' },
  { value: 'subtitle', label: 'Subtítulo' },
];

function getTypeSelectValue(type: string, level?: number): string {
  if (type === 'heading') return `h${level ?? 1}`;
  return type;
}

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1440;

// ─── Element Properties Panel ───────────────────────────────

function ElementProperties({
  element,
  isFreeform,
  onUpdate,
  onChangeType,
  projectId,
}: {
  element: SlideElement;
  isFreeform: boolean;
  onUpdate: (el: SlideElement) => void;
  onChangeType?: (newType: string, newLevel?: number) => void;
  projectId: string;
}) {
  const set = useCallback(
    <K extends keyof SlideElement>(key: K, value: SlideElement[K]) => {
      onUpdate({ ...element, [key]: value } as SlideElement);
    },
    [element, onUpdate]
  );

  const isTextElement = [
    'heading', 'paragraph', 'subtitle', 'tag', 'quote', 'highlight', 'list-item',
  ].includes(element.type);

  // Determine if this element type can be converted
  const isConvertible = ['heading', 'paragraph', 'subtitle', 'tag'].includes(element.type);

  const headingLevel = element.type === 'heading' ? (element as HeadingElement).level : undefined;
  const defaultFontSize = getDefaultFontSize(element.type, headingLevel);

  return (
    <div className="space-y-2.5">
      <SectionLabel>
        Propriedades — {ELEMENT_TYPE_LABELS[element.type]}
      </SectionLabel>

      {/* ── Element type conversion (convertible text elements) ── */}
      {isConvertible && onChangeType && (
        <div className="flex items-center gap-2">
          <Label className="w-20 shrink-0 text-[11px] text-muted-foreground">Tipo</Label>
          <Select
            value={getTypeSelectValue(element.type, headingLevel)}
            onValueChange={(v) => {
              if (v.startsWith('h')) {
                onChangeType('heading', Number(v[1]));
              } else {
                onChangeType(v);
              }
            }}
          >
            <SelectTrigger size="sm" className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONVERTIBLE_TYPES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── Text alignment (all text elements) ── */}
      {isTextElement && (
        <TextAlignButtons
          value={element.textAlign}
          onChange={(align) => set('textAlign' as keyof SlideElement, align as never)}
        />
      )}

      {/* ── Common text properties ── */}
      {isTextElement && (
        <>
          <SliderField
            label="Fonte"
            value={element.fontSize}
            defaultValue={defaultFontSize}
            onChange={(v) => onUpdate({ ...element, fontSize: v } as SlideElement)}
            min={8}
            max={200}
            suffix="px"
          />
          <NumberField
            label="Margem sup."
            value={element.marginTop}
            onChange={(v) => set('marginTop' as keyof SlideElement, v as never)}
            min={-200}
            max={200}
            placeholder="0"
          />
          <NumberField
            label="Margem inf."
            value={element.marginBottom}
            onChange={(v) => set('marginBottom' as keyof SlideElement, v as never)}
            min={-200}
            max={200}
            placeholder="0"
          />

          {/* Font family */}
          <div className="flex items-center gap-2">
            <Label className="w-20 shrink-0 text-[11px] text-muted-foreground">Família</Label>
            <Select
              value={element.fontFamily ?? '__default__'}
              onValueChange={(v) =>
                onUpdate({ ...element, fontFamily: v === '__default__' ? undefined : v } as SlideElement)
              }
            >
              <SelectTrigger size="sm" className="h-7 w-full text-xs">
                <SelectValue placeholder="Padrão (tema)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__default__">Padrão (tema)</SelectItem>
                {FONT_FAMILIES.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font weight */}
          <div className="flex items-center gap-2">
            <Label className="w-20 shrink-0 text-[11px] text-muted-foreground">Peso</Label>
            <Select
              value={element.fontWeight != null ? String(element.fontWeight) : '__default__'}
              onValueChange={(v) =>
                onUpdate({ ...element, fontWeight: v === '__default__' ? undefined : Number(v) } as SlideElement)
              }
            >
              <SelectTrigger size="sm" className="h-7 w-full text-xs">
                <SelectValue placeholder="Padrão (tema)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__default__">Padrão (tema)</SelectItem>
                <SelectItem value="400">400 Regular</SelectItem>
                <SelectItem value="500">500 Medium</SelectItem>
                <SelectItem value="600">600 Semibold</SelectItem>
                <SelectItem value="700">700 Bold</SelectItem>
                <SelectItem value="800">800 Extra</SelectItem>
                <SelectItem value="900">900 Black</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <ColorPickerField
            label="Cor"
            value={element.color}
            onChange={(v) => onUpdate({ ...element, color: v } as SlideElement)}
          />

          {/* Opacity */}
          <SliderField
            label="Opacidade"
            value={element.opacity != null ? Math.round(element.opacity * 100) : 100}
            defaultValue={100}
            onChange={(v) => onUpdate({ ...element, opacity: v / 100 } as SlideElement)}
            min={0}
            max={100}
            suffix="%"
          />
        </>
      )}

      {/* ── Quote: attribution ── */}
      {element.type === 'quote' && (
        <>
          <TextField
            label="Atribuição"
            value={(element as QuoteElement).attribution ?? ''}
            onChange={(v) => onUpdate({ ...element, attribution: v || undefined } as SlideElement)}
            placeholder="Autor da citação"
          />
          <ColorPickerField
            label="Cor aspas"
            value={(element as QuoteElement).quoteMarkColor}
            onChange={(v) => onUpdate({ ...element, quoteMarkColor: v } as SlideElement)}
          />
          <SliderField
            label="Tam. aspas"
            value={(element as QuoteElement).quoteMarkSize}
            defaultValue={96}
            onChange={(v) => onUpdate({ ...element, quoteMarkSize: v } as SlideElement)}
            min={24}
            max={200}
            suffix="px"
          />
          <SliderField
            label="Opac. aspas"
            value={(element as QuoteElement).quoteMarkOpacity != null ? Math.round((element as QuoteElement).quoteMarkOpacity! * 100) : 100}
            defaultValue={100}
            onChange={(v) => onUpdate({ ...element, quoteMarkOpacity: v / 100 } as SlideElement)}
            min={0}
            max={100}
            suffix="%"
          />
        </>
      )}

      {/* ── List-item: icon ── */}
      {element.type === 'list-item' && (
        <>
          <TextField
            label="Ícone"
            value={(element as ListItemElement).icon ?? ''}
            onChange={(v) => onUpdate({ ...element, icon: v } as SlideElement)}
            placeholder="✓ ou URL"
          />
          <SliderField
            label="Tam. ícone"
            value={(element as ListItemElement).iconSize}
            defaultValue={48}
            onChange={(v) => onUpdate({ ...element, iconSize: v } as SlideElement)}
            min={16}
            max={96}
            suffix="px"
          />
          <ColorPickerField
            label="Cor ícone"
            value={(element as ListItemElement).iconColor}
            onChange={(v) => onUpdate({ ...element, iconColor: v } as SlideElement)}
          />
        </>
      )}

      {/* ── Highlight: extra controls ── */}
      {element.type === 'highlight' && (() => {
        const hl = element as HighlightElement;
        return (
          <>
            <ColorPickerField
              label="Fundo"
              value={hl.backgroundColor}
              onChange={(v) => onUpdate({ ...element, backgroundColor: v } as SlideElement)}
            />
            <ColorPickerField
              label="Borda"
              value={hl.borderColor}
              onChange={(v) => onUpdate({ ...element, borderColor: v } as SlideElement)}
            />
            <SliderField
              label="Arredond."
              value={hl.borderRadius}
              defaultValue={16}
              onChange={(v) => onUpdate({ ...element, borderRadius: v } as SlideElement)}
              min={0}
              max={50}
              suffix="px"
            />
            <SliderField
              label="Padding"
              value={hl.padding}
              defaultValue={32}
              onChange={(v) => onUpdate({ ...element, padding: v } as SlideElement)}
              min={8}
              max={80}
              suffix="px"
            />
          </>
        );
      })()}

      {/* ── Divider ── */}
      {element.type === 'divider' && (() => {
        const dv = element as DividerElement;
        return (
          <>
            <ColorPickerField
              label="Cor"
              value={dv.dividerColor}
              onChange={(v) => onUpdate({ ...element, dividerColor: v } as SlideElement)}
            />
            <SliderField
              label="Largura"
              value={dv.dividerWidth}
              defaultValue={80}
              onChange={(v) => onUpdate({ ...element, dividerWidth: v } as SlideElement)}
              min={20}
              max={1080}
              suffix="px"
            />
            <SliderField
              label="Espessura"
              value={dv.dividerHeight}
              defaultValue={3}
              onChange={(v) => onUpdate({ ...element, dividerHeight: v } as SlideElement)}
              min={1}
              max={20}
              suffix="px"
            />
            <SliderField
              label="Arredond."
              value={dv.borderRadius}
              defaultValue={2}
              onChange={(v) => onUpdate({ ...element, borderRadius: v } as SlideElement)}
              min={0}
              max={10}
              suffix="px"
            />
            <SliderField
              label="Opacidade"
              value={dv.dividerOpacity != null ? Math.round(dv.dividerOpacity * 100) : 100}
              defaultValue={100}
              onChange={(v) => onUpdate({ ...element, dividerOpacity: v / 100 } as SlideElement)}
              min={0}
              max={100}
              suffix="%"
            />
          </>
        );
      })()}

      {/* ── Image ── */}
      {element.type === 'image' && (
        <>
          <ImageProperties
            element={element as ImageElement}
            onUpdate={onUpdate}
            projectId={projectId}
          />
          {!isFreeform && (
            <SliderField
              label="Altura"
              value={(element as ImageElement).imageHeight}
              defaultValue={500}
              onChange={(v) => onUpdate({ ...element, imageHeight: v } as SlideElement)}
              min={100}
              max={1200}
              suffix="px"
            />
          )}
        </>
      )}

      {/* ── Emoji ── */}
      {element.type === 'emoji' && (
        <NumberField
          label="Tamanho"
          value={(element as EmojiElement).size ?? 96}
          onChange={(v) => onUpdate({ ...element, size: v ?? 96 } as SlideElement)}
          min={16}
          max={400}
        />
      )}

      {/* ── Spacer ── */}
      {element.type === 'spacer' && (
        <NumberField
          label="Altura"
          value={(element as SpacerElement).height}
          onChange={(v) => onUpdate({ ...element, height: v ?? 16 } as SlideElement)}
          min={4}
          max={400}
        />
      )}

      {/* ── Overlay ── */}
      {element.type === 'overlay' && (
        <div className="space-y-1">
          <SectionLabel>Gradiente</SectionLabel>
          <GradientEditor
            value={(element as OverlayElement).fill ?? 'transparent'}
            onChange={(newFill) => onUpdate({ ...element, fill: newFill } as SlideElement)}
            category="overlay"
          />
        </div>
      )}

      {/* ── Freeform positioning ── */}
      {isFreeform && (
        <>
          <Separator className="my-2" />

          <SectionLabel>Posição</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="X"
              value={element.x}
              onChange={(v) => set('x' as keyof SlideElement, v as never)}
            />
            <NumberField
              label="Y"
              value={element.y}
              onChange={(v) => set('y' as keyof SlideElement, v as never)}
            />
          </div>

          <SectionLabel>Tamanho</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="W"
              value={element.w}
              onChange={(v) => set('w' as keyof SlideElement, v as never)}
            />
            <NumberField
              label="H"
              value={element.h}
              onChange={(v) => set('h' as keyof SlideElement, v as never)}
            />
          </div>

          {/* Position alignment buttons (6-direction) */}
          <SectionLabel>Alinhar no slide</SectionLabel>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7"
              title="Esquerda"
              onClick={() => onUpdate({ ...element, x: 0 } as SlideElement)}
            >
              <AlignHorizontalDistributeStart className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7"
              title="Centro horizontal"
              onClick={() => {
                const w = element.w ?? 200;
                onUpdate({ ...element, x: Math.round((SLIDE_WIDTH - w) / 2) } as SlideElement);
              }}
            >
              <AlignHorizontalJustifyCenter className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7"
              title="Direita"
              onClick={() => {
                const w = element.w ?? 200;
                onUpdate({ ...element, x: SLIDE_WIDTH - w } as SlideElement);
              }}
            >
              <AlignHorizontalDistributeEnd className="size-3.5" />
            </Button>
            <div className="mx-1 w-px bg-border/50" />
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7"
              title="Topo"
              onClick={() => onUpdate({ ...element, y: 0 } as SlideElement)}
            >
              <AlignVerticalDistributeStart className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7"
              title="Centro vertical"
              onClick={() => {
                const h = element.h ?? 200;
                onUpdate({ ...element, y: Math.round((SLIDE_HEIGHT - h) / 2) } as SlideElement);
              }}
            >
              <AlignVerticalJustifyCenter className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-7"
              title="Fundo"
              onClick={() => {
                const h = element.h ?? 200;
                onUpdate({ ...element, y: SLIDE_HEIGHT - h } as SlideElement);
              }}
            >
              <AlignVerticalDistributeEnd className="size-3.5" />
            </Button>
          </div>

          <NumberField
            label="Rotação"
            value={element.rotation}
            onChange={(v) => set('rotation' as keyof SlideElement, v as never)}
          />
        </>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function RightPanel({
  slide,
  slideIndex: _slideIndex,
  selectedElementId,
  theme,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onReorderElement,
  onChangeElementType,
  onSetTheme,
  onSetSlideBg,
  slideBgImage,
  onSetSlideBgImage,
  slideBgPosition,
  onSetSlideBgPosition,
  projectId,
}: RightPanelProps) {
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const dragCounterRef = useRef(0);

  const isBgSelected = selectedElementId === BG_PSEUDO_ID;

  const selectedElement = useMemo(
    () => isBgSelected ? null : slide.elements.find((el) => el.id === selectedElementId) ?? null,
    [slide.elements, selectedElementId, isBgSelected]
  );

  const isFreeform = slide.layout === 'freeform';

  // Label for the bg pseudo-element row
  const bgModeLabel = useMemo(() => {
    const mode = detectBgMode(slide.background, slideBgImage);
    switch (mode) {
      case 'theme': return 'Tema';
      case 'solid': return 'Cor';
      case 'gradient': return 'Gradiente';
      case 'image': return 'Imagem';
    }
  }, [slide.background, slideBgImage]);

  const handleUpdateSelectedElement = useCallback(
    (el: SlideElement) => {
      if (selectedElementId) {
        onUpdateElement(selectedElementId, el);
      }
    },
    [selectedElementId, onUpdateElement]
  );

  return (
    <Tabs defaultValue="elementos" className="flex h-full flex-col">
      <TabsList className="mx-3 mt-3 w-auto shrink-0">
        <TabsTrigger value="elementos" className="flex-1 text-xs">
          Elementos
        </TabsTrigger>
        <TabsTrigger value="tema" className="flex-1 text-xs">
          Tema
        </TabsTrigger>
      </TabsList>

      {/* ── Elementos Tab ──────────────────────────────────── */}
      <TabsContent value="elementos" className="mt-0 flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-3">
            {/* Element list */}
            {slide.elements.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs text-muted-foreground">
                Nenhum elemento neste slide.
              </p>
            ) : (
              // Freeform: reverse order (last in array = visually on top = first in list, like a layer panel)
              // Flow layout: array order matches visual order (top of slide = first in array = first in list)
              (slide.layout === 'freeform' ? [...slide.elements].reverse() : slide.elements).map((el, displayIdx) => {
                const Icon = ELEMENT_ICONS[el.type];
                const isSelected = el.id === selectedElementId;
                const isFreeform = slide.layout === 'freeform';

                return (
                  <div
                    key={el.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', el.id);
                      setDragElementId(el.id);
                    }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setDropTargetId(el.id); }}
                    onDragLeave={() => { dragCounterRef.current--; if (dragCounterRef.current === 0) setDropTargetId(null); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      dragCounterRef.current = 0;
                      const draggedId = e.dataTransfer.getData('text/plain');
                      if (draggedId && draggedId !== el.id && onReorderElement) {
                        // Convert display position to array index
                        const arrayIdx = isFreeform
                          ? slide.elements.length - 1 - displayIdx  // reversed list → convert back
                          : displayIdx;                              // direct mapping
                        onReorderElement(draggedId, arrayIdx);
                      }
                      setDragElementId(null);
                      setDropTargetId(null);
                    }}
                    onDragEnd={() => { dragCounterRef.current = 0; setDragElementId(null); setDropTargetId(null); }}
                    className={cn(
                      'element-row group flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-md transition-all',
                      isSelected && 'bg-accent/50 ring-1 ring-accent/30',
                      dragElementId === el.id && 'opacity-40',
                      dropTargetId === el.id && dragElementId !== el.id && 'ring-2 ring-primary/50 bg-primary/5',
                    )}
                    onClick={() => onSelectElement(el.id)}
                  >
                    <GripVertical className="size-3 shrink-0 cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing" />
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-xs">
                      {getElementPreview(el)}
                    </span>

                    {/* Delete button on hover */}
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement(el.id);
                        }}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Background pseudo-element — always last (bottom of z-stack), no action buttons */}
            <div
              className={cn(
                'element-row group flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer',
                isBgSelected && 'selected'
              )}
              onClick={() => onSelectElement(BG_PSEUDO_ID)}
            >
              <Paintbrush className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-xs">Fundo</span>
              <span className="shrink-0 text-[10px] text-muted-foreground/50">
                {bgModeLabel}
              </span>
            </div>

            {/* Background properties (when bg pseudo-element is selected) */}
            {isBgSelected && (
              <>
                <Separator className="my-3" />
                <SlideBackgroundSection
                  theme={theme}
                  slideBg={slide.background}
                  onSetSlideBg={onSetSlideBg}
                  slideBgImage={slideBgImage}
                  onSetSlideBgImage={onSetSlideBgImage ?? (() => {})}
                  slideBgPosition={slideBgPosition}
                  onSetSlideBgPosition={onSetSlideBgPosition ?? (() => {})}
                  projectId={projectId ?? ''}
                />
              </>
            )}

            {/* Element properties */}
            {selectedElement && (
              <>
                <Separator className="my-3" />
                <ElementProperties
                  element={selectedElement}
                  isFreeform={isFreeform}
                  onUpdate={handleUpdateSelectedElement}
                  onChangeType={
                    onChangeElementType && selectedElementId
                      ? (newType: string, newLevel?: number) =>
                          onChangeElementType(selectedElementId, newType as ElementType, newLevel)
                      : undefined
                  }
                  projectId={projectId ?? ''}
                />
              </>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* ── Tema Tab ───────────────────────────────────────── */}
      <TabsContent value="tema" className="mt-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <ThemeEditorPanel
            theme={theme}
            onSetTheme={onSetTheme}
          />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
