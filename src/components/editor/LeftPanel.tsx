'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  Layers,
  Type,
  AlignLeft,
  Smile,
  Image,
  Quote,
  ListChecks,
  Sparkles,
  Minus,
  CircleDot,
  Hash,
  GripVertical,
  Space,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { SlideRenderer } from './SlideRenderer';
import { SLIDE_TEMPLATES } from './slideTemplates';
import { nanoid } from '@/lib/nanoid';
import { cn } from '@/lib/utils';
import type { Slide, SlideElement, Theme } from '@/types/schema';

// ─── Props ──────────────────────────────────────────────────

interface LeftPanelProps {
  slides: Slide[];
  selectedSlideIndex: number;
  selectedElementId: string | null;
  theme: Theme;
  footer: string;
  handle: string;
  showCounter?: boolean;
  isPreviewMode: boolean;
  onSelectSlide: (index: number) => void;
  onAddSlide: (afterIndex: number, slide: Slide) => void;
  onDeleteSlide: (index: number) => void;
  onDuplicateSlide: (index: number) => void;
  onMoveSlide: (from: number, to: number) => void;
  onAddElement: (element: SlideElement) => void;
}

// ─── Element button definitions ─────────────────────────────

interface ElementButtonDef {
  label: string;
  icon: React.ReactNode;
  create: () => SlideElement;
}

const ELEMENT_BUTTONS: ElementButtonDef[] = [
  {
    label: 'Tag',
    icon: <Hash className="size-4" />,
    create: () => ({ id: nanoid(), type: 'tag', content: 'TAG', textAlign: 'center' as const }),
  },
  {
    label: 'T\u00edtulo H1',
    icon: <Type className="size-4" />,
    create: () => ({ id: nanoid(), type: 'heading', level: 1, content: 'T\u00edtulo', textAlign: 'center' as const }),
  },
  {
    label: 'Par\u00e1grafo',
    icon: <AlignLeft className="size-4" />,
    create: () => ({ id: nanoid(), type: 'paragraph', content: 'Texto aqui...', textAlign: 'center' as const }),
  },
  {
    label: 'Subt\u00edtulo',
    icon: <Type className="size-3.5" />,
    create: () => ({ id: nanoid(), type: 'subtitle', content: 'Subt\u00edtulo', textAlign: 'center' as const }),
  },
  {
    label: 'Emoji',
    icon: <Smile className="size-4" />,
    create: () => ({ id: nanoid(), type: 'emoji', content: '\u{1F680}', size: 96 }),
  },
  {
    label: 'Imagem',
    icon: <Image className="size-4" />,
    create: () => ({ id: nanoid(), type: 'image', src: '', alt: '', variant: 'area' as const, borderRadius: 16, w: 600, h: 500 }),
  },
  {
    label: 'Cita\u00e7\u00e3o',
    icon: <Quote className="size-4" />,
    create: () => ({ id: nanoid(), type: 'quote', content: 'Cita\u00e7\u00e3o aqui...', textAlign: 'center' as const }),
  },
  {
    label: 'Item de Lista',
    icon: <ListChecks className="size-4" />,
    create: () => ({ id: nanoid(), type: 'list-item', icon: '\u2713', content: 'Item da lista', textAlign: 'left' as const }),
  },
  {
    label: 'Destaque',
    icon: <Sparkles className="size-4" />,
    create: () => ({ id: nanoid(), type: 'highlight', content: 'Texto em destaque', textAlign: 'center' as const }),
  },
  {
    label: 'Overlay',
    icon: <CircleDot className="size-4" />,
    create: () => ({
      id: nanoid(),
      type: 'overlay',
      fill: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))',
      x: 0,
      y: 0,
      w: 1080,
      h: 1440,
      zIndex: -1,
    }),
  },
  {
    label: 'Divisor',
    icon: <Minus className="size-4" />,
    create: () => ({ id: nanoid(), type: 'divider' }),
  },
  {
    label: 'Espa\u00e7ador',
    icon: <Space className="size-4" />,
    create: () => ({ id: nanoid(), type: 'spacer', height: 40 }),
  },
];

// ─── Helpers ────────────────────────────────────────────────

/** Assign unique IDs to every element in a template slide */
function instantiateTemplate(template: Omit<Slide, 'id'>): Slide {
  return {
    id: nanoid(),
    layout: template.layout,
    elements: template.elements.map((el) => ({ ...el, id: nanoid() })),
    background: template.background ?? null,
    backgroundImage: template.backgroundImage ?? null,
  };
}

// ─── Component ──────────────────────────────────────────────

export function LeftPanel({
  slides,
  selectedSlideIndex,
  selectedElementId,
  theme,
  footer,
  handle,
  showCounter,
  isPreviewMode,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlide,
  onAddElement,
}: LeftPanelProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  // ── Drag-and-drop state ──
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const dragCounterRef = useRef(0);

  // ── Drag handlers ──
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
      setDragIndex(index);
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      dragCounterRef.current++;
      setDropTarget(index);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setDropTarget(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        onMoveSlide(fromIndex, toIndex);
      }
      setDragIndex(null);
      setDropTarget(null);
    },
    [onMoveSlide]
  );

  const handleDragEnd = useCallback(() => {
    dragCounterRef.current = 0;
    setDragIndex(null);
    setDropTarget(null);
  }, []);

  // ── Template selection ──
  const handleSelectTemplate = useCallback(
    (template: Omit<Slide, 'id'>) => {
      const slide = instantiateTemplate(template);
      // When no slides exist, use -1 so the new slide goes at index 0
      const afterIdx = slides.length === 0 ? -1 : selectedSlideIndex;
      onAddSlide(afterIdx, slide);
      setShowTemplates(false);
    },
    [onAddSlide, selectedSlideIndex, slides.length]
  );

  const totalSlides = slides.length;

  return (
    <TooltipProvider>
      <Tabs defaultValue="slides" className="flex h-full flex-col gap-0">
        {/* Tab bar */}
        <div className="flex-shrink-0 border-b border-border/50 px-2 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="slides" className="flex-1 text-xs">
              <Layers className="size-3.5" />
              Slides
            </TabsTrigger>
            <TabsTrigger value="elements" className="flex-1 text-xs">
              <Plus className="size-3.5" />
              Elementos
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ═══════════════ TAB 1: Slides ═══════════════ */}
        <TabsContent value="slides" className="mt-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-2">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'slide-thumbnail group/thumb relative cursor-pointer w-fit mx-auto',
                    idx === selectedSlideIndex
                      ? 'active'
                      : '',
                    dragIndex === idx && 'opacity-40',
                    dropTarget === idx && dragIndex !== idx && 'ring-2 ring-primary ring-offset-2'
                  )}
                  onClick={() => onSelectSlide(idx)}
                >
                  {/* Drag handle hint */}
                  <div className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover/thumb:opacity-40">
                    <GripVertical className="size-3 text-muted-foreground" />
                  </div>

                  {/* Thumbnail preview */}
                  <div className="overflow-hidden rounded-md">
                    <SlideRenderer
                      slide={slide}
                      theme={theme}
                      footer={footer}
                      handle={handle}
                      showCounter={showCounter}
                      slideNumber={idx + 1}
                      totalSlides={totalSlides}
                      isEditing={false}
                      selectedElementId={null}
                      onSelectElement={() => {}}
                      onUpdateElement={() => {}}
                      scale={0.155}
                    />
                  </div>

                  {/* Slide number badge */}
                  <div className="absolute bottom-1.5 left-1.5">
                    <span className="inline-flex size-5 items-center justify-center rounded-md bg-foreground/70 text-[10px] font-semibold tabular-nums text-background backdrop-blur-sm">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Hover action buttons */}
                  <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover/thumb:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="size-5 bg-card/80 backdrop-blur hover:bg-card"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateSlide(idx);
                          }}
                        >
                          <Copy className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4}>Duplicar</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="size-5 bg-card/80 backdrop-blur hover:bg-destructive/80 hover:text-destructive-foreground"
                          disabled={totalSlides <= 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSlide(idx);
                          }}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4}>Excluir</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Add slide button / template selector */}
          <div className="flex-shrink-0 border-t border-border/50 p-2">
            {showTemplates ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Escolha um modelo
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowTemplates(false)}
                    className="size-5"
                  >
                    <span className="text-xs">&times;</span>
                  </Button>
                </div>
                <ScrollArea className="max-h-[420px]">
                  <div className="grid grid-cols-2 gap-1">
                    {SLIDE_TEMPLATES.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        className="flex flex-col items-center gap-1 rounded-lg border border-border/30 bg-card/50 px-2 py-2.5 text-center transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]"
                        onClick={() => handleSelectTemplate(tpl.slide)}
                      >
                        <span className="text-lg leading-none">{tpl.icon}</span>
                        <span className="text-xs leading-tight text-muted-foreground">
                          {tpl.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                onClick={() => setShowTemplates(true)}
              >
                <Plus className="size-3.5" />
                Adicionar slide
              </Button>
            )}
          </div>
        </TabsContent>

        {/* ═══════════════ TAB 2: Elementos ═══════════════ */}
        <TabsContent value="elements" className="mt-0 flex-1 overflow-hidden flex flex-col">
          <div className="flex-shrink-0 px-3 pt-3 pb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Adicionar ao slide {selectedSlideIndex + 1}
            </p>
          </div>
          <Separator className="opacity-50" />
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 gap-1.5 p-2">
              {ELEMENT_BUTTONS.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 rounded-lg border border-border/30 bg-card/50 px-2.5 py-2.5 text-left transition-all',
                    'hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm',
                    'active:scale-[0.98]',
                    'disabled:pointer-events-none disabled:opacity-50'
                  )}
                  disabled={isPreviewMode}
                  onClick={() => onAddElement(btn.create())}
                >
                  <span className="flex-shrink-0 text-muted-foreground">{btn.icon}</span>
                  <span className="truncate text-xs font-medium text-foreground/80">
                    {btn.label}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
