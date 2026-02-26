'use client';

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { Copy, Trash2, Image, LayoutGrid, Move } from 'lucide-react';
import type { Slide, SlideElement, SlideLayout, Theme, ElementType, OverlayElement, HighlightElement, QuoteElement, ListItemElement, DividerElement, ImageElement } from '@/types/schema';
import type { GuideLine } from '@/hooks/useSmartGuides';
import { themeToCSVars } from '@/lib/theme-utils';
import { useAssetContext } from '@/lib/asset-urls';
import { ImageDialog } from './ImageDialog';
import { EmojiPicker } from './EmojiPicker';
import { IconPicker } from './IconPicker';
import { SelectionToolbar } from './SelectionToolbar';
import { FreeformElement } from './FreeformElement';
import { SmartGuideOverlay } from './SmartGuideOverlay';
import { cn } from '@/lib/utils';

function parseObjectPosition(pos?: string): { x: number; y: number } {
  if (!pos) return { x: 50, y: 50 };
  const parts = pos.trim().split(/\s+/);
  const parseVal = (s: string): number => {
    if (s === 'center') return 50;
    if (s === 'left' || s === 'top') return 0;
    if (s === 'right' || s === 'bottom') return 100;
    return parseFloat(s) || 50;
  };
  return { x: parseVal(parts[0]), y: parts.length > 1 ? parseVal(parts[1]) : 50 };
}

interface SlideRendererProps {
  slide: Slide;
  theme: Theme;
  footer: string;
  handle: string;
  showCounter?: boolean;
  slideNumber: number;
  totalSlides: number;
  isEditing: boolean;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (elementId: string, element: SlideElement) => void;
  onChangeElementType?: (elementId: string, newType: ElementType, newLevel?: number) => void;
  onDeleteElement?: (elementId: string) => void;
  onDuplicateElement?: (elementId: string) => void;
  onUpdateSlideBgPosition?: (pos: string) => void;
  onSetSlideLayout?: (layout: SlideLayout, elementUpdates?: Record<string, Partial<SlideElement>>) => void;
  scale?: number;
  projectId?: string;
}

function themeToStyle(vars: Record<string, string>): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    style[key] = value;
  }
  return style as React.CSSProperties;
}

// Style overrides that must be applied DIRECTLY on inner elements (h1, h2, p, .tag, .sub, etc.)
// because slide.css rules like `.slide h2 { font-size: 56px }` have higher specificity than
// inherited values from a parent wrapper div.
function getElementInlineStyle(element: SlideElement): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (element.fontSize !== undefined) style.fontSize = `${element.fontSize}px`;
  if (element.fontFamily) style.fontFamily = `'${element.fontFamily}', sans-serif`;
  if (element.fontWeight !== undefined) style.fontWeight = element.fontWeight;
  if (element.color) style.color = element.color;
  if (element.textAlign) style.textAlign = element.textAlign;
  return style;
}

function ElementControls({
  onDuplicate,
  onDelete,
}: {
  onDuplicate?: () => void;
  onDelete?: () => void;
}) {
  const btnClass = 'flex size-[40px] items-center justify-center rounded-lg backdrop-blur-sm bg-popover/85 text-muted-foreground border border-border/30 cursor-pointer transition-all duration-150 hover:text-popover-foreground';

  return (
    <div className="absolute opacity-0 transition-opacity group-hover/el:opacity-100 z-[99998] left-full top-0 ml-2 flex flex-col gap-1"
      data-editor-control
      onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
      {/* Duplicate */}
      {onDuplicate && (
        <button type="button" className={btnClass} title="Duplicar elemento" data-editor-control
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
          <Copy className="size-5" />
        </button>
      )}
      {/* Delete */}
      {onDelete && (
        <button type="button" className={cn(btnClass, 'hover:text-destructive hover:bg-destructive/15')} title="Excluir elemento" data-editor-control
          onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="size-5" />
        </button>
      )}
    </div>
  );
}

function ElementWrapper({
  element,
  isEditing,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  className: extraClassName,
  children,
}: {
  element: SlideElement;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  // Only margins and opacity belong on the wrapper div.
  // fontSize, fontFamily, fontWeight, color, textAlign must go on inner elements
  // via getElementInlineStyle() to beat CSS specificity (e.g. `.slide h2 { font-size: 56px }`).
  const style: React.CSSProperties = {};
  if (element.marginTop !== undefined) style.marginTop = `${element.marginTop}px`;
  if (element.marginBottom !== undefined) style.marginBottom = `${element.marginBottom}px`;
  if (element.opacity !== undefined) style.opacity = element.opacity;

  return (
    <div
      className={cn(
        'group/el relative',
        isEditing && !isSelected && 'cursor-pointer',
        isSelected && 'outline outline-2 outline-offset-2 rounded outline-[var(--editor-accent)]',
        isEditing && !isSelected && 'hover:outline hover:outline-1 hover:outline-offset-1 hover:rounded hover:outline-[var(--editor-accent-border)]',
        extraClassName,
      )}
      style={style}
      data-element-id={element.id}
      onClick={(e) => {
        if (isEditing) {
          e.stopPropagation();
          if (!isSelected) {
            onSelect();
          }
        }
      }}
    >
      {children}
      {isEditing && (
        <ElementControls
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

function SlideRendererComponent({
  slide,
  theme,
  footer,
  handle,
  showCounter = true,
  slideNumber,
  totalSlides,
  isEditing,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onChangeElementType,
  onDeleteElement,
  onDuplicateElement,
  onUpdateSlideBgPosition,
  onSetSlideLayout,
  scale,
  projectId,
}: SlideRendererProps) {
  const { resolveUrl, registerAssetUrl } = useAssetContext();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogTarget, setImageDialogTarget] = useState<string | null>(null);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const imageDragRef = useRef<{
    elementId: string;
    startX: number;
    startY: number;
    startObjX: number;
    startObjY: number;
  } | null>(null);
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  // "Crop mode" — double-click an image to enter, drag to reposition within the box
  const [cropModeId, setCropModeId] = useState<string | null>(null);
  const counter = `${String(slideNumber).padStart(2, '0')}/${String(totalSlides).padStart(2, '0')}`;

  const displayScale = scale ?? 0.375;
  const slideRef = useRef<HTMLDivElement>(null);

  const themeVars = themeToCSVars(theme);

  const handleImageClick = useCallback(
    (elementId: string) => {
      if (!isEditing) return;
      setImageDialogTarget(elementId);
      setImageDialogOpen(true);
    },
    [isEditing]
  );

  // Enter crop mode on double-click (Figma-like: drag to reposition image within box)
  const handleImageDoubleClick = useCallback(
    (elementId: string) => {
      const element = slide.elements.find((el) => el.id === elementId);
      if (!element || element.type !== 'image' || !element.src) return;
      if (!isEditing) return;
      setCropModeId(elementId);
    },
    [slide.elements, isEditing]
  );

  // Exit crop mode when clicking outside or selecting another element
  const prevSelectedRef = useRef(selectedElementId);
  if (prevSelectedRef.current !== selectedElementId) {
    prevSelectedRef.current = selectedElementId;
    if (cropModeId && selectedElementId !== cropModeId) {
      setCropModeId(null);
    }
  }

  // Exit crop mode on Escape key
  useEffect(() => {
    if (!cropModeId) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setCropModeId(null);
      }
    };
    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [cropModeId]);

  const handleImageSelected = useCallback(
    (src: string) => {
      if (!imageDialogTarget) return;
      const element = slide.elements.find((el) => el.id === imageDialogTarget);
      if (element && element.type === 'image') {
        onUpdateElement(imageDialogTarget, { ...element, src });
      }
    },
    [imageDialogTarget, slide.elements, onUpdateElement]
  );

  const selectedElement = slide.elements.find((el) => el.id === selectedElementId);

  const handleContentBlur = useCallback(
    (elementId: string, e: React.FocusEvent<HTMLElement>) => {
      const element = slide.elements.find((el) => el.id === elementId);
      if (element && 'content' in element) {
        onUpdateElement(elementId, { ...element, content: e.currentTarget.innerHTML } as SlideElement);
      }
    },
    [slide.elements, onUpdateElement]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  }, []);

  const handleImageDragStart = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      const element = slide.elements.find((el) => el.id === elementId);
      if (!element || element.type !== 'image' || !element.src) return;
      // Only start drag when in crop mode for this image
      if (!isEditing || cropModeId !== elementId) return;

      e.preventDefault();
      e.stopPropagation();

      const { x, y } = parseObjectPosition(element.objectPosition);
      imageDragRef.current = {
        elementId,
        startX: e.clientX,
        startY: e.clientY,
        startObjX: x,
        startObjY: y,
      };
      setDraggingImageId(elementId);

      const sensitivity = 0.15 / displayScale;

      const handleMouseMove = (ev: MouseEvent) => {
        const drag = imageDragRef.current;
        if (!drag) return;
        const dx = ev.clientX - drag.startX;
        const dy = ev.clientY - drag.startY;
        const newX = Math.min(100, Math.max(0, drag.startObjX - dx * sensitivity));
        const newY = Math.min(100, Math.max(0, drag.startObjY - dy * sensitivity));
        const pos = `${newX.toFixed(1)}% ${newY.toFixed(1)}%`;
        const el = slide.elements.find((e) => e.id === drag.elementId);
        if (el && el.type === 'image') {
          onUpdateElement(drag.elementId, { ...el, objectPosition: pos });
        }
      };

      const handleMouseUp = () => {
        imageDragRef.current = null;
        setDraggingImageId(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [slide.elements, isEditing, cropModeId, displayScale, onUpdateElement]
  );

  // ── Background image crop mode ──
  const BG_CROP_ID = '__bg_crop__';

  const handleSlideBgDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditing || !slide.backgroundImage || !onUpdateSlideBgPosition) return;
      // Only trigger if click was NOT inside an element
      let target = e.target as HTMLElement;
      while (target && target !== e.currentTarget) {
        if (target.hasAttribute('data-element-id')) return;
        target = target.parentElement!;
      }
      setCropModeId(BG_CROP_ID);
    },
    [isEditing, slide.backgroundImage, onUpdateSlideBgPosition]
  );

  const handleBgCropDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (cropModeId !== BG_CROP_ID || !slide.backgroundImage || !onUpdateSlideBgPosition) return;
      e.preventDefault();
      e.stopPropagation();

      const { x, y } = parseObjectPosition(slide.backgroundPosition);
      const startX = e.clientX;
      const startY = e.clientY;
      const sensitivity = 0.15 / displayScale;

      setDraggingImageId(BG_CROP_ID);

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const newX = Math.min(100, Math.max(0, x - dx * sensitivity));
        const newY = Math.min(100, Math.max(0, y - dy * sensitivity));
        onUpdateSlideBgPosition(`${newX.toFixed(1)}% ${newY.toFixed(1)}%`);
      };

      const handleMouseUp = () => {
        setDraggingImageId(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [cropModeId, slide.backgroundImage, slide.backgroundPosition, displayScale, onUpdateSlideBgPosition]
  );

  const isBgCropping = cropModeId === BG_CROP_ID;

  const handleFileDrop = useCallback(
    async (elementId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const { saveAsset } = await import('@/lib/projects');
        const filename = `assets/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        await saveAsset(projectId ?? '', filename, file);
        registerAssetUrl(filename, file);
        const element = slide.elements.find((el) => el.id === elementId);
        if (element && element.type === 'image') {
          onUpdateElement(elementId, { ...element, src: filename });
        }
      }
    },
    [projectId, registerAssetUrl, slide.elements, onUpdateElement]
  );

  // ── Layout conversion handlers ──────────────────────────────
  const handleConvertToFreeform = useCallback(() => {
    if (!onSetSlideLayout || !slideRef.current) return;
    const container = slideRef.current;
    const containerRect = container.getBoundingClientRect();
    const scaleX = 1080 / containerRect.width;
    const scaleY = 1440 / containerRect.height;

    const elementUpdates: Record<string, Partial<SlideElement>> = {};
    for (const el of slide.elements) {
      if (el.type === 'overlay') {
        elementUpdates[el.id] = { x: 0, y: 0, w: 1080, h: 1440 };
        continue;
      }
      const dom = container.querySelector(`[data-element-id="${el.id}"]`) as HTMLElement | null;
      if (dom) {
        const rect = dom.getBoundingClientRect();
        elementUpdates[el.id] = {
          x: Math.round((rect.left - containerRect.left) * scaleX),
          y: Math.round((rect.top - containerRect.top) * scaleY),
          w: Math.round(rect.width * scaleX),
          h: Math.round(rect.height * scaleY),
        };
      }
    }
    onSetSlideLayout('freeform', elementUpdates);
  }, [onSetSlideLayout, slide.elements]);

  const handleConvertToFlow = useCallback((targetLayout: SlideLayout) => {
    if (!onSetSlideLayout) return;
    onSetSlideLayout(targetLayout);
  }, [onSetSlideLayout]);

  const editableProps = (elementId: string) =>
    isEditing
      ? {
          contentEditable: true as const,
          suppressContentEditableWarning: true as const,
          onBlur: (e: React.FocusEvent<HTMLElement>) => handleContentBlur(elementId, e),
          onKeyDown: handleKeyDown,
        }
      : {};

  // Group consecutive list-items into a .list-items container
  const renderElementsGrouped = (elements: SlideElement[]) => {
    const groups: React.ReactNode[] = [];
    let listBatch: SlideElement[] = [];

    const flushList = () => {
      if (listBatch.length > 0) {
        groups.push(
          <div className="list-items" key={`list-group-${listBatch[0].id}`}>
            {listBatch.map(renderElement)}
          </div>
        );
        listBatch = [];
      }
    };

    for (const el of elements) {
      if (el.type === 'list-item') {
        listBatch.push(el);
      } else {
        flushList();
        groups.push(renderElement(el));
      }
    }
    flushList();
    return groups;
  };

  const renderElement = (element: SlideElement) => {
    const isSelected = selectedElementId === element.id;

    switch (element.type) {
      case 'tag':
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <div className="tag" style={getElementInlineStyle(element)} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
          </ElementWrapper>
        );

      case 'heading': {
        const Tag = `h${element.level}` as 'h1' | 'h2' | 'h3';
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <Tag style={getElementInlineStyle(element)} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
          </ElementWrapper>
        );
      }

      case 'paragraph':
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <p style={getElementInlineStyle(element)} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
          </ElementWrapper>
        );

      case 'subtitle':
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <p className="sub" style={getElementInlineStyle(element)} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
          </ElementWrapper>
        );

      case 'emoji':
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            {isEditing ? (
              <EmojiPicker
                trigger={
                  <div className="cover-emoji cursor-pointer" style={{ fontSize: element.size ?? 96 }}>
                    {element.content}
                  </div>
                }
                onEmojiSelected={(emoji) => onUpdateElement(element.id, { ...element, content: emoji })}
              />
            ) : (
              <div className="cover-emoji" style={{ fontSize: element.size ?? 96 }}>
                {element.content}
              </div>
            )}
          </ElementWrapper>
        );

      case 'image': {
        const isCropping = cropModeId === element.id;
        const img = element as ImageElement;
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <div
              className={element.variant === 'background' ? 'img-bg' : 'img-area'}
              style={{
                ...(img.borderRadius !== undefined ? { borderRadius: `${img.borderRadius}px` } : {}),
                ...(img.imageHeight !== undefined ? { height: `${img.imageHeight}px` } : {}),
                ...(isCropping ? { outline: '2px dashed var(--editor-accent)', outlineOffset: -2 } : {}),
              }}
            >
              {element.src ? (
                <img
                  src={resolveUrl(element.src)}
                  alt={element.alt ?? ''}
                  style={{
                    objectPosition: element.objectPosition,
                    cursor: isCropping ? (draggingImageId === element.id ? 'grabbing' : 'grab') : undefined,
                  }}
                  draggable={false}
                  onMouseDown={(e) => {
                    if (isCropping) {
                      handleImageDragStart(element.id, e);
                    }
                  }}
                  onDoubleClick={() => handleImageDoubleClick(element.id)}
                />
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 text-muted-foreground cursor-pointer"
                  style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)' }}
                  onClick={() => handleImageClick(element.id)}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => handleFileDrop(element.id, e)}
                >
                  {isEditing && (
                    <>
                      <Image className="size-8 opacity-40" />
                      <span style={{ fontSize: 24 }}>Clique ou arraste uma imagem</span>
                    </>
                  )}
                </div>
              )}
              {isEditing && element.src && (
                <button
                  type="button"
                  className="absolute bottom-2 right-2 rounded bg-card/80 px-2 py-1 text-xs text-muted-foreground opacity-0 shadow backdrop-blur transition-opacity group-hover/el:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(element.id);
                  }}
                  data-editor-control
                >
                  Trocar
                </button>
              )}
            </div>
          </ElementWrapper>
        );
      }

      case 'quote': {
        const qt = element as QuoteElement;
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <div className="quote-mark" style={{
              ...(qt.quoteMarkColor ? { color: qt.quoteMarkColor } : {}),
              ...(qt.quoteMarkSize !== undefined ? { fontSize: `${qt.quoteMarkSize}px` } : {}),
              ...(qt.quoteMarkOpacity !== undefined ? { opacity: qt.quoteMarkOpacity } : {}),
            }}>&ldquo;</div>
            <div className="quote-text" style={getElementInlineStyle(element)} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
            {element.attribution && (
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                &mdash; {element.attribution}
              </p>
            )}
          </ElementWrapper>
        );
      }

      case 'list-item': {
        const li = element as ListItemElement;
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <div className="list-item" style={getElementInlineStyle(element)}>
              {isEditing ? (
                <IconPicker
                  trigger={
                    element.icon?.startsWith('http') ? (
                      <img className="icon cursor-pointer" src={element.icon} alt="Icone" title="Trocar icone" draggable={false} style={{ width: li.iconSize ?? 48, height: li.iconSize ?? 48 }} />
                    ) : (
                      <span className="list-icon cursor-pointer" title="Trocar icone" style={{ width: li.iconSize ?? 48, height: li.iconSize ?? 48, ...(li.iconColor ? { color: li.iconColor } : {}) }}>
                        {element.icon || '\u25CF'}
                      </span>
                    )
                  }
                  onIconSelected={(icon) => onUpdateElement(element.id, { ...element, icon })}
                />
              ) : (
                element.icon?.startsWith('http') ? (
                  <img className="icon" src={element.icon} alt="Icone" draggable={false} style={{ width: li.iconSize ?? 48, height: li.iconSize ?? 48 }} />
                ) : (
                  <span className="list-icon" style={{ width: li.iconSize ?? 48, height: li.iconSize ?? 48, ...(li.iconColor ? { color: li.iconColor } : {}) }}>{element.icon || '\u25CF'}</span>
                )
              )}
              <span {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
            </div>
          </ElementWrapper>
        );
      }

      case 'highlight': {
        const hl = element as HighlightElement;
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <div className="highlight-block" style={{
              ...(hl.backgroundColor ? { background: hl.backgroundColor } : {}),
              ...(hl.borderColor ? { borderColor: hl.borderColor } : {}),
              ...(hl.borderRadius !== undefined ? { borderRadius: `${hl.borderRadius}px` } : {}),
              ...(hl.padding !== undefined ? { padding: `${hl.padding}px` } : {}),
            }}>
              <p style={getElementInlineStyle(element)} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
            </div>
          </ElementWrapper>
        );
      }

      case 'divider': {
        const div = element as DividerElement;
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <div className="divider-line" style={{
              ...(div.dividerColor ? { background: div.dividerColor } : {}),
              ...(div.dividerWidth !== undefined ? { width: `${div.dividerWidth}px` } : {}),
              ...(div.dividerHeight !== undefined ? { height: `${div.dividerHeight}px` } : {}),
              ...(div.borderRadius !== undefined ? { borderRadius: `${div.borderRadius}px` } : {}),
              ...(div.dividerOpacity !== undefined ? { opacity: div.dividerOpacity } : {}),
            }} />
          </ElementWrapper>
        );
      }

      case 'spacer':
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <div style={{ height: element.height }} />
          </ElementWrapper>
        );

      case 'overlay':
        // Fallback for freeform layout; flow overlays are rendered separately as full-slide covers
        return (
          <ElementWrapper key={element.id} element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined}>
            <div
              className="overlay-element"
              style={{
                background: element.fill,
                width: '100%',
                height: element.h ?? 200,
                borderRadius: 4,
                position: 'relative',
              }}
            />
          </ElementWrapper>
        );

      default:
        return null;
    }
  };

  const currentImageElement = imageDialogTarget
    ? slide.elements.find((el) => el.id === imageDialogTarget)
    : null;

  // Render freeform elements
  const renderFreeformElement = (element: SlideElement, arrayIndex: number) => {
    const isSelected = selectedElementId === element.id;

    const baseElement = (() => {
      const inlineStyle = getElementInlineStyle(element);

      switch (element.type) {
        case 'tag':
          return (
            <div className="tag" style={inlineStyle} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
          );

        case 'heading': {
          const Tag = `h${element.level}` as 'h1' | 'h2' | 'h3';
          return (
            <Tag style={inlineStyle} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
          );
        }

        case 'paragraph':
          return (
            <p style={inlineStyle} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
          );

        case 'subtitle':
          return (
            <p className="sub" style={inlineStyle} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
          );

        case 'emoji':
          return isEditing ? (
            <EmojiPicker
              trigger={
                <div className="cover-emoji cursor-pointer" style={{ fontSize: element.size ?? 96 }}>
                  {element.content}
                </div>
              }
              onEmojiSelected={(emoji) => onUpdateElement(element.id, { ...element, content: emoji })}
            />
          ) : (
            <div className="cover-emoji" style={{ fontSize: element.size ?? 96 }}>
              {element.content}
            </div>
          );

        case 'image': {
          const isCroppingFreeform = cropModeId === element.id;
          return (
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              borderRadius: element.borderRadius !== undefined ? `${element.borderRadius}px` : '16px',
              overflow: 'hidden',
              ...(isCroppingFreeform ? { outline: '2px dashed var(--editor-accent)', outlineOffset: -2 } : {}),
            }}>
              {element.src ? (
                <img
                  src={resolveUrl(element.src)}
                  alt={element.alt ?? ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: element.objectPosition ?? 'center',
                    cursor: isCroppingFreeform ? (draggingImageId === element.id ? 'grabbing' : 'grab') : undefined,
                  }}
                  draggable={false}
                  onMouseDown={(e) => {
                    if (isCroppingFreeform) {
                      handleImageDragStart(element.id, e);
                    }
                  }}
                  onDoubleClick={() => handleImageDoubleClick(element.id)}
                />
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 text-muted-foreground cursor-pointer"
                  style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.15)' }}
                  onClick={() => handleImageClick(element.id)}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => handleFileDrop(element.id, e)}
                >
                  {isEditing && (
                    <>
                      <Image className="size-8 opacity-40" />
                      <span style={{ fontSize: 24 }}>Clique ou arraste uma imagem</span>
                    </>
                  )}
                </div>
              )}
              {isEditing && element.src && (
                <button
                  type="button"
                  className="absolute bottom-2 right-2 rounded bg-card/80 px-2 py-1 text-xs text-muted-foreground opacity-0 shadow backdrop-blur transition-opacity group-hover/el:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(element.id);
                  }}
                  data-editor-control
                >
                  Trocar
                </button>
              )}
            </div>
          );
        }

        case 'quote': {
          const fqt = element as QuoteElement;
          return (
            <div>
              <div className="quote-mark" style={{
                ...(fqt.quoteMarkColor ? { color: fqt.quoteMarkColor } : {}),
                ...(fqt.quoteMarkSize !== undefined ? { fontSize: `${fqt.quoteMarkSize}px` } : {}),
                ...(fqt.quoteMarkOpacity !== undefined ? { opacity: fqt.quoteMarkOpacity } : {}),
              }}>&ldquo;</div>
              <div className="quote-text" style={getElementInlineStyle(element)} {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
              {element.attribution && (
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  &mdash; {element.attribution}
                </p>
              )}
            </div>
          );
        }

        case 'list-item': {
          const fli = element as ListItemElement;
          return (
            <div className="list-item" style={getElementInlineStyle(element)}>
              {isEditing ? (
                <IconPicker
                  trigger={
                    element.icon?.startsWith('http') ? (
                      <img className="icon cursor-pointer" src={element.icon} alt="Icone" title="Trocar icone" draggable={false} style={{ width: fli.iconSize ?? 48, height: fli.iconSize ?? 48 }} />
                    ) : (
                      <span className="list-icon cursor-pointer" title="Trocar icone" style={{ width: fli.iconSize ?? 48, height: fli.iconSize ?? 48, ...(fli.iconColor ? { color: fli.iconColor } : {}) }}>
                        {element.icon || '\u25CF'}
                      </span>
                    )
                  }
                  onIconSelected={(icon) => onUpdateElement(element.id, { ...element, icon })}
                />
              ) : (
                element.icon?.startsWith('http') ? (
                  <img className="icon" src={element.icon} alt="Icone" draggable={false} style={{ width: fli.iconSize ?? 48, height: fli.iconSize ?? 48 }} />
                ) : (
                  <span className="list-icon" style={{ width: fli.iconSize ?? 48, height: fli.iconSize ?? 48, ...(fli.iconColor ? { color: fli.iconColor } : {}) }}>{element.icon || '\u25CF'}</span>
                )
              )}
              <span {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
            </div>
          );
        }

        case 'highlight': {
          const fhl = element as HighlightElement;
          return (
            <div className="highlight-block" style={{
              ...(fhl.backgroundColor ? { background: fhl.backgroundColor } : {}),
              ...(fhl.borderColor ? { borderColor: fhl.borderColor } : {}),
              ...(fhl.borderRadius !== undefined ? { borderRadius: `${fhl.borderRadius}px` } : {}),
              ...(fhl.padding !== undefined ? { padding: `${fhl.padding}px` } : {}),
            }}>
              <p {...editableProps(element.id)} dangerouslySetInnerHTML={{ __html: element.content }} />
            </div>
          );
        }

        case 'divider': {
          const fdiv = element as DividerElement;
          return <div className="divider-line" style={{
            ...(fdiv.dividerColor ? { background: fdiv.dividerColor } : {}),
            ...(fdiv.dividerWidth !== undefined ? { width: `${fdiv.dividerWidth}px` } : {}),
            ...(fdiv.dividerHeight !== undefined ? { height: `${fdiv.dividerHeight}px` } : {}),
            ...(fdiv.borderRadius !== undefined ? { borderRadius: `${fdiv.borderRadius}px` } : {}),
            ...(fdiv.dividerOpacity !== undefined ? { opacity: fdiv.dividerOpacity } : {}),
          }} />;
        }

        case 'spacer':
          return <div style={{ height: element.height }} />;

        case 'overlay':
          return (
            <div
              className="overlay-element"
              style={{
                background: element.fill,
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            />
          );

        default:
          return null;
      }
    })();

    if (!baseElement) return null;

    // Opacity is applied on the FreeformElement wrapper (not inner element)
    const freeformWrapperStyle: React.CSSProperties = {};
    if (element.opacity !== undefined) freeformWrapperStyle.opacity = element.opacity;
    const hasWrapperStyle = Object.keys(freeformWrapperStyle).length > 0;

    return (
      <FreeformElement
        key={element.id}
        element={element}
        layerIndex={arrayIndex}
        scale={displayScale}
        isEditing={isEditing}
        isSelected={isSelected}
        onSelect={() => onSelectElement(element.id)}
        onUpdate={(updatedElement) => onUpdateElement(element.id, updatedElement)}
        otherElements={slide.elements}
        onGuidesChange={setGuides}
      >
        {hasWrapperStyle ? <div style={freeformWrapperStyle}>{baseElement}</div> : baseElement}
      </FreeformElement>
    );
  };

  const isFreeform = slide.layout === 'freeform';

  return (
    <>
      {/* Layout mode toggle — above the slide */}
      {isEditing && onSetSlideLayout && (
        <div className="mb-2 flex justify-center" data-editor-control>
          <div className="inline-flex h-8 items-center rounded-lg bg-muted p-0.5 text-muted-foreground">
            <button
              type="button"
              onClick={() => { if (isFreeform) handleConvertToFlow('full-text'); }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                !isFreeform ? "bg-background text-foreground shadow-sm" : "hover:text-foreground/80"
              )}
            >
              <LayoutGrid className="size-3" />
              Layout
            </button>
            <button
              type="button"
              onClick={() => { if (!isFreeform) handleConvertToFreeform(); }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                isFreeform ? "bg-background text-foreground shadow-sm" : "hover:text-foreground/80"
              )}
            >
              <Move className="size-3" />
              Freeform
            </button>
          </div>
        </div>
      )}

      <div
        className="slide-wrapper"
        style={{
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          ref={slideRef}
          data-slide-index={slideNumber - 1}
          className={cn(
            "slide-renderer slide",
            slide.layout === 'freeform' && "slide-freeform"
          )}
          style={{
            ...themeToStyle(themeVars),
            ...(slide.background ? { background: slide.background } : {}),
            ...(slide.backgroundImage ? { backgroundImage: `url(${resolveUrl(slide.backgroundImage)})`, backgroundSize: 'cover', backgroundPosition: slide.backgroundPosition ?? 'center' } : {}),
            ...(isBgCropping ? { outline: '2px dashed var(--editor-accent)', outlineOffset: -2 } : {}),
            width: 1080,
            height: 1440,
            zoom: displayScale,
          }}
          onClick={() => { if (!isBgCropping) onSelectElement(null); }}
          onDoubleClick={handleSlideBgDoubleClick}
        >
          {/* Background crop overlay — captures all mouse events when in bg crop mode */}
          {isBgCropping && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 99999,
                cursor: draggingImageId === BG_CROP_ID ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleBgCropDragStart}
              data-editor-control
            />
          )}

          {/* Header */}
          <div className="hd" style={slide.layout === 'freeform' ? { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 } : undefined}>
            <span>{handle}</span>
            {showCounter && <span className="slide-counter">{counter}</span>}
          </div>

          {/* Content */}
          {slide.layout === 'freeform' ? (
            <>
              {/* Freeform layout: absolute positioning, covers entire slide */}
              <div style={{ position: 'absolute', inset: 0 }}>
                {slide.elements.map(renderFreeformElement)}
              </div>
              {/* Smart guides overlay */}
              {isEditing && <SmartGuideOverlay guides={guides} />}
              {/* Footer on top of freeform content */}
              <div className="ft" style={{ justifyContent: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
                <span className="ft-theme">{footer}</span>
              </div>
            </>
          ) : (
            <>
              {/* Regular flow layout */}
              {/* Overlays rendered as absolute full-slide covers behind content */}
              {slide.elements.filter(el => el.type === 'overlay').map(element => {
                const isSelected = selectedElementId === element.id;
                const overlayEl = element as OverlayElement;
                return (
                  <div key={element.id} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <ElementWrapper element={element} isEditing={isEditing} isSelected={isSelected} onSelect={() => onSelectElement(element.id)} onDuplicate={onDuplicateElement ? () => onDuplicateElement(element.id) : undefined} onDelete={onDeleteElement ? () => onDeleteElement(element.id) : undefined} className="h-full">
                      <div className="overlay-element" style={{ background: overlayEl.fill, width: '100%', height: '100%' }} />
                    </ElementWrapper>
                  </div>
                );
              })}
              {/* Non-overlay content above overlays */}
              <div className="sc" style={{ position: 'relative', zIndex: 1 }}>{renderElementsGrouped(slide.elements.filter(el => el.type !== 'overlay'))}</div>
              {/* Footer */}
              <div className="ft" style={{ justifyContent: 'center' }}>
                <span className="ft-theme">{footer}</span>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Selection bubble toolbar — appears above text selection */}
      {isEditing && selectedElementId && (
        <SelectionToolbar
          onBeforeFormat={() => {
            if (!selectedElementId) return;
            const element = slide.elements.find((el) => el.id === selectedElementId);
            if (element && 'content' in element) {
              const domEl = document.querySelector(`[data-element-id="${selectedElementId}"] [contenteditable]`) as HTMLElement
                || document.querySelector(`[data-element-id="${selectedElementId}"][contenteditable]`) as HTMLElement;
              if (domEl) {
                onUpdateElement(selectedElementId, { ...element, content: domEl.innerHTML } as SlideElement);
              }
            }
          }}
          onAfterFormat={() => {
            if (!selectedElementId) return;
            const element = slide.elements.find((el) => el.id === selectedElementId);
            if (element && 'content' in element) {
              const domEl = document.querySelector(`[data-element-id="${selectedElementId}"] [contenteditable]`) as HTMLElement
                || document.querySelector(`[data-element-id="${selectedElementId}"][contenteditable]`) as HTMLElement;
              if (domEl) {
                onUpdateElement(selectedElementId, { ...element, content: domEl.innerHTML } as SlideElement);
              }
            }
          }}
        />
      )}

      {/* Image dialog */}
      <ImageDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onImageSelected={handleImageSelected}
        currentSrc={currentImageElement?.type === 'image' ? currentImageElement.src : undefined}
        projectId={projectId ?? ''}
      />
    </>
  );
}

export const SlideRenderer = memo(SlideRendererComponent);
