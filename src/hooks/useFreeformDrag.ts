'use client';

import { useCallback, useRef } from 'react';
import type { SlideElement } from '@/types/schema';
import { calculateSmartGuides, type GuideLine } from '@/hooks/useSmartGuides';

interface UseFreeformDragProps {
  element: SlideElement;
  scale: number;
  onUpdate: (element: SlideElement) => void;
  otherElements?: SlideElement[];
  onGuidesChange?: (guides: GuideLine[]) => void;
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
  startElementW: number;
  startElementH: number;
}

export function useFreeformDrag({ element, scale, onUpdate, otherElements, onGuidesChange }: UseFreeformDragProps) {
  const dragState = useRef<DragState>({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
    startElementW: 0,
    startElementH: 0,
  });

  const handleDragStart = useCallback((e: React.MouseEvent, mode: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();

    const state = dragState.current;
    state.isDragging = mode === 'drag';
    state.isResizing = mode === 'resize';
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.startElementX = element.x ?? 0;
    state.startElementY = element.y ?? 0;
    state.startElementW = element.w ?? 200;
    state.startElementH = element.h ?? 50;

    const handleMouseMove = (e: MouseEvent) => {
      const state = dragState.current;
      if (!state.isDragging && !state.isResizing) return;

      // Convert screen coordinates to slide coordinates
      const deltaX = (e.clientX - state.startX) / scale;
      const deltaY = (e.clientY - state.startY) / scale;

      if (state.isDragging) {
        // Drag: update position
        const rawX = state.startElementX + deltaX;
        const rawY = state.startElementY + deltaY;
        const elW = element.w ?? 200;
        const elH = element.h ?? 50;

        // Smart guide snapping
        const others = (otherElements ?? [])
          .filter((el) => el.id !== element.id)
          .map((el) => ({
            x: el.x ?? 0,
            y: el.y ?? 0,
            w: el.w ?? 200,
            h: el.h ?? 50,
          }));

        const guideResult = calculateSmartGuides(
          { x: rawX, y: rawY, w: elW, h: elH },
          others,
        );

        const newX = Math.max(0, Math.min(1080 - elW, guideResult.snappedX));
        const newY = Math.max(0, Math.min(1440 - elH, guideResult.snappedY));

        onGuidesChange?.(guideResult.guides);

        onUpdate({
          ...element,
          x: Math.round(newX),
          y: Math.round(newY),
        });
      } else if (state.isResizing) {
        // Resize: update width and height
        const newW = Math.max(100, state.startElementW + deltaX);
        const newH = Math.max(50, state.startElementH + deltaY);

        onUpdate({
          ...element,
          w: Math.round(newW),
          h: Math.round(newH),
        });
      }
    };

    const handleMouseUp = () => {
      const state = dragState.current;
      state.isDragging = false;
      state.isResizing = false;

      onGuidesChange?.([]);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Set cursor
    document.body.style.cursor = mode === 'drag' ? 'grabbing' : 'se-resize';
  }, [element, scale, onUpdate, otherElements, onGuidesChange]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    handleDragStart(e, 'drag');
  }, [handleDragStart]);

  const startResize = useCallback((e: React.MouseEvent) => {
    handleDragStart(e, 'resize');
  }, [handleDragStart]);

  return {
    startDrag,
    startResize,
  };
}
