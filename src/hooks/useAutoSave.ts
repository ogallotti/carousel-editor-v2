'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { saveProjectSchema } from '@/lib/projects';
import type { CarouselSchema } from '@/types/schema';

const DEBOUNCE_MS = 2000;

export function useAutoSave(
  projectId: string | null,
  schema: CarouselSchema | null,
  isDirty: boolean,
  onSaved?: () => void,
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const schemaRef = useRef(schema);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  // Keep schema ref in sync so the save always uses the latest value
  schemaRef.current = schema;

  const saveNow = useCallback(async () => {
    if (!projectId || !schemaRef.current) return;

    // Clear any pending debounced save
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsSaving(true);
    try {
      await saveProjectSchema(projectId, schemaRef.current);
      setLastSaved(new Date());
      onSavedRef.current?.();
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);

  // Debounced auto-save when dirty
  // schema is intentionally NOT in deps — schemaRef.current is always up-to-date
  // and including schema would restart the debounce timer on every keystroke
  useEffect(() => {
    if (!isDirty || !projectId || !schemaRef.current) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      saveNow();
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, projectId, saveNow]);

  return { isSaving, lastSaved, saveNow };
}
