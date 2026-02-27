'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';
import type { SlideElement } from '@/types/schema';
import type { GuideLine } from '@/hooks/useSmartGuides';
import { useFreeformDrag } from '@/hooks/useFreeformDrag';
import { cn } from '@/lib/utils';

interface FreeformElementProps {
  element: SlideElement;
  layerIndex: number;
  scale: number;
  isEditing: boolean;
  isSelected: boolean;
  isTextEditing?: boolean;
  onSelect: () => void;
  onEnterTextEdit?: () => void;
  onUpdate: (element: SlideElement) => void;
  otherElements?: SlideElement[];
  onGuidesChange?: (guides: GuideLine[]) => void;
  children: React.ReactNode;
}

export function FreeformElement({
  element,
  layerIndex,
  scale,
  isEditing,
  isSelected,
  isTextEditing,
  onSelect,
  onEnterTextEdit,
  onUpdate,
  otherElements,
  onGuidesChange,
  children,
}: FreeformElementProps) {
  const isOverlay = element.type === 'overlay';

  const { startDrag, startResize } = useFreeformDrag({
    element,
    scale,
    onUpdate,
    otherElements,
    onGuidesChange,
  });

  // Default positioning for new freeform elements
  const x = element.x ?? 80;
  const y = element.y ?? 200;
  const w = element.w ?? 920;
  const h = element.h; // undefined means auto-height
  const rotation = element.rotation ?? 0;

  const style: React.CSSProperties = {
    left: x,
    top: y,
    width: w,
    zIndex: layerIndex,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    textAlign: element.textAlign,
    ...(isOverlay ? { pointerEvents: 'none' } : {}),
    // Override CSS cursor: move when in text editing mode
    ...(isTextEditing ? { cursor: 'text', userSelect: 'text' } : {}),
  };

  if (h) {
    style.height = h;
  }

  return (
    <div
      className={cn(
        'freeform-element',
        isSelected && 'selected',
        isEditing && !isSelected && !isOverlay && 'cursor-pointer',
        isSelected && !isTextEditing && 'cursor-default',
        isSelected && isTextEditing && 'cursor-text',
      )}
      style={style}
      data-element-id={element.id}
      onClick={(e) => {
        if (isOverlay) return;
        if (isEditing) {
          e.stopPropagation();
          if (!isSelected) {
            onSelect();
          }
        }
      }}
      onDoubleClick={(e) => {
        if (isEditing && onEnterTextEdit && !isTextEditing) {
          e.stopPropagation();
          onEnterTextEdit();
        }
      }}
      onMouseDown={(e) => {
        if (isOverlay) return;
        if (!isEditing || !isSelected) return;
        // Don't drag while in text editing mode
        if (isTextEditing) return;
        // Don't initiate drag on double-click (let onDoubleClick handle it)
        if (e.detail >= 2) return;
        // Don't interfere with contentEditable, resize handle, or drag handle
        const target = e.target as HTMLElement;
        if (
          target.closest('[contenteditable]') ||
          target.closest('.resize-handle') ||
          target.closest('.drag-handle')
        ) return;
        startDrag(e);
      }}
    >
      {children}

      {/* Drag handle — hidden for overlays (click-through) */}
      {isEditing && !isOverlay && (
        <div
          className="drag-handle"
          data-editor-control
          onMouseDown={startDrag}
          title="Arrastar para mover"
        >
          <GripVertical />
        </div>
      )}

      {/* Resize handle — hidden for overlays (click-through) */}
      {isEditing && !isOverlay && (
        <div
          className="resize-handle"
          data-editor-control
          onMouseDown={startResize}
          title="Arrastar para redimensionar"
        />
      )}
    </div>
  );
}
