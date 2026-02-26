'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bold, Italic, Underline, Palette, AArrowUp, AArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SelectionToolbarProps {
  /** Callback before any formatting change (for undo snapshot) */
  onBeforeFormat: () => void;
  /** Callback after any formatting change (to persist innerHTML) */
  onAfterFormat: () => void;
  /** CSS selector scope — only show toolbar for selections within this selector */
  containerSelector?: string;
}

const THEME_COLORS = [
  { label: 'Texto', var: '--text' },
  { label: 'Secundário', var: '--text-secondary' },
  { label: 'Muted', var: '--text-muted' },
  { label: 'Destaque', var: '--highlight' },
  { label: 'Accent', var: '--accent' },
];

const EXTRA_COLORS = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

function getComputedColor(varName: string): string {
  const slide = document.querySelector('.slide-renderer');
  if (!slide) return '#ffffff';
  return getComputedStyle(slide).getPropertyValue(varName).trim() || '#ffffff';
}

/**
 * Gets the current font size of the selection in pixels.
 */
function getSelectionFontSize(): number | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

  const range = sel.getRangeAt(0);
  let node = range.startContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement!;
  if (!node || !(node instanceof HTMLElement)) return null;

  const computed = getComputedStyle(node);
  return parseFloat(computed.fontSize) || null;
}

/**
 * Wraps the current selection in a span with the given font-size.
 * Uses execCommand('fontSize') trick + post-processing to get exact px control.
 */
function applySelectionFontSize(sizePx: number): void {
  // Use fontSize command with a placeholder value, then replace the <font> tag
  document.execCommand('fontSize', false, '7');

  // Find the font elements just created and replace with styled spans
  const fontElements = document.querySelectorAll('font[size="7"]');
  fontElements.forEach((font) => {
    const span = document.createElement('span');
    span.style.fontSize = `${sizePx}px`;
    span.innerHTML = font.innerHTML;
    font.parentNode?.replaceChild(span, font);
  });
}

export function SelectionToolbar({
  onBeforeFormat,
  onAfterFormat,
  containerSelector = '.slide-renderer',
}: SelectionToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [colorOpen, setColorOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isSelectionInContainer = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return false;

    const range = sel.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

    while (node) {
      if (node instanceof HTMLElement) {
        if (node.isContentEditable) {
          // Check it's within our container
          return !!node.closest(containerSelector);
        }
      }
      node = node.parentElement;
    }
    return false;
  }, [containerSelector]);

  const updatePosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      if (!colorOpen) setVisible(false);
      return;
    }

    if (!isSelectionInContainer()) {
      if (!colorOpen) setVisible(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      if (!colorOpen) setVisible(false);
      return;
    }

    // Position above the selection
    const toolbarHeight = 44;
    const gap = 8;
    const top = rect.top - toolbarHeight - gap + window.scrollY;
    const left = rect.left + rect.width / 2 + window.scrollX;

    setPosition({ top: Math.max(4, top), left });
    setVisible(true);
  }, [isSelectionInContainer, colorOpen]);

  useEffect(() => {
    const onSelectionChange = () => {
      clearTimeout(hideTimeout.current);
      // Small delay to avoid flicker during click-drag
      hideTimeout.current = setTimeout(updatePosition, 50);
    };

    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      clearTimeout(hideTimeout.current);
    };
  }, [updatePosition]);

  // Hide when clicking outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (toolbarRef.current?.contains(e.target as Node)) return;
      // Don't hide immediately — let selectionchange handle it
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const execFormat = useCallback(
    (command: string, value?: string) => {
      onBeforeFormat();
      document.execCommand(command, false, value);
      onAfterFormat();
    },
    [onBeforeFormat, onAfterFormat],
  );

  const handleColor = useCallback(
    (color: string) => {
      // Restore selection if it was lost when opening the popover
      execFormat('foreColor', color);
      setColorOpen(false);
    },
    [execFormat],
  );

  const handleThemeColor = useCallback(
    (varName: string) => {
      const color = getComputedColor(varName);
      handleColor(color);
    },
    [handleColor],
  );

  const handleSizeChange = useCallback(
    (delta: number) => {
      const currentSize = getSelectionFontSize();
      if (currentSize === null) return;
      const newSize = Math.max(8, Math.round(currentSize + delta));
      onBeforeFormat();
      applySelectionFontSize(newSize);
      onAfterFormat();
    },
    [onBeforeFormat, onAfterFormat],
  );

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[99999] flex items-center gap-0.5 rounded-xl border border-border/60 bg-popover/95 px-1.5 py-1 shadow-xl backdrop-blur-md"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => {
        // Prevent selection from being cleared when clicking toolbar buttons
        e.preventDefault();
      }}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7"
        onMouseDown={(e) => { e.preventDefault(); execFormat('bold'); }}
        title="Negrito"
      >
        <Bold className="size-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7"
        onMouseDown={(e) => { e.preventDefault(); execFormat('italic'); }}
        title="Itálico"
      >
        <Italic className="size-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7"
        onMouseDown={(e) => { e.preventDefault(); execFormat('underline'); }}
        title="Sublinhado"
      >
        <Underline className="size-3.5" />
      </Button>

      <div className="mx-0.5 h-5 w-px bg-border/50" />

      {/* Color picker */}
      <Popover open={colorOpen} onOpenChange={setColorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onMouseDown={(e) => e.preventDefault()}
            title="Cor do texto"
          >
            <Palette className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-2"
          side="top"
          align="center"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tema</div>
          <div className="flex gap-1 mb-2">
            {THEME_COLORS.map((tc) => (
              <button
                key={tc.var}
                type="button"
                className="size-6 rounded-md border border-border/50 transition-transform hover:scale-110"
                style={{ background: getComputedColor(tc.var) }}
                title={tc.label}
                onMouseDown={(e) => { e.preventDefault(); handleThemeColor(tc.var); }}
              />
            ))}
          </div>
          <div className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Cores</div>
          <div className="grid grid-cols-5 gap-1">
            {EXTRA_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="size-6 rounded-md border border-border/50 transition-transform hover:scale-110"
                style={{ background: c }}
                onMouseDown={(e) => { e.preventDefault(); handleColor(c); }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="mx-0.5 h-5 w-px bg-border/50" />

      {/* Selection font size A-/A+ */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7"
        onMouseDown={(e) => { e.preventDefault(); handleSizeChange(-4); }}
        title="Diminuir tamanho da seleção"
      >
        <AArrowDown className="size-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7"
        onMouseDown={(e) => { e.preventDefault(); handleSizeChange(4); }}
        title="Aumentar tamanho da seleção"
      >
        <AArrowUp className="size-3.5" />
      </Button>
    </div>
  );
}
