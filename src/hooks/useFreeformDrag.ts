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

  // Refs to avoid stale closures in document-level event handlers
  const elementRef = useRef(element);
  elementRef.current = element;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const otherElementsRef = useRef(otherElements);
  otherElementsRef.current = otherElements;
  const onGuidesChangeRef = useRef(onGuidesChange);
  onGuidesChangeRef.current = onGuidesChange;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  // Cleanup ref to remove stale listeners from previous drag sessions
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleDragStart = useCallback((e: React.MouseEvent, mode: 'drag' | 'resize') => {
    // Clean up any stale listeners from a previous session that didn't get a mouseup
    cleanupRef.current?.();
    cleanupRef.current = null;

    e.stopPropagation();

    const el = elementRef.current;
    const state = dragState.current;
    // Don't activate drag/resize yet — wait for movement threshold
    state.isDragging = false;
    state.isResizing = false;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.startElementX = el.x ?? 0;
    state.startElementY = el.y ?? 0;
    state.startElementW = el.w ?? 200;
    state.startElementH = el.h ?? 50;

    const THRESHOLD = 4; // px before drag is considered real

    const handleMouseMove = (ev: MouseEvent) => {
      const state = dragState.current;
      const dx = ev.clientX - state.startX;
      const dy = ev.clientY - state.startY;

      // Activate drag only after exceeding movement threshold
      if (!state.isDragging && !state.isResizing) {
        if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
        state.isDragging = mode === 'drag';
        state.isResizing = mode === 'resize';
        document.body.style.cursor = mode === 'drag' ? 'grabbing' : 'se-resize';
      }

      // Prevent text selection during active drag
      ev.preventDefault();

      const currentElement = elementRef.current;
      const currentScale = scaleRef.current;

      // Convert screen coordinates to slide coordinates
      const deltaX = dx / currentScale;
      const deltaY = dy / currentScale;

      if (state.isDragging) {
        // Drag: update position
        const rawX = state.startElementX + deltaX;
        const rawY = state.startElementY + deltaY;
        const elW = currentElement.w ?? 200;
        const elH = currentElement.h ?? 50;

        // Smart guide snapping
        const others = (otherElementsRef.current ?? [])
          .filter((el) => el.id !== currentElement.id)
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

        onGuidesChangeRef.current?.(guideResult.guides);

        onUpdateRef.current({
          ...currentElement,
          x: Math.round(newX),
          y: Math.round(newY),
        });
      } else if (state.isResizing) {
        // Resize: update width and height
        const newW = Math.max(100, state.startElementW + deltaX);
        const newH = Math.max(50, state.startElementH + deltaY);

        onUpdateRef.current({
          ...currentElement,
          w: Math.round(newW),
          h: Math.round(newH),
        });
      }
    };

    const cleanup = () => {
      const state = dragState.current;
      const wasActive = state.isDragging || state.isResizing;
      state.isDragging = false;
      state.isResizing = false;

      onGuidesChangeRef.current?.([]);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', cleanup);
      if (wasActive) document.body.style.cursor = '';
      cleanupRef.current = null;
    };

    cleanupRef.current = cleanup;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', cleanup);
  }, []);

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
