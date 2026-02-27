'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { db, type Project } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorWorkspace, type EditorActions } from '@/components/editor/EditorWorkspace';
import { useEditorReducer } from '@/hooks/useEditorReducer';
import { useAutoSave } from '@/hooks/useAutoSave';
import { exportSlidePng, exportAllSlidesPng } from '@/lib/export-png';
import { exportProjectAsZip, downloadBlob } from '@/lib/zip-export';
import { schemaToMarkdown } from '@/lib/export-markdown';
import { schemaToJson, slugify, downloadTextFile, copyToClipboard } from '@/lib/export-json';
import { AssetProvider } from '@/lib/asset-urls';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast-container';
import type { CarouselSchema } from '@/types/schema';
import { migrateSchema } from '@/lib/schema-validation';

export default function EditorPageClient() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [initialSchema, setInitialSchema] = useState<CarouselSchema | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>('loading');

  // Load project and schema from Dexie
  useEffect(() => {
    async function load() {
      if (!params.id) {
        setStatus('not-found');
        return;
      }

      const proj = await db.projects.get(params.id);
      if (!proj) {
        setStatus('not-found');
        return;
      }

      const data = await db.projectData.get(params.id);
      setProject(proj);
      if (data?.schema) {
        setInitialSchema(migrateSchema(data.schema as Record<string, unknown>));
      }
      setStatus('ready');
    }

    load();
  }, [params.id]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <EditorInner
      projectId={params.id}
      projectTitle={project?.title ?? ''}
      initialSchema={initialSchema ?? undefined}
    />
  );
}

function EditorInner({
  projectId,
  projectTitle,
  initialSchema,
}: {
  projectId: string;
  projectTitle: string;
  initialSchema?: CarouselSchema;
}) {
  const { state, actions } = useEditorReducer(initialSchema);
  const { isSaving, saveNow } = useAutoSave(projectId, state.carousel, state.isDirty, actions.markSaved);
  const { toasts, show: showToast, dismiss: dismissToast } = useToast();

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        actions.redo();
      } else if (e.key === 'z') {
        e.preventDefault();
        actions.undo();
      } else if (e.key === 's') {
        e.preventDefault();
        saveNow();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, saveNow]);

  // Zoom helpers
  const handleZoomIn = useCallback(() => {
    actions.setZoom(Math.min(state.zoom + 0.1, 2));
  }, [state.zoom, actions]);

  const handleZoomOut = useCallback(() => {
    actions.setZoom(Math.max(state.zoom - 0.1, 0.3));
  }, [state.zoom, actions]);

  const handleExportSlide = useCallback(() => {
    exportSlidePng(state.selectedSlideIndex);
  }, [state.selectedSlideIndex]);

  const handleExportAll = useCallback(() => {
    exportAllSlidesPng(state.carousel.slides.length);
  }, [state.carousel.slides.length]);

  const handleExportMarkdown = useCallback(() => {
    const md = schemaToMarkdown(state.carousel);
    const filename = `${slugify(state.carousel.title)}.md`;
    downloadTextFile(md, filename, 'text/markdown;charset=utf-8');
  }, [state.carousel]);

  const handleCopyMarkdown = useCallback(async () => {
    try {
      const md = schemaToMarkdown(state.carousel);
      await copyToClipboard(md);
      showToast('Markdown copiado!');
    } catch {
      showToast('Erro ao copiar', 'error');
    }
  }, [state.carousel, showToast]);

  const handleExportJson = useCallback(() => {
    const json = schemaToJson(state.carousel);
    const filename = `${slugify(state.carousel.title)}.json`;
    downloadTextFile(json, filename, 'application/json;charset=utf-8');
  }, [state.carousel]);

  const handleCopyJson = useCallback(async () => {
    try {
      const json = schemaToJson(state.carousel);
      await copyToClipboard(json);
      showToast('JSON copiado!');
    } catch {
      showToast('Erro ao copiar', 'error');
    }
  }, [state.carousel, showToast]);

  const handleExportProjectZip = useCallback(async () => {
    try {
      const blob = await exportProjectAsZip(projectId);
      const filename = `${slugify(state.carousel.title)}.zip`;
      downloadBlob(blob, filename);
    } catch {
      showToast('Erro ao exportar projeto', 'error');
    }
  }, [projectId, state.carousel.title, showToast]);

  const slideCount = state.carousel.slides.length;

  // Build workspace actions subset (memoized — actions object is stable from useEditorReducer)
  const workspaceActions: EditorActions = useMemo(() => ({
    selectSlide: actions.selectSlide,
    selectElement: actions.selectElement,
    addSlide: actions.addSlide,
    deleteSlide: actions.deleteSlide,
    duplicateSlide: actions.duplicateSlide,
    moveSlide: actions.moveSlide,
    updateElement: actions.updateElement,
    addElement: actions.addElement,
    deleteElement: actions.deleteElement,
    duplicateElement: actions.duplicateElement,
    moveElement: actions.moveElement,
    reorderElement: actions.reorderElement,
    setTheme: actions.setTheme,
    setSlideBg: actions.setSlideBg,
    setSlideBgImage: actions.setSlideBgImage,
    setSlideBgPosition: actions.setSlideBgPosition,
    setSlideLayout: actions.setSlideLayout,
  }), [actions]);

  return (
    <AssetProvider projectId={projectId}>
    <div className="flex h-screen flex-col bg-background">
      <EditorToolbar
        title={projectTitle}
        slideCount={slideCount}
        isDirty={state.isDirty}
        isSaving={isSaving}
        footerText={state.carousel.footer.text}
        handle={state.carousel.header.handle}
        showCounter={state.carousel.header.showCounter}
        isPreviewMode={state.isPreviewMode}
        viewMode={state.viewMode}
        zoom={state.zoom}
        canUndo={state.undoStack.length > 0}
        canRedo={state.redoStack.length > 0}
        onUndo={actions.undo}
        onRedo={actions.redo}
        onTogglePreview={actions.togglePreview}
        onSetViewMode={actions.setViewMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onSetFooter={actions.setFooter}
        onSetHandle={actions.setHandle}
        onSetShowCounter={actions.setShowCounter}
        onExportSlide={handleExportSlide}
        onExportAll={handleExportAll}
        onExportMarkdown={handleExportMarkdown}
        onCopyMarkdown={handleCopyMarkdown}
        onExportJson={handleExportJson}
        onCopyJson={handleCopyJson}
        onExportProjectZip={handleExportProjectZip}
        onSaveNow={saveNow}
      />
      <EditorWorkspace state={state} actions={workspaceActions} projectId={projectId} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
    </AssetProvider>
  );
}
