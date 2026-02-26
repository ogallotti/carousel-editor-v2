'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SlideRenderer } from './SlideRenderer';
import { LeftPanel } from './LeftPanel';
import { RightPanel, BG_PSEUDO_ID } from './RightPanel';
import type { Slide, SlideElement, Theme, ElementType } from '@/types/schema';
import type { EditorState } from '@/types/editor';
import { cn } from '@/lib/utils';

export interface EditorActions {
  selectSlide: (i: number) => void;
  selectElement: (id: string | null) => void;
  addSlide: (afterIndex: number, slide: Slide) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  moveSlide: (from: number, to: number) => void;
  updateElement: (slideIndex: number, elementId: string, element: SlideElement) => void;
  addElement: (slideIndex: number, afterElementId: string | null, element: SlideElement) => void;
  deleteElement: (slideIndex: number, elementId: string) => void;
  duplicateElement: (slideIndex: number, elementId: string) => void;
  moveElement: (slideIndex: number, elementId: string, direction: 'up' | 'down') => void;
  reorderElement: (slideIndex: number, elementId: string, newIndex: number) => void;
  setTheme: (theme: Theme) => void;
  setSlideBg: (slideIndex: number, color: string | undefined) => void;
  setSlideBgImage: (slideIndex: number, image: string | undefined) => void;
  setSlideBgPosition: (slideIndex: number, position: string | undefined) => void;
}

interface EditorWorkspaceProps {
  state: EditorState;
  actions: EditorActions;
  projectId: string;
}

export function EditorWorkspace({ state, actions, projectId }: EditorWorkspaceProps) {
  const { carousel, selectedSlideIndex, selectedElementId, isPreviewMode, viewMode, zoom } = state;
  const { slides, theme, footer, header } = carousel;

  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[selectedSlideIndex];

  // Filter __bg__ pseudo-element from selection passed to SlideRenderer
  const rendererElementId = selectedElementId === BG_PSEUDO_ID ? null : selectedElementId;
  const totalSlides = slides.length;

  // Navigation
  const canGoPrev = selectedSlideIndex > 0;
  const canGoNext = selectedSlideIndex < totalSlides - 1;

  const goPrev = useCallback(() => {
    if (canGoPrev) actions.selectSlide(selectedSlideIndex - 1);
  }, [canGoPrev, selectedSlideIndex, actions]);

  const goNext = useCallback(() => {
    if (canGoNext) actions.selectSlide(selectedSlideIndex + 1);
  }, [canGoNext, selectedSlideIndex, actions]);

  // Element callbacks scoped to current slide
  const handleUpdateElement = useCallback(
    (elementId: string, element: SlideElement) => {
      actions.updateElement(selectedSlideIndex, elementId, element);
    },
    [selectedSlideIndex, actions]
  );

  const handleDeleteElement = useCallback(
    (elementId: string) => {
      actions.deleteElement(selectedSlideIndex, elementId);
    },
    [selectedSlideIndex, actions]
  );

  const handleDuplicateElement = useCallback(
    (elementId: string) => {
      actions.duplicateElement(selectedSlideIndex, elementId);
    },
    [selectedSlideIndex, actions]
  );


  const handleReorderElement = useCallback(
    (elementId: string, newIndex: number) => {
      actions.reorderElement(selectedSlideIndex, elementId, newIndex);
    },
    [selectedSlideIndex, actions]
  );

  const handleChangeElementType = useCallback(
    (elementId: string, newType: ElementType, newLevel?: number) => {
      const element = currentSlide?.elements.find((el) => el.id === elementId);
      if (!element) return;

      const content = 'content' in element ? (element as { content: string }).content : '';

      let newElement: SlideElement;
      switch (newType) {
        case 'heading':
          newElement = { id: element.id, type: 'heading', level: (newLevel ?? 1) as 1 | 2 | 3, content };
          break;
        case 'paragraph':
          newElement = { id: element.id, type: 'paragraph', content };
          break;
        case 'subtitle':
          newElement = { id: element.id, type: 'subtitle', content };
          break;
        case 'tag':
          newElement = { id: element.id, type: 'tag', content };
          break;
        default:
          return;
      }

      // Preserve positioning and style overrides from original
      if (element.marginTop !== undefined) newElement.marginTop = element.marginTop;
      if (element.marginBottom !== undefined) newElement.marginBottom = element.marginBottom;
      if (element.fontSize !== undefined) newElement.fontSize = element.fontSize;
      if (element.textAlign !== undefined) newElement.textAlign = element.textAlign;
      if (element.fontFamily !== undefined) newElement.fontFamily = element.fontFamily;
      if (element.fontWeight !== undefined) newElement.fontWeight = element.fontWeight;
      if (element.color !== undefined) newElement.color = element.color;
      if (element.opacity !== undefined) newElement.opacity = element.opacity;
      if (element.x !== undefined) newElement.x = element.x;
      if (element.y !== undefined) newElement.y = element.y;
      if (element.w !== undefined) newElement.w = element.w;
      if (element.h !== undefined) newElement.h = element.h;
      if (element.rotation !== undefined) newElement.rotation = element.rotation;
      if (element.zIndex !== undefined) newElement.zIndex = element.zIndex;

      actions.updateElement(selectedSlideIndex, elementId, newElement);
    },
    [currentSlide, selectedSlideIndex, actions]
  );

  const handleAddElement = useCallback(
    (element: SlideElement) => {
      actions.addElement(selectedSlideIndex, selectedElementId, element);
    },
    [selectedSlideIndex, selectedElementId, actions]
  );

  const handleSetSlideBg = useCallback(
    (color: string | undefined) => {
      actions.setSlideBg(selectedSlideIndex, color);
    },
    [selectedSlideIndex, actions]
  );

  const handleSetSlideBgImage = useCallback(
    (src: string | undefined) => {
      actions.setSlideBgImage(selectedSlideIndex, src);
    },
    [selectedSlideIndex, actions]
  );

  const handleSetSlideBgPosition = useCallback(
    (pos: string | undefined) => {
      actions.setSlideBgPosition(selectedSlideIndex, pos);
    },
    [selectedSlideIndex, actions]
  );

  // Arrow key navigation between slides
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape always works, even inside contentEditable
      if (e.key === 'Escape') {
        actions.selectElement(null);
        (e.target as HTMLElement)?.blur?.();
        return;
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'd') {
        if (selectedElementId && selectedElementId !== BG_PSEUDO_ID && !isPreviewMode) {
          e.preventDefault();
          handleDuplicateElement(selectedElementId);
        }
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        // Freeform nudge: if an element is selected on a freeform slide, arrow keys move it
        if (selectedElementId && selectedElementId !== BG_PSEUDO_ID && !isPreviewMode && currentSlide?.layout === 'freeform') {
          const element = currentSlide.elements.find((el) => el.id === selectedElementId);
          if (element) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            let newX = element.x ?? 0;
            let newY = element.y ?? 0;

            if (e.key === 'ArrowLeft') newX -= step;
            else if (e.key === 'ArrowRight') newX += step;
            else if (e.key === 'ArrowUp') newY -= step;
            else if (e.key === 'ArrowDown') newY += step;

            handleUpdateElement(selectedElementId, {
              ...element,
              x: Math.round(Math.max(0, newX)),
              y: Math.round(Math.max(0, newY)),
            });
            return;
          }
        }
        // Fallback: slide navigation
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goPrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goNext();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId && selectedElementId !== BG_PSEUDO_ID && !isPreviewMode) {
          e.preventDefault();
          handleDeleteElement(selectedElementId);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext, selectedElementId, isPreviewMode, handleDeleteElement, handleDuplicateElement, handleUpdateElement, currentSlide, actions]);

  // Grid view: render all slides
  const renderGridView = () => (
    <div className="flex flex-wrap gap-6 p-6">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={cn(
            'cursor-pointer rounded-lg transition-all hover:ring-2 hover:ring-primary/40',
            idx === selectedSlideIndex && 'ring-2 ring-primary'
          )}
          onClick={() => actions.selectSlide(idx)}
        >
          <SlideRenderer
            slide={slide}
            theme={theme}
            footer={footer.text}
            handle={header.handle}
            showCounter={header.showCounter}
            slideNumber={idx + 1}
            totalSlides={totalSlides}
            isEditing={false}
            selectedElementId={null}
            onSelectElement={() => {}}
            onUpdateElement={() => {}}
            scale={0.18}
            projectId={projectId}
          />
        </div>
      ))}
    </div>
  );

  // Horizontal (carousel) view: all slides side by side, selected always centered
  const renderHorizontalView = () => {
    if (slides.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <p className="text-sm">Adicione um slide no painel à esquerda para começar.</p>
        </div>
      );
    }

    const slideScale = zoom * 0.375;
    const slideW = 1080 * slideScale;
    const gap = 16;
    // Offset to center the selected slide: translate the strip so slide N is at 50%
    const offsetX = selectedSlideIndex * (slideW + gap) + slideW / 2;

    return (
      <div className="relative flex flex-1 items-center overflow-hidden">
        {/* Navigation arrows */}
        {canGoPrev && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-3 z-10 size-9 rounded-full bg-card/90 shadow-md backdrop-blur-sm transition-all hover:bg-card hover:shadow-lg hover:scale-105"
            onClick={goPrev}
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}

        {canGoNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 z-10 size-9 rounded-full bg-card/90 shadow-md backdrop-blur-sm transition-all hover:bg-card hover:shadow-lg hover:scale-105"
            onClick={goNext}
          >
            <ChevronRight className="size-4" />
          </Button>
        )}

        {/* Slides strip — transformed to center the selected slide */}
        <div
          ref={canvasRef}
          className="flex items-center py-6"
          style={{
            gap,
            marginLeft: '50%',
            transform: `translateX(-${offsetX}px)`,
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {slides.map((slide, idx) => {
            const isActive = idx === selectedSlideIndex;
            return (
              <div
                key={slide.id}
                className={cn(
                  'flex-shrink-0 transition-all duration-200',
                  isActive
                    ? 'slide-canvas-frame'
                    : 'cursor-pointer opacity-50 hover:opacity-75 rounded-lg'
                )}
                onClick={() => { if (!isActive) actions.selectSlide(idx); }}
              >
                <SlideRenderer
                  slide={slide}
                  theme={theme}
                  footer={footer.text}
                  handle={header.handle}
                  showCounter={header.showCounter}
                  slideNumber={idx + 1}
                  totalSlides={totalSlides}
                  isEditing={isActive && !isPreviewMode}
                  selectedElementId={isActive ? rendererElementId : null}
                  onSelectElement={isActive ? actions.selectElement : () => {}}
                  onUpdateElement={isActive ? handleUpdateElement : () => {}}
                  onChangeElementType={isActive ? handleChangeElementType : undefined}
                  onDeleteElement={isActive ? handleDeleteElement : undefined}
                  onDuplicateElement={isActive ? handleDuplicateElement : undefined}
                  onUpdateSlideBgPosition={isActive ? handleSetSlideBgPosition : undefined}
                  scale={slideScale}
                  projectId={projectId}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel */}
      <div
        className={cn(
          'editor-panel flex-shrink-0 h-full flex flex-col border-r border-border/40 transition-all duration-200',
          leftPanelOpen ? 'w-64' : 'w-0'
        )}
      >
        {leftPanelOpen && (
          <LeftPanel
            slides={slides}
            selectedSlideIndex={selectedSlideIndex}
            selectedElementId={selectedElementId}
            theme={theme}
            footer={footer.text}
            handle={header.handle}
            showCounter={header.showCounter}
            isPreviewMode={isPreviewMode}
            onSelectSlide={actions.selectSlide}
            onAddSlide={actions.addSlide}
            onDeleteSlide={actions.deleteSlide}
            onDuplicateSlide={actions.duplicateSlide}
            onMoveSlide={actions.moveSlide}
            onAddElement={handleAddElement}
          />
        )}
      </div>

      {/* Toggle left panel button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-px top-2 z-20 size-6 rounded-l-none rounded-r border border-l-0 border-border/50 bg-card/80"
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        >
          {leftPanelOpen ? <PanelLeftClose className="size-3" /> : <PanelLeft className="size-3" />}
        </Button>
      </div>

      {/* Center canvas */}
      <div className="editor-canvas flex flex-1 flex-col overflow-auto">
        {viewMode === 'grid' ? renderGridView() : renderHorizontalView()}

        {/* Slide counter */}
        {totalSlides > 0 && (
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="rounded-full bg-card/80 px-3 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground shadow-sm backdrop-blur-sm">
              {selectedSlideIndex + 1} / {totalSlides}
            </span>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="editor-panel hidden w-80 flex-shrink-0 border-l border-border/40 lg:block">
        {currentSlide && (
          <RightPanel
            slide={currentSlide}
            slideIndex={selectedSlideIndex}
            selectedElementId={selectedElementId}
            theme={theme}
            onSelectElement={actions.selectElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onReorderElement={handleReorderElement}
            onChangeElementType={handleChangeElementType}
            onSetTheme={actions.setTheme}
            onSetSlideBg={handleSetSlideBg}
            slideBgImage={currentSlide?.backgroundImage ?? undefined}
            onSetSlideBgImage={handleSetSlideBgImage}
            slideBgPosition={currentSlide?.backgroundPosition}
            onSetSlideBgPosition={handleSetSlideBgPosition}
            projectId={projectId}
          />
        )}
      </div>
    </div>
  );
}
