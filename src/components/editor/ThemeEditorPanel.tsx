'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
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
import type { Theme, ThemeColors, ThemeTypography } from '@/types/schema';
import { DEFAULT_THEME_DARK, DEFAULT_THEME_LIGHT } from '@/types/schema';
import { derivedColors } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';
import { getCustomThemes, saveCustomTheme, deleteCustomTheme } from '@/lib/custom-themes';
import type { CustomTheme } from '@/lib/db';

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
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');

  useEffect(() => {
    getCustomThemes().then(setCustomThemes);
  }, []);

  const handleSaveTheme = useCallback(async () => {
    if (!newThemeName.trim()) return;
    await saveCustomTheme({
      name: newThemeName.trim(),
      colors: theme.colors as unknown as Record<string, string>,
      typography: theme.typography as unknown as Record<string, { family: string; weight: number }>,
      fontScale: theme.fontScale,
      createdAt: new Date(),
    });
    setCustomThemes(await getCustomThemes());
    setSaveDialogOpen(false);
    setNewThemeName('');
  }, [newThemeName, theme]);

  const handleDeleteTheme = useCallback(async (name: string) => {
    await deleteCustomTheme(name);
    setCustomThemes(await getCustomThemes());
  }, []);

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
        <div className="mt-1.5 flex flex-col gap-2">
          <div className="flex gap-2">
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

          {/* Saved custom themes */}
          {customThemes.map((ct) => (
            <div key={ct.name} className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-start gap-2 text-xs h-8"
                onClick={() => onSetTheme({
                  name: ct.name,
                  colors: ct.colors as unknown as ThemeColors,
                  typography: ct.typography as unknown as ThemeTypography,
                  fontScale: ct.fontScale,
                  elementGap: theme.elementGap, // preserve current gap
                })}
              >
                <span className="inline-block size-3 rounded-sm border border-border/30" style={{ backgroundColor: ct.colors.background }} />
                <span className="inline-block size-3 rounded-sm border border-border/30" style={{ backgroundColor: ct.colors.highlight }} />
                {ct.name}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteTheme(ct.name)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}

          {/* Save current theme */}
          {saveDialogOpen ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="Nome do tema"
                className="h-7 flex-1 text-xs"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTheme(); if (e.key === 'Escape') setSaveDialogOpen(false); }}
              />
              <Button size="sm" className="h-7 text-xs" onClick={handleSaveTheme}>Salvar</Button>
              <Button variant="ghost" size="icon" className="size-7" onClick={() => setSaveDialogOpen(false)}>
                <X className="size-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs border-dashed h-8"
              onClick={() => setSaveDialogOpen(true)}
            >
              Salvar tema atual
            </Button>
          )}
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

      <Separator />

      {/* ── Element Gap ──────────────────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Espaçamento entre elementos</span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {theme.elementGap ?? 24}px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={80}
          step={2}
          value={theme.elementGap ?? 24}
          onChange={(e) => onSetTheme({ ...theme, elementGap: parseInt(e.target.value) })}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
      </section>

    </div>
  );
}
