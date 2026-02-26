'use client';

import { useCallback } from 'react';
import {
  Bold, Italic, Underline, AArrowUp, AArrowDown,
  AlignLeft, AlignCenter, AlignRight,
  AlignHorizontalDistributeStart, AlignHorizontalDistributeEnd,
  AlignHorizontalJustifyCenter,
  AlignVerticalDistributeStart, AlignVerticalDistributeEnd,
  AlignVerticalJustifyCenter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SlideElement } from '@/types/schema';

interface FormattingToolbarProps {
  selectedElementId: string;
  selectedElementType: string;
  selectedElementLevel?: number;
  currentFontSize?: number;
  onChangeType: (newType: string, newLevel?: number) => void;
  onBeforeFormat: () => void;
  onAfterFormat: () => void;
  onUpdateFontSize: (elementId: string, fontSize: number) => void;
  themeVars: Record<string, string>;
  // Freeform alignment
  isFreeform?: boolean;
  selectedElement?: SlideElement;
  onUpdateElement?: (elementId: string, element: SlideElement) => void;
}

const TEXT_ELEMENT_TYPES = new Set([
  'tag', 'heading', 'paragraph', 'subtitle', 'quote', 'highlight', 'list-item',
]);

/**
 * Default font sizes from slide.css for each element type.
 * Used as the base for A+/A- proportional scaling.
 */
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
  if (type === 'heading') {
    return DEFAULT_FONT_SIZES[`h${level ?? 1}`] ?? 72;
  }
  return DEFAULT_FONT_SIZES[type] ?? 38;
}

const FONT_SIZE_STEP = 4;

/**
 * Maps selectedElementType + selectedElementLevel to a select value string,
 * and vice versa.
 */
function getTypeSelectValue(type: string, level?: number): string {
  if (type === 'heading') {
    if (level === 1) return 'h1';
    if (level === 2) return 'h2';
    if (level === 3) return 'h3';
    return 'h1'; // default heading level
  }
  return type;
}

function parseTypeSelectValue(value: string): { type: string; level?: number } {
  switch (value) {
    case 'h1':
      return { type: 'heading', level: 1 };
    case 'h2':
      return { type: 'heading', level: 2 };
    case 'h3':
      return { type: 'heading', level: 3 };
    default:
      return { type: value };
  }
}

const TYPE_OPTIONS = [
  { value: 'tag', label: 'Tag' },
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'paragraph', label: 'Parágrafo' },
  { value: 'subtitle', label: 'Subtítulo' },
];

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1440;

export function FormattingToolbar({
  selectedElementId,
  selectedElementType,
  selectedElementLevel,
  currentFontSize,
  onChangeType,
  onBeforeFormat,
  onAfterFormat,
  onUpdateFontSize,
  isFreeform,
  selectedElement,
  onUpdateElement,
}: FormattingToolbarProps) {
  const isTextElement = TEXT_ELEMENT_TYPES.has(selectedElementType);

  const execFormat = useCallback(
    (command: string) => {
      onBeforeFormat();
      document.execCommand(command);
      onAfterFormat();
    },
    [onBeforeFormat, onAfterFormat],
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      const parsed = parseTypeSelectValue(value);
      onChangeType(parsed.type, parsed.level);
    },
    [onChangeType],
  );

  const defaultSize = getDefaultFontSize(selectedElementType, selectedElementLevel);
  const currentSize = currentFontSize ?? defaultSize;

  const handleFontSizeStep = useCallback(
    (delta: number) => {
      const newSize = Math.max(8, currentSize + delta);
      onUpdateFontSize(selectedElementId, newSize);
    },
    [selectedElementId, currentSize, onUpdateFontSize],
  );

  const handleResetFontSize = useCallback(() => {
    // Reset to theme default by clearing the override
    onUpdateFontSize(selectedElementId, 0); // 0 signals "use default"
  }, [selectedElementId, onUpdateFontSize]);

  const handleAlign = useCallback(
    (axis: 'x' | 'y', alignment: 'start' | 'center' | 'end') => {
      if (!selectedElement || !onUpdateElement) return;
      const elW = selectedElement.w ?? 200;
      const elH = selectedElement.h ?? 50;

      let newVal: number;
      if (axis === 'x') {
        if (alignment === 'start') newVal = 0;
        else if (alignment === 'center') newVal = (SLIDE_WIDTH - elW) / 2;
        else newVal = SLIDE_WIDTH - elW;
      } else {
        if (alignment === 'start') newVal = 0;
        else if (alignment === 'center') newVal = (SLIDE_HEIGHT - elH) / 2;
        else newVal = SLIDE_HEIGHT - elH;
      }

      onUpdateElement(selectedElementId, {
        ...selectedElement,
        [axis]: Math.round(newVal),
      });
    },
    [selectedElement, selectedElementId, onUpdateElement],
  );

  const handleTextAlign = useCallback(
    (align: 'left' | 'center' | 'right') => {
      if (!selectedElement || !onUpdateElement) return;
      onUpdateElement(selectedElementId, {
        ...selectedElement,
        textAlign: align,
      });
    },
    [selectedElement, selectedElementId, onUpdateElement],
  );

  const showTextTools = isTextElement;
  const showFreeformAlign = isFreeform && selectedElement && onUpdateElement;

  if (!showTextTools && !showFreeformAlign) {
    return null;
  }

  const currentTypeValue = getTypeSelectValue(selectedElementType, selectedElementLevel);
  const currentTextAlign = selectedElement?.textAlign ?? 'center';

  return (
    <div className="formatting-toolbar fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-2xl px-3 py-2">
      {/* Element type switcher (text elements only) */}
      {showTextTools && (
        <>
          <Select value={currentTypeValue} onValueChange={handleTypeChange}>
            <SelectTrigger size="sm" className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Format buttons */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => execFormat('bold')}
              title="Negrito"
            >
              <Bold className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => execFormat('italic')}
              title="Itálico"
            >
              <Italic className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => execFormat('underline')}
              title="Sublinhado"
            >
              <Underline className="size-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Font size A-/A+ */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => handleFontSizeStep(-FONT_SIZE_STEP)}
              title="Diminuir fonte"
            >
              <AArrowDown className="size-4" />
            </Button>

            <button
              type="button"
              className="h-8 min-w-[3rem] rounded-md px-1.5 text-center text-xs font-medium tabular-nums text-foreground hover:bg-accent/50 transition-colors"
              onClick={handleResetFontSize}
              title={`Resetar para ${defaultSize}px (padrão do tema)`}
            >
              {currentSize}px
            </button>

            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => handleFontSizeStep(FONT_SIZE_STEP)}
              title="Aumentar fonte"
            >
              <AArrowUp className="size-4" />
            </Button>
          </div>
        </>
      )}

      {/* Text alignment buttons (text elements only) */}
      {showTextTools && onUpdateElement && selectedElement && (
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <div className="flex items-center gap-0.5">
            <Button
              variant={currentTextAlign === 'left' ? 'secondary' : 'ghost'}
              size="icon-sm"
              className="size-8"
              onClick={() => handleTextAlign('left')}
              title="Alinhar texto à esquerda"
            >
              <AlignLeft className="size-4" />
            </Button>
            <Button
              variant={currentTextAlign === 'center' ? 'secondary' : 'ghost'}
              size="icon-sm"
              className="size-8"
              onClick={() => handleTextAlign('center')}
              title="Centralizar texto"
            >
              <AlignCenter className="size-4" />
            </Button>
            <Button
              variant={currentTextAlign === 'right' ? 'secondary' : 'ghost'}
              size="icon-sm"
              className="size-8"
              onClick={() => handleTextAlign('right')}
              title="Alinhar texto à direita"
            >
              <AlignRight className="size-4" />
            </Button>
          </div>
        </>
      )}

      {/* Freeform position alignment buttons */}
      {showFreeformAlign && (
        <>
          {showTextTools && <Separator orientation="vertical" className="mx-1 h-6" />}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => handleAlign('x', 'start')}
              title="Alinhar \u00e0 esquerda"
            >
              <AlignHorizontalDistributeStart className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => handleAlign('x', 'center')}
              title="Centralizar horizontal"
            >
              <AlignHorizontalJustifyCenter className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => handleAlign('x', 'end')}
              title="Alinhar \u00e0 direita"
            >
              <AlignHorizontalDistributeEnd className="size-4" />
            </Button>

            <Separator orientation="vertical" className="mx-0.5 h-4" />

            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => handleAlign('y', 'start')}
              title="Alinhar ao topo"
            >
              <AlignVerticalDistributeStart className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => handleAlign('y', 'center')}
              title="Centralizar vertical"
            >
              <AlignVerticalJustifyCenter className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => handleAlign('y', 'end')}
              title="Alinhar \u00e0 base"
            >
              <AlignVerticalDistributeEnd className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
