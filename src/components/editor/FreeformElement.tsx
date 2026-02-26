'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';
import type { SlideElement } from '@/types/schema';
import type { GuideLine } from '@/hooks/useSmartGuides';
import { useFreeformDrag } from '@/hooks/useFreeformDrag';
import { cn } from '@/lib/utils';

interface FreeformElementProps {
  element: SlideElement;
  scale: number;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (element: SlideElement) => void;
  otherElements?: SlideElement[];
  onGuidesChange?: (guides: GuideLine[]) => void;
  children: React.ReactNode;
}

export function FreeformElement({
  element,
  scale,
  isEditing,
  isSelected,
  onSelect,
  onUpdate,
  otherElements,
  onGuidesChange,
  children,
}: FreeformElementProps) {
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
  const zIndex = element.zIndex ?? 0;

  const style: React.CSSProperties = {
    left: x,
    top: y,
    width: w,
    zIndex: zIndex,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    textAlign: element.textAlign,
  };

  if (h) {
    style.height = h;
  }

  return (
    <div
      className={cn(
        'freeform-element',
        isSelected && 'selected',
        isEditing && !isSelected && 'cursor-pointer'
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
      onMouseDown={(e) => {
        if (!isEditing || !isSelected) return;
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

      {/* Drag handle */}
      {isEditing && (
        <div
          className="drag-handle"
          onMouseDown={startDrag}
          title="Arrastar para mover"
        >
          <GripVertical />
        </div>
      )}

      {/* Resize handle */}
      {isEditing && (
        <div
          className="resize-handle"
          onMouseDown={startResize}
          title="Arrastar para redimensionar"
        />
      )}
    </div>
  );
}
