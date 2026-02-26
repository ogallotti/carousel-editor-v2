'use client';

import { useReducer, useCallback, useMemo } from 'react';
import type { CarouselSchema, Slide, SlideElement, SlideLayout, Theme } from '@/types/schema';
import type { EditorState, EditorAction } from '@/types/editor';
import { DEFAULT_THEME_DARK, createEmptySchema } from '@/types/schema';
import { nanoid } from '@/lib/nanoid';

const MAX_UNDO = 50;

function createInitialState(carousel?: CarouselSchema): EditorState {
  const defaultCarousel = carousel ?? createEmptySchema(nanoid());

  return {
    carousel: defaultCarousel,
    selectedSlideIndex: 0,
    selectedElementId: null,
    isPreviewMode: false,
    isDirty: false,
    undoStack: [],
    redoStack: [],
    viewMode: 'horizontal',
    zoom: 1,
  };
}

function pushUndo(state: EditorState): EditorState {
  const undoStack = [...state.undoStack, structuredClone(state.carousel)].slice(-MAX_UNDO);
  return { ...state, undoStack, redoStack: [], isDirty: true };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_CAROUSEL':
      return { ...createInitialState(action.payload), viewMode: state.viewMode, zoom: state.zoom };

    case 'SELECT_SLIDE':
      return { ...state, selectedSlideIndex: action.payload, selectedElementId: null };

    case 'SELECT_ELEMENT':
      return { ...state, selectedElementId: action.payload };

    case 'UPDATE_SLIDE': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      slides[action.payload.index] = action.payload.slide;
      return { ...s, carousel: { ...s.carousel, slides } };
    }

    case 'ADD_SLIDE': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      slides.splice(action.payload.afterIndex + 1, 0, action.payload.slide);
      return {
        ...s,
        carousel: { ...s.carousel, slides },
        selectedSlideIndex: action.payload.afterIndex + 1,
      };
    }

    case 'DELETE_SLIDE': {
      if (state.carousel.slides.length <= 1) return state;
      const s = pushUndo(state);
      const slides = s.carousel.slides.filter((_, i) => i !== action.payload);
      const newIndex = Math.min(s.selectedSlideIndex, slides.length - 1);
      return { ...s, carousel: { ...s.carousel, slides }, selectedSlideIndex: newIndex };
    }

    case 'MOVE_SLIDE': {
      const { from, to } = action.payload;
      if (from === to) return state;
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      const [moved] = slides.splice(from, 1);
      slides.splice(to, 0, moved);
      return { ...s, carousel: { ...s.carousel, slides }, selectedSlideIndex: to };
    }

    case 'DUPLICATE_SLIDE': {
      const s = pushUndo(state);
      const original = s.carousel.slides[action.payload];
      if (!original) return state;
      const clone: Slide = structuredClone(original);
      clone.id = nanoid();
      clone.elements = clone.elements.map((el) => ({ ...el, id: nanoid() }));
      const slides = [...s.carousel.slides];
      slides.splice(action.payload + 1, 0, clone);
      return { ...s, carousel: { ...s.carousel, slides }, selectedSlideIndex: action.payload + 1 };
    }

    case 'UPDATE_ELEMENT': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      const slide = { ...slides[action.payload.slideIndex] };
      slide.elements = slide.elements.map((el) =>
        el.id === action.payload.elementId ? action.payload.element : el,
      );
      slides[action.payload.slideIndex] = slide;
      return { ...s, carousel: { ...s.carousel, slides } };
    }

    case 'ADD_ELEMENT': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      const slide = { ...slides[action.payload.slideIndex] };
      const elements = [...slide.elements];
      if (action.payload.element.type === 'overlay') {
        // Overlays go to the bottom of the element stack (position 0)
        elements.unshift(action.payload.element);
      } else if (action.payload.afterElementId) {
        const idx = elements.findIndex((el) => el.id === action.payload.afterElementId);
        elements.splice(idx + 1, 0, action.payload.element);
      } else {
        elements.push(action.payload.element);
      }
      slide.elements = elements;
      slides[action.payload.slideIndex] = slide;
      return { ...s, carousel: { ...s.carousel, slides }, selectedElementId: action.payload.element.id };
    }

    case 'DELETE_ELEMENT': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      const slide = { ...slides[action.payload.slideIndex] };
      slide.elements = slide.elements.filter((el) => el.id !== action.payload.elementId);
      slides[action.payload.slideIndex] = slide;
      return { ...s, carousel: { ...s.carousel, slides }, selectedElementId: null };
    }

    case 'DUPLICATE_ELEMENT': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      const slide = { ...slides[action.payload.slideIndex] };
      const elements = [...slide.elements];
      const idx = elements.findIndex((el) => el.id === action.payload.elementId);
      if (idx === -1) return state;
      const original = elements[idx];
      const clone = { ...original, id: nanoid() };
      elements.splice(idx + 1, 0, clone);
      slide.elements = elements;
      slides[action.payload.slideIndex] = slide;
      return { ...s, carousel: { ...s.carousel, slides }, selectedElementId: clone.id };
    }

    case 'MOVE_ELEMENT': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      const slide = { ...slides[action.payload.slideIndex] };
      const elements = [...slide.elements];
      const idx = elements.findIndex((el) => el.id === action.payload.elementId);
      if (idx === -1) return state;
      const newIdx = action.payload.direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= elements.length) return state;
      [elements[idx], elements[newIdx]] = [elements[newIdx], elements[idx]];
      slide.elements = elements;
      slides[action.payload.slideIndex] = slide;
      return { ...s, carousel: { ...s.carousel, slides } };
    }

    case 'REORDER_ELEMENT': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      const slide = { ...slides[action.payload.slideIndex] };
      const elements = [...slide.elements];
      const fromIdx = elements.findIndex((el) => el.id === action.payload.elementId);
      if (fromIdx === -1) return state;
      const [moved] = elements.splice(fromIdx, 1);
      elements.splice(action.payload.newIndex, 0, moved);
      slide.elements = elements;
      slides[action.payload.slideIndex] = slide;
      return { ...s, carousel: { ...s.carousel, slides } };
    }

    case 'SET_THEME': {
      const s = pushUndo(state);
      return { ...s, carousel: { ...s.carousel, theme: action.payload } };
    }

    case 'SET_FOOTER': {
      const s = pushUndo(state);
      return { ...s, carousel: { ...s.carousel, footer: { ...s.carousel.footer, text: action.payload } } };
    }

    case 'SET_HANDLE': {
      const s = pushUndo(state);
      return { ...s, carousel: { ...s.carousel, header: { ...s.carousel.header, handle: action.handle } } };
    }

    case 'SET_SHOW_COUNTER': {
      const s = pushUndo(state);
      return { ...s, carousel: { ...s.carousel, header: { ...s.carousel.header, showCounter: action.show } } };
    }

    case 'SET_SLIDE_BG': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      slides[action.payload.slideIndex] = {
        ...slides[action.payload.slideIndex],
        background: action.payload.color ?? null,
      };
      return { ...s, carousel: { ...s.carousel, slides } };
    }

    case 'SET_SLIDE_BG_IMAGE': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      slides[action.payload.slideIndex] = {
        ...slides[action.payload.slideIndex],
        backgroundImage: action.payload.image ?? null,
      };
      return { ...s, carousel: { ...s.carousel, slides } };
    }

    case 'SET_SLIDE_BG_POSITION': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      slides[action.payload.slideIndex] = {
        ...slides[action.payload.slideIndex],
        backgroundPosition: action.payload.position ?? undefined,
      };
      return { ...s, carousel: { ...s.carousel, slides } };
    }

    case 'SET_SLIDE_LAYOUT': {
      const s = pushUndo(state);
      const slides = [...s.carousel.slides];
      const slide = { ...slides[action.payload.slideIndex] };
      const toFreeform = action.payload.layout === 'freeform';

      slide.layout = action.payload.layout;
      slide.elements = slide.elements.map((el): SlideElement => {
        if (toFreeform) {
          // Apply calculated positions from DOM (or defaults for overlays)
          const updates = action.payload.elementUpdates?.[el.id];
          if (updates) return { ...el, ...updates } as SlideElement;
          // Overlay fallback: full-slide
          if (el.type === 'overlay') return { ...el, x: 0, y: 0, w: 1080, h: 1440 };
          return el;
        } else {
          // Freeform → Flow: strip freeform-specific props
          const cleaned = { ...el };
          delete cleaned.x;
          delete cleaned.y;
          delete cleaned.w;
          delete cleaned.h;
          delete cleaned.rotation;
          delete cleaned.zIndex;
          return cleaned as SlideElement;
        }
      });

      // Ensure overlays are always at the bottom of the stack (position 0)
      const overlays = slide.elements.filter((el) => el.type === 'overlay');
      const nonOverlays = slide.elements.filter((el) => el.type !== 'overlay');
      slide.elements = [...overlays, ...nonOverlays];

      slides[action.payload.slideIndex] = slide;
      return { ...s, carousel: { ...s.carousel, slides }, selectedElementId: null };
    }

    case 'TOGGLE_PREVIEW':
      return { ...state, isPreviewMode: !state.isPreviewMode };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const undoStack = [...state.undoStack];
      const previous = undoStack.pop()!;
      const redoStack = [...state.redoStack, structuredClone(state.carousel)];
      return { ...state, carousel: previous, undoStack, redoStack, isDirty: true };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const redoStack = [...state.redoStack];
      const next = redoStack.pop()!;
      const undoStack = [...state.undoStack, structuredClone(state.carousel)];
      return { ...state, carousel: next, undoStack, redoStack, isDirty: true };
    }

    case 'MARK_SAVED':
      return { ...state, isDirty: false };

    default:
      return state;
  }
}

export function useEditorReducer(initialCarousel?: CarouselSchema) {
  const [state, dispatch] = useReducer(editorReducer, initialCarousel, createInitialState);

  const setCarousel = useCallback((c: CarouselSchema) => dispatch({ type: 'SET_CAROUSEL', payload: c }), []);
  const selectSlide = useCallback((i: number) => dispatch({ type: 'SELECT_SLIDE', payload: i }), []);
  const selectElement = useCallback((id: string | null) => dispatch({ type: 'SELECT_ELEMENT', payload: id }), []);
  const updateSlide = useCallback((index: number, slide: Slide) => dispatch({ type: 'UPDATE_SLIDE', payload: { index, slide } }), []);
  const addSlide = useCallback((afterIndex: number, slide: Slide) => dispatch({ type: 'ADD_SLIDE', payload: { afterIndex, slide } }), []);
  const deleteSlide = useCallback((index: number) => dispatch({ type: 'DELETE_SLIDE', payload: index }), []);
  const moveSlide = useCallback((from: number, to: number) => dispatch({ type: 'MOVE_SLIDE', payload: { from, to } }), []);
  const duplicateSlide = useCallback((index: number) => dispatch({ type: 'DUPLICATE_SLIDE', payload: index }), []);
  const updateElement = useCallback((slideIndex: number, elementId: string, element: SlideElement) =>
    dispatch({ type: 'UPDATE_ELEMENT', payload: { slideIndex, elementId, element } }), []);
  const addElement = useCallback((slideIndex: number, afterElementId: string | null, element: SlideElement) =>
    dispatch({ type: 'ADD_ELEMENT', payload: { slideIndex, afterElementId, element } }), []);
  const deleteElement = useCallback((slideIndex: number, elementId: string) =>
    dispatch({ type: 'DELETE_ELEMENT', payload: { slideIndex, elementId } }), []);
  const duplicateElement = useCallback((slideIndex: number, elementId: string) =>
    dispatch({ type: 'DUPLICATE_ELEMENT', payload: { slideIndex, elementId } }), []);
  const moveElement = useCallback((slideIndex: number, elementId: string, direction: 'up' | 'down') =>
    dispatch({ type: 'MOVE_ELEMENT', payload: { slideIndex, elementId, direction } }), []);
  const reorderElement = useCallback((slideIndex: number, elementId: string, newIndex: number) =>
    dispatch({ type: 'REORDER_ELEMENT', payload: { slideIndex, elementId, newIndex } }), []);
  const setTheme = useCallback((theme: Theme) => dispatch({ type: 'SET_THEME', payload: theme }), []);
  const setFooter = useCallback((footer: string) => dispatch({ type: 'SET_FOOTER', payload: footer }), []);
  const setHandle = useCallback((handle: string) => dispatch({ type: 'SET_HANDLE', handle }), []);
  const setShowCounter = useCallback((show: boolean) => dispatch({ type: 'SET_SHOW_COUNTER', show }), []);
  const setSlideBg = useCallback((slideIndex: number, color: string | undefined) =>
    dispatch({ type: 'SET_SLIDE_BG', payload: { slideIndex, color } }), []);
  const setSlideBgImage = useCallback((slideIndex: number, image: string | undefined) =>
    dispatch({ type: 'SET_SLIDE_BG_IMAGE', payload: { slideIndex, image } }), []);
  const setSlideBgPosition = useCallback((slideIndex: number, position: string | undefined) =>
    dispatch({ type: 'SET_SLIDE_BG_POSITION', payload: { slideIndex, position } }), []);
  const setSlideLayout = useCallback((slideIndex: number, layout: SlideLayout, elementUpdates?: Record<string, Partial<SlideElement>>) =>
    dispatch({ type: 'SET_SLIDE_LAYOUT', payload: { slideIndex, layout, elementUpdates } }), []);
  const togglePreview = useCallback(() => dispatch({ type: 'TOGGLE_PREVIEW' }), []);
  const setViewMode = useCallback((mode: 'horizontal' | 'grid') => dispatch({ type: 'SET_VIEW_MODE', payload: mode }), []);
  const setZoom = useCallback((zoom: number) => dispatch({ type: 'SET_ZOOM', payload: zoom }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const markSaved = useCallback(() => dispatch({ type: 'MARK_SAVED' }), []);

  const actions = useMemo(() => ({
    setCarousel, selectSlide, selectElement, updateSlide, addSlide, deleteSlide,
    moveSlide, duplicateSlide, updateElement, addElement, deleteElement, duplicateElement, moveElement, reorderElement,
    setTheme, setFooter, setHandle, setShowCounter, setSlideBg, setSlideBgImage, setSlideBgPosition, setSlideLayout, togglePreview, setViewMode, setZoom, undo, redo, markSaved,
  }), [
    setCarousel, selectSlide, selectElement, updateSlide, addSlide, deleteSlide,
    moveSlide, duplicateSlide, updateElement, addElement, deleteElement, duplicateElement, moveElement, reorderElement,
    setTheme, setFooter, setHandle, setShowCounter, setSlideBg, setSlideBgImage, setSlideBgPosition, setSlideLayout, togglePreview, setViewMode, setZoom, undo, redo, markSaved,
  ]);

  return { state, actions, dispatch };
}
