'use client';

import { useCallback } from 'react';
import { Check } from 'lucide-react';
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
import type { Theme, ThemeColors } from '@/types/schema';
import { DEFAULT_THEME_DARK, DEFAULT_THEME_LIGHT } from '@/types/schema';
import { derivedColors } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';

// ─── Constants ──────────────────────────────────────────────

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
] as const;

const WEIGHT_OPTIONS = [
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra' },
  { value: 900, label: 'Black' },
] as const;

const TYPOGRAPHY_CATEGORIES: Array<{
  key: keyof Theme['typography'];
  label: string;
}> = [
  { key: 'heading', label: 'Titulo' },
  { key: 'paragraph', label: 'Paragrafo' },
  { key: 'subtitle', label: 'Subtitulo' },
  { key: 'tag', label: 'Tag' },
  { key: 'quote', label: 'Citacao' },
  { key: 'stat', label: 'Estatistica' },
];

const PRESETS: Array<{ theme: Theme; label: string }> = [
  { theme: DEFAULT_THEME_DARK, label: 'Escuro' },
  { theme: DEFAULT_THEME_LIGHT, label: 'Claro' },
];

// ─── Props ──────────────────────────────────────────────────

interface ThemeEditorPanelProps {
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
}

// ─── Helpers ────────────────────────────────────────────────

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-24 shrink-0 text-xs text-muted-foreground">{label}</Label>
      <input
        type="color"
        value={value.startsWith('#') ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded border border-border/50 bg-transparent p-0"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 flex-1 font-mono text-xs"
      />
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────

export function ThemeEditorPanel({
  theme,
  onSetTheme,
}: ThemeEditorPanelProps) {
  // Update a color and auto-derive related colors
  const updateColor = useCallback(
    (key: keyof ThemeColors, value: string) => {
      const newColors: ThemeColors = { ...theme.colors, [key]: value };
      const derived = derivedColors(newColors);
      onSetTheme({
        ...theme,
        name: 'Custom',
        colors: { ...newColors, ...derived },
      });
    },
    [theme, onSetTheme]
  );

  // Update typography for a specific category
  const updateTypography = useCallback(
    (key: keyof Theme['typography'], field: 'family' | 'weight', value: string | number) => {
      onSetTheme({
        ...theme,
        name: 'Custom',
        typography: {
          ...theme.typography,
          [key]: {
            ...theme.typography[key],
            [field]: value,
          },
        },
      });
    },
    [theme, onSetTheme]
  );

  // Update font scale
  const updateFontScale = useCallback(
    (scale: number) => {
      onSetTheme({ ...theme, fontScale: scale });
    },
    [theme, onSetTheme]
  );

  return (
    <div className="space-y-5 p-3">
      {/* ── Theme Presets ──────────────────────────────────── */}
      <section>
        <Label className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Presets
        </Label>
        <div className="mt-1.5 flex gap-2">
          {PRESETS.map(({ theme: preset, label }) => {
            const isActive = theme.name === preset.name;
            return (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className={cn(
                  'relative flex-1 justify-start gap-2',
                  isActive && 'border-primary/50 bg-primary/10'
                )}
                onClick={() => onSetTheme(preset)}
              >
                {/* Color swatches */}
                <span
                  className="inline-block size-3 rounded-sm border border-border/30"
                  style={{ backgroundColor: preset.colors.background }}
                />
                <span
                  className="inline-block size-3 rounded-sm border border-border/30"
                  style={{ backgroundColor: preset.colors.highlight }}
                />
                <span className="text-xs">{label}</span>
                {isActive && <Check className="ml-auto size-3 text-primary" />}
              </Button>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* ── Colors ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cores
        </Label>

        {/* Base */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Base
          </span>
          <ColorInput
            label="Fundo"
            value={theme.colors.background}
            onChange={(v) => updateColor('background', v)}
          />
          <ColorInput
            label="Titulos"
            value={theme.colors.text}
            onChange={(v) => updateColor('text', v)}
          />
          <ColorInput
            label="Corpo"
            value={theme.colors.textSecondary}
            onChange={(v) => updateColor('textSecondary', v)}
          />
        </div>

        {/* Destaque */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Destaque
          </span>
          <ColorInput
            label="Principal"
            value={theme.colors.highlight}
            onChange={(v) => updateColor('highlight', v)}
          />
          <ColorInput
            label="Secundario"
            value={theme.colors.accent}
            onChange={(v) => updateColor('accent', v)}
          />
        </div>

        {/* Sutis */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Sutis
          </span>
          <ColorInput
            label="Header/Footer"
            value={theme.colors.textMuted}
            onChange={(v) => updateColor('textMuted', v)}
          />
        </div>
      </section>

      <Separator />

      {/* ── Typography ─────────────────────────────────────── */}
      <section className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tipografia
        </Label>

        {TYPOGRAPHY_CATEGORIES.map(({ key, label }) => {
          const style = theme.typography[key];
          return (
            <div key={key} className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                {label}
              </span>

              {/* Font family */}
              <Select
                value={style.family}
                onValueChange={(v) => updateTypography(key, 'family', v)}
              >
                <SelectTrigger size="sm" className="h-7 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font} value={font} className="text-xs">
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Weight buttons */}
              <div className="flex gap-0.5">
                {WEIGHT_OPTIONS.map(({ value, label: wLabel }) => (
                  <button
                    key={value}
                    type="button"
                    className={cn(
                      'flex-1 rounded px-1 py-0.5 text-xs font-medium transition-colors',
                      style.weight === value
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50'
                    )}
                    onClick={() => updateTypography(key, 'weight', value)}
                  >
                    {wLabel}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <Separator />

      {/* ── Font Scale ─────────────────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Escala de Fonte
          </Label>
          <span className="font-mono text-xs text-muted-foreground">
            {theme.fontScale.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0.7}
          max={1.3}
          step={0.05}
          value={theme.fontScale}
          onChange={(e) => updateFontScale(parseFloat(e.target.value))}
          className="h-2 w-full cursor-pointer accent-primary"
        />
      </section>

    </div>
  );
}
