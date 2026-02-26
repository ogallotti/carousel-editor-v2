// ============================================================
// Editor State Types
// ============================================================

import type { CarouselSchema, Slide, SlideElement, Theme } from './schema';

export interface EditorState {
  carousel: CarouselSchema;
  selectedSlideIndex: number;
  selectedElementId: string | null;
  isPreviewMode: boolean;
  isDirty: boolean;
  undoStack: CarouselSchema[];
  redoStack: CarouselSchema[];
  viewMode: 'horizontal' | 'grid';
  zoom: number;
}

export type EditorAction =
  | { type: 'SET_CAROUSEL'; payload: CarouselSchema }
  | { type: 'SELECT_SLIDE'; payload: number }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'UPDATE_SLIDE'; payload: { index: number; slide: Slide } }
  | { type: 'ADD_SLIDE'; payload: { afterIndex: number; slide: Slide } }
  | { type: 'DELETE_SLIDE'; payload: number }
  | { type: 'MOVE_SLIDE'; payload: { from: number; to: number } }
  | { type: 'DUPLICATE_SLIDE'; payload: number }
  | { type: 'UPDATE_ELEMENT'; payload: { slideIndex: number; elementId: string; element: SlideElement } }
  | { type: 'ADD_ELEMENT'; payload: { slideIndex: number; afterElementId: string | null; element: SlideElement } }
  | { type: 'DELETE_ELEMENT'; payload: { slideIndex: number; elementId: string } }
  | { type: 'DUPLICATE_ELEMENT'; payload: { slideIndex: number; elementId: string } }
  | { type: 'MOVE_ELEMENT'; payload: { slideIndex: number; elementId: string; direction: 'up' | 'down' } }
  | { type: 'REORDER_ELEMENT'; payload: { slideIndex: number; elementId: string; newIndex: number } }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_FOOTER'; payload: string }
  | { type: 'SET_HANDLE'; handle: string }
  | { type: 'SET_SHOW_COUNTER'; show: boolean }
  | { type: 'SET_SLIDE_BG'; payload: { slideIndex: number; color: string | undefined } }
  | { type: 'SET_SLIDE_BG_IMAGE'; payload: { slideIndex: number; image: string | undefined } }
  | { type: 'SET_SLIDE_BG_POSITION'; payload: { slideIndex: number; position: string | undefined } }
  | { type: 'TOGGLE_PREVIEW'; payload?: undefined }
  | { type: 'SET_VIEW_MODE'; payload: 'horizontal' | 'grid' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'UNDO'; payload?: undefined }
  | { type: 'REDO'; payload?: undefined }
  | { type: 'MARK_SAVED'; payload?: undefined };
