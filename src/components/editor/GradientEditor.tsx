'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────

interface GradientEditorProps {
  value: string;
  onChange: (cssValue: string) => void;
  presets?: Array<{ label: string; fill: string }>;
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface GradientStop {
  id: string;
  color: RGBA;
  position: number; // 0-100
}

interface GradientState {
  type: 'linear' | 'radial';
  angle: number;
  radialPosition: string;
  stops: GradientStop[];
}

// ─── Constants ───────────────────────────────────────────────────

const DIRECTION_PRESETS: { label: string; angle: number }[] = [
  { label: '↑', angle: 0 },
  { label: '↗', angle: 45 },
  { label: '→', angle: 90 },
  { label: '↘', angle: 135 },
  { label: '↓', angle: 180 },
  { label: '↙', angle: 225 },
  { label: '←', angle: 270 },
  { label: '↖', angle: 315 },
];

const RADIAL_PRESETS: { label: string; value: string }[] = [
  { label: 'Centro', value: 'center' },
  { label: '↖', value: 'top left' },
  { label: '↑', value: 'top' },
  { label: '↗', value: 'top right' },
  { label: '←', value: 'left' },
  { label: '→', value: 'right' },
  { label: '↙', value: 'bottom left' },
  { label: '↓', value: 'bottom' },
  { label: '↘', value: 'bottom right' },
];

const OVERLAY_PRESETS = [
  { label: '⬛ Escuro', fill: 'rgba(0,0,0,0.6)' },
  { label: '⬛ Muito escuro', fill: 'rgba(0,0,0,0.85)' },
  { label: '🔽 Gradiente ↓', fill: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)' },
  { label: '🔼 Gradiente ↑', fill: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.7) 100%)' },
  { label: '🔽 Gradiente suave', fill: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.5) 100%)' },
  { label: '🟢 Verde escuro', fill: 'linear-gradient(to bottom, transparent 0%, rgba(0,40,0,0.7) 100%)' },
  { label: '🔵 Azul escuro', fill: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,40,0.7) 100%)' },
  { label: '⬜ Transparente', fill: 'transparent' },
];

// Checkerboard CSS for transparent visibility
const CHECKERBOARD_STYLE = {
  backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
};

// ─── Helpers ─────────────────────────────────────────────────────

let _stopIdCounter = 0;
function newStopId(): string {
  return `stop-${++_stopIdCounter}-${Date.now()}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function rgbaToHex(c: RGBA): string {
  const r = clamp(Math.round(c.r), 0, 255).toString(16).padStart(2, '0');
  const g = clamp(Math.round(c.g), 0, 255).toString(16).padStart(2, '0');
  const b = clamp(Math.round(c.b), 0, 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbaToCSS(c: RGBA): string {
  if (c.a === 0 && c.r === 0 && c.g === 0 && c.b === 0) return 'transparent';
  const r = clamp(Math.round(c.r), 0, 255);
  const g = clamp(Math.round(c.g), 0, 255);
  const b = clamp(Math.round(c.b), 0, 255);
  const a = Math.round(c.a * 100) / 100;
  if (a === 1) return `rgb(${r},${g},${b})`;
  return `rgba(${r},${g},${b},${a})`;
}

function directionToAngle(dir: string): number {
  const map: Record<string, number> = {
    'to top': 0, 'to top right': 45, 'to right': 90, 'to bottom right': 135,
    'to bottom': 180, 'to bottom left': 225, 'to left': 270, 'to top left': 315,
  };
  return map[dir.trim()] ?? 180;
}

function angleToDirection(angle: number): string | null {
  const map: Record<number, string> = {
    0: 'to top', 45: 'to top right', 90: 'to right', 135: 'to bottom right',
    180: 'to bottom', 225: 'to bottom left', 270: 'to left', 315: 'to top left',
  };
  return map[angle] ?? null;
}

function parseColorString(raw: string): RGBA {
  const s = raw.trim();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const rgbaMatch = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]), g: parseInt(rgbaMatch[2]), b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }
  const hexRgb = hexToRgb(s);
  if (hexRgb) return { ...hexRgb, a: 1 };
  if (s === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  if (s === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  return { r: 0, g: 0, b: 0, a: 0.5 };
}

function splitStops(stopsStr: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of stopsStr) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseStopString(raw: string): { color: RGBA; position: number | null } {
  const s = raw.trim();
  const posMatch = s.match(/\s+([\d.]+)%\s*$/);
  const position = posMatch ? parseFloat(posMatch[1]) : null;
  const colorStr = posMatch ? s.slice(0, s.length - posMatch[0].length).trim() : s;
  return { color: parseColorString(colorStr), position };
}

function parseCSSGradient(css: string): GradientState {
  const s = css.trim();
  const defaultState: GradientState = {
    type: 'linear', angle: 180, radialPosition: 'center',
    stops: [
      { id: newStopId(), color: { r: 0, g: 0, b: 0, a: 0 }, position: 0 },
      { id: newStopId(), color: { r: 0, g: 0, b: 0, a: 0.7 }, position: 100 },
    ],
  };

  if (!s.includes('gradient(')) {
    const color = parseColorString(s);
    return {
      type: 'linear', angle: 180, radialPosition: 'center',
      stops: [
        { id: newStopId(), color: { ...color }, position: 0 },
        { id: newStopId(), color: { ...color }, position: 100 },
      ],
    };
  }

  const isRadial = s.startsWith('radial-gradient(');
  const isLinear = s.startsWith('linear-gradient(');
  if (!isRadial && !isLinear) return defaultState;

  const openParen = s.indexOf('(');
  const closeParen = s.lastIndexOf(')');
  if (openParen === -1 || closeParen === -1) return defaultState;
  const inner = s.slice(openParen + 1, closeParen);
  const parts = splitStops(inner);
  if (parts.length < 2) return defaultState;

  let angle = 180;
  let radialPosition = 'center';
  let stopStrings: string[];

  if (isLinear) {
    const first = parts[0].trim();
    const angleMatch = first.match(/^(\d+(?:\.\d+)?)deg$/);
    const dirMatch = first.match(/^to\s+(top|bottom|left|right)(?:\s+(top|bottom|left|right))?$/);
    if (angleMatch) { angle = parseFloat(angleMatch[1]); stopStrings = parts.slice(1); }
    else if (dirMatch) { angle = directionToAngle(first); stopStrings = parts.slice(1); }
    else { stopStrings = parts; }
  } else {
    const first = parts[0].trim();
    const atMatch = first.match(/(?:circle|ellipse)?\s*at\s+(.+)/);
    if (atMatch) { radialPosition = atMatch[1].trim(); stopStrings = parts.slice(1); }
    else if (first.match(/^(center|top|bottom|left|right)/)) { radialPosition = first; stopStrings = parts.slice(1); }
    else { stopStrings = parts; }
  }

  const stops: GradientStop[] = stopStrings.map((str, idx) => {
    const { color, position } = parseStopString(str);
    return { id: newStopId(), color, position: position ?? (idx / Math.max(stopStrings.length - 1, 1)) * 100 };
  });

  if (stops.length < 2) {
    stops.push({ id: newStopId(), color: { r: 0, g: 0, b: 0, a: 0 }, position: 100 });
  }

  return { type: isRadial ? 'radial' : 'linear', angle, radialPosition, stops };
}

function gradientToCSS(state: GradientState): string {
  const stopsCSS = state.stops
    .slice().sort((a, b) => a.position - b.position)
    .map((stop) => `${rgbaToCSS(stop.color)} ${Math.round(stop.position)}%`)
    .join(', ');

  if (state.type === 'radial') {
    return `radial-gradient(circle at ${state.radialPosition}, ${stopsCSS})`;
  }
  const dir = angleToDirection(state.angle);
  const dirStr = dir ?? `${Math.round(state.angle)}deg`;
  return `linear-gradient(${dirStr}, ${stopsCSS})`;
}

// ─── Component ───────────────────────────────────────────────────

export function GradientEditor({ value, onChange, presets }: GradientEditorProps) {
  const [state, setState] = useState<GradientState>(() => parseCSSGradient(value));
  const [selectedStopId, setSelectedStopId] = useState<string | null>(
    () => state.stops[0]?.id ?? null,
  );
  const [showCSS, setShowCSS] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<string | null>(null);

  // Sync when value prop changes externally
  const lastEmittedRef = useRef(value);
  useEffect(() => {
    if (value !== lastEmittedRef.current) {
      const parsed = parseCSSGradient(value);
      setState(parsed);
      setSelectedStopId(parsed.stops[0]?.id ?? null);
      lastEmittedRef.current = value;
    }
  }, [value]);

  // Track pending emission — avoids calling onChange during render
  const pendingEmitRef = useRef<string | null>(null);

  useEffect(() => {
    if (pendingEmitRef.current !== null) {
      const css = pendingEmitRef.current;
      pendingEmitRef.current = null;
      lastEmittedRef.current = css;
      onChange(css);
    }
  });

  const updateState = useCallback(
    (updater: (prev: GradientState) => GradientState) => {
      setState((prev) => {
        const next = updater(prev);
        const css = gradientToCSS(next);
        pendingEmitRef.current = css;
        return next;
      });
    },
    [],
  );

  const selectedStop = useMemo(
    () => state.stops.find((s) => s.id === selectedStopId) ?? null,
    [state.stops, selectedStopId],
  );

  const barGradientCSS = useMemo(() => {
    const sorted = state.stops.slice().sort((a, b) => a.position - b.position);
    const stopsStr = sorted.map((s) => `${rgbaToCSS(s.color)} ${s.position}%`).join(', ');
    return `linear-gradient(to right, ${stopsStr})`;
  }, [state.stops]);

  const fullPreviewCSS = useMemo(() => gradientToCSS(state), [state]);

  // ── Drag handling ──
  const getPositionFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!barRef.current) return 50;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return clamp((x / rect.width) * 100, 0, 100);
  }, []);

  const handleBarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).dataset.stopId) return;
      const pos = getPositionFromEvent(e);
      const sorted = state.stops.slice().sort((a, b) => a.position - b.position);
      let leftStop = sorted[0];
      let rightStop = sorted[sorted.length - 1];
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].position <= pos && sorted[i + 1].position >= pos) {
          leftStop = sorted[i]; rightStop = sorted[i + 1]; break;
        }
      }
      const range = rightStop.position - leftStop.position;
      const t = range > 0 ? (pos - leftStop.position) / range : 0.5;
      const interpColor: RGBA = {
        r: Math.round(leftStop.color.r + (rightStop.color.r - leftStop.color.r) * t),
        g: Math.round(leftStop.color.g + (rightStop.color.g - leftStop.color.g) * t),
        b: Math.round(leftStop.color.b + (rightStop.color.b - leftStop.color.b) * t),
        a: Math.round((leftStop.color.a + (rightStop.color.a - leftStop.color.a) * t) * 100) / 100,
      };
      const newStop: GradientStop = { id: newStopId(), color: interpColor, position: Math.round(pos) };
      updateState((prev) => ({ ...prev, stops: [...prev.stops, newStop] }));
      setSelectedStopId(newStop.id);
    },
    [state.stops, getPositionFromEvent, updateState],
  );

  const handleStopMouseDown = useCallback(
    (e: React.MouseEvent, stopId: string) => {
      e.stopPropagation(); e.preventDefault();
      setSelectedStopId(stopId);
      draggingRef.current = stopId;

      const handleMove = (moveEvent: MouseEvent) => {
        if (!draggingRef.current) return;
        const pos = getPositionFromEvent(moveEvent);
        setState((prev) => {
          const next = { ...prev, stops: prev.stops.map((s) => s.id === draggingRef.current ? { ...s, position: Math.round(pos) } : s) };
          const css = gradientToCSS(next);
          pendingEmitRef.current = css;
          return next;
        });
      };

      const handleUp = () => {
        draggingRef.current = null;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [getPositionFromEvent],
  );

  const handleStopTouchStart = useCallback(
    (e: React.TouchEvent, stopId: string) => {
      e.stopPropagation();
      setSelectedStopId(stopId);
      draggingRef.current = stopId;

      const handleMove = (moveEvent: TouchEvent) => {
        if (!draggingRef.current || !barRef.current) return;
        moveEvent.preventDefault();
        const touch = moveEvent.touches[0];
        const rect = barRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const pos = clamp((x / rect.width) * 100, 0, 100);
        setState((prev) => {
          const next = { ...prev, stops: prev.stops.map((s) => s.id === draggingRef.current ? { ...s, position: Math.round(pos) } : s) };
          const css = gradientToCSS(next);
          pendingEmitRef.current = css;
          return next;
        });
      };

      const handleEnd = () => {
        draggingRef.current = null;
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };

      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    },
    [],
  );

  const deleteStop = useCallback(
    (stopId: string) => {
      if (state.stops.length <= 2) return;
      updateState((prev) => ({ ...prev, stops: prev.stops.filter((s) => s.id !== stopId) }));
      setSelectedStopId((prev) => {
        if (prev === stopId) {
          const remaining = state.stops.filter((s) => s.id !== stopId);
          return remaining[0]?.id ?? null;
        }
        return prev;
      });
    },
    [state.stops, updateState],
  );

  const handleStopDoubleClick = useCallback(
    (e: React.MouseEvent, stopId: string) => { e.stopPropagation(); e.preventDefault(); deleteStop(stopId); },
    [deleteStop],
  );

  const handleStopContextMenu = useCallback(
    (e: React.MouseEvent, stopId: string) => { e.preventDefault(); e.stopPropagation(); deleteStop(stopId); },
    [deleteStop],
  );

  // ── Stop property editors ──
  const updateSelectedStop = useCallback(
    (updates: Partial<GradientStop>) => {
      if (!selectedStopId) return;
      updateState((prev) => ({
        ...prev,
        stops: prev.stops.map((s) => (s.id === selectedStopId ? { ...s, ...updates } : s)),
      }));
    },
    [selectedStopId, updateState],
  );

  const handleColorChange = useCallback(
    (hex: string) => {
      const rgb = hexToRgb(hex);
      if (!rgb || !selectedStop) return;
      updateSelectedStop({ color: { ...selectedStop.color, r: rgb.r, g: rgb.g, b: rgb.b } });
    },
    [selectedStop, updateSelectedStop],
  );

  const handleOpacityChange = useCallback(
    (opacity: number) => {
      if (!selectedStop) return;
      updateSelectedStop({ color: { ...selectedStop.color, a: opacity / 100 } });
    },
    [selectedStop, updateSelectedStop],
  );

  const handlePositionChange = useCallback(
    (pos: number) => { updateSelectedStop({ position: clamp(Math.round(pos), 0, 100) }); },
    [updateSelectedStop],
  );

  const applyPreset = useCallback(
    (fill: string) => {
      const parsed = parseCSSGradient(fill);
      setState(parsed);
      setSelectedStopId(parsed.stops[0]?.id ?? null);
      pendingEmitRef.current = fill;
    },
    [],
  );

  // ── Render ──
  return (
    <div className="w-full space-y-3 text-xs">
      {/* Presets */}
      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Presets</div>
        <div className="flex flex-wrap gap-1">
          {(presets ?? OVERLAY_PRESETS).map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyPreset(preset.fill)}
              className={cn(
                'rounded-md border px-2 py-1 text-[11px] transition-colors',
                value === preset.fill
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border bg-muted/50 text-foreground hover:bg-muted'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type Toggle */}
      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tipo</div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => updateState((prev) => ({ ...prev, type: 'linear' }))}
            className={cn(
              'rounded-md border px-3 py-1 text-[11px] transition-colors',
              state.type === 'linear'
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border bg-muted/50 text-foreground hover:bg-muted'
            )}
          >
            Linear
          </button>
          <button
            type="button"
            onClick={() => updateState((prev) => ({ ...prev, type: 'radial' }))}
            className={cn(
              'rounded-md border px-3 py-1 text-[11px] transition-colors',
              state.type === 'radial'
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border bg-muted/50 text-foreground hover:bg-muted'
            )}
          >
            Radial
          </button>
        </div>
      </div>

      {/* Direction / Position Controls */}
      {state.type === 'linear' ? (
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Direção</div>
          <div className="flex items-center gap-1">
            {DIRECTION_PRESETS.map((d) => (
              <button
                key={d.angle}
                type="button"
                onClick={() => updateState((prev) => ({ ...prev, angle: d.angle }))}
                className={cn(
                  'flex size-7 items-center justify-center rounded-md border text-[11px] transition-colors',
                  state.angle === d.angle
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-muted/50 text-foreground hover:bg-muted'
                )}
              >
                {d.label}
              </button>
            ))}
            <input
              type="number"
              min={0}
              max={360}
              value={Math.round(state.angle)}
              onChange={(e) => updateState((prev) => ({ ...prev, angle: clamp(Number(e.target.value), 0, 360) }))}
              className="h-7 w-11 rounded-md border border-border bg-muted/50 px-1.5 text-center text-[11px] text-foreground outline-none focus:border-primary/50"
              title="Ângulo em graus"
            />
            <span className="text-[10px] text-muted-foreground">°</span>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Posição</div>
          <div className="flex flex-wrap gap-1">
            {RADIAL_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => updateState((prev) => ({ ...prev, radialPosition: p.value }))}
                className={cn(
                  'rounded-md border px-2 py-1 text-[11px] transition-colors',
                  state.radialPosition === p.value
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-muted/50 text-foreground hover:bg-muted'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gradient Bar */}
      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Stops</div>
        <div
          ref={barRef}
          className="relative h-7 cursor-crosshair rounded-md border border-border"
          style={CHECKERBOARD_STYLE}
          onMouseDown={handleBarMouseDown}
        >
          <div className="absolute inset-0 rounded-[5px]" style={{ background: barGradientCSS }} />
          {state.stops.map((stop) => (
            <div
              key={stop.id}
              data-stop-id={stop.id}
              className="absolute -top-1 flex h-9 w-5 -translate-x-1/2 cursor-grab items-end justify-center"
              style={{ left: `${stop.position}%`, zIndex: stop.id === selectedStopId ? 10 : 1 }}
              onMouseDown={(e) => handleStopMouseDown(e, stop.id)}
              onTouchStart={(e) => handleStopTouchStart(e, stop.id)}
              onDoubleClick={(e) => handleStopDoubleClick(e, stop.id)}
              onContextMenu={(e) => handleStopContextMenu(e, stop.id)}
              title={state.stops.length > 2 ? 'Duplo-clique para remover' : ''}
            >
              <div
                className="pointer-events-none size-3.5 rounded-full"
                style={{
                  background: rgbaToCSS(stop.color),
                  border: stop.id === selectedStopId ? '2px solid var(--color-primary)' : '2px solid #888',
                  boxShadow: stop.id === selectedStopId
                    ? '0 0 0 2px rgba(99,102,241,0.3), 0 2px 6px rgba(0,0,0,0.2)'
                    : '0 1px 4px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stop Editor */}
      {selectedStop && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-2.5">
          <div className="flex items-center gap-2">
            {/* Color swatch with native picker */}
            <div
              className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border"
              style={{ background: rgbaToCSS(selectedStop.color) }}
            >
              <input
                type="color"
                value={rgbaToHex(selectedStop.color)}
                onChange={(e) => handleColorChange(e.target.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </div>
            {/* Hex input */}
            <input
              type="text"
              value={rgbaToHex(selectedStop.color)}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-7 w-[72px] rounded-md border border-border bg-muted/50 px-1.5 text-center text-[11px] text-foreground outline-none focus:border-primary/50"
            />
            {/* Position */}
            <span className="ml-auto text-[10px] text-muted-foreground">Pos</span>
            <input
              type="number"
              min={0}
              max={100}
              value={selectedStop.position}
              onChange={(e) => handlePositionChange(Number(e.target.value))}
              className="h-7 w-11 rounded-md border border-border bg-muted/50 px-1.5 text-center text-[11px] text-foreground outline-none focus:border-primary/50"
            />
            <span className="text-[10px] text-muted-foreground">%</span>
          </div>

          {/* Opacity */}
          <div className="flex items-center gap-2">
            <span className="min-w-12 text-[10px] text-muted-foreground">Opacidade</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(selectedStop.color.a * 100)}
              onChange={(e) => handleOpacityChange(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border outline-none [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={Math.round(selectedStop.color.a * 100)}
              onChange={(e) => handleOpacityChange(clamp(Number(e.target.value), 0, 100))}
              className="h-7 w-10 rounded-md border border-border bg-muted/50 px-1 text-center text-[11px] text-foreground outline-none focus:border-primary/50"
            />
            <span className="text-[10px] text-muted-foreground">%</span>
          </div>

          {/* Delete stop */}
          {state.stops.length > 2 && (
            <button
              type="button"
              onClick={() => deleteStop(selectedStop.id)}
              className="rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[10px] text-destructive transition-colors hover:bg-destructive/20"
            >
              Remover stop
            </button>
          )}
        </div>
      )}

      {/* Live Preview */}
      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Preview</div>
        <div
          className="relative h-12 overflow-hidden rounded-md border border-border"
          style={CHECKERBOARD_STYLE}
        >
          <div className="absolute inset-0 rounded-[5px]" style={{ background: fullPreviewCSS }} />
        </div>
      </div>

      {/* Raw CSS toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowCSS(!showCSS)}
          className="text-[11px] text-muted-foreground underline hover:text-foreground"
        >
          {showCSS ? 'Fechar CSS' : 'CSS customizado'}
        </button>
        {showCSS && (
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const css = e.target.value;
              lastEmittedRef.current = css;
              onChange(css);
            }}
            onBlur={(e) => {
              const parsed = parseCSSGradient(e.target.value);
              setState(parsed);
              setSelectedStopId(parsed.stops[0]?.id ?? null);
            }}
            placeholder="linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)"
            className="mt-1 h-7 w-full rounded-md border border-border bg-muted/50 px-2 font-mono text-[11px] text-foreground outline-none focus:border-primary/50"
          />
        )}
      </div>
    </div>
  );
}
