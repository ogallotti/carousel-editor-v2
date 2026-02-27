'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Undo2, Redo2, Eye, EyeOff,
  LayoutGrid, GalleryHorizontalEnd, ZoomIn, ZoomOut,
  Download, Image as ImageIcon, FileArchive,
  FileText, FileJson, Package, Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export interface EditorToolbarProps {
  title: string;
  slideCount: number;
  isDirty: boolean;
  isSaving: boolean;
  footerText: string;
  handle: string;
  showCounter: boolean;
  isPreviewMode: boolean;
  viewMode: 'horizontal' | 'grid';
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  onSetViewMode: (mode: 'horizontal' | 'grid') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSetFooter: (text: string) => void;
  onSetHandle: (handle: string) => void;
  onSetShowCounter: (show: boolean) => void;
  onExportSlide: () => void;
  onExportAll: () => void;
  onExportMarkdown: () => void;
  onCopyMarkdown: () => void;
  onExportJson: () => void;
  onCopyJson: () => void;
  onExportProjectZip: () => void;
  onSaveNow: () => void;
}

export function EditorToolbar({
  title,
  slideCount,
  isDirty,
  isSaving,
  footerText,
  handle,
  showCounter,
  isPreviewMode,
  viewMode,
  zoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onTogglePreview,
  onSetViewMode,
  onZoomIn,
  onZoomOut,
  onSetFooter,
  onSetHandle,
  onSetShowCounter,
  onExportSlide,
  onExportAll,
  onExportMarkdown,
  onCopyMarkdown,
  onExportJson,
  onCopyJson,
  onExportProjectZip,
  onSaveNow,
}: EditorToolbarProps) {
  const zoomPercent = Math.round(zoom * 100);

  const handleFooterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSetFooter(e.target.value);
    },
    [onSetFooter]
  );

  const handleHandleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSetHandle(e.target.value);
    },
    [onSetHandle]
  );

  const handleToggleShowCounter = useCallback(() => {
    onSetShowCounter(!showCounter);
  }, [showCounter, onSetShowCounter]);

  return (
    <TooltipProvider delayDuration={300}>
      <header className="editor-toolbar flex h-12 items-center gap-2 px-3">
        {/* Back + title */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Voltar à galeria</TooltipContent>
        </Tooltip>

        <span className="truncate text-sm font-medium">{title}</span>

        <Badge variant="secondary" className="text-xs tabular-nums">
          {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
        </Badge>

        {isDirty && (
          <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
            {isSaving ? 'Salvando...' : 'Não salvo'}
          </Badge>
        )}

        <Separator orientation="vertical" className="mx-1 h-5" />

        {/* Header text input */}
        <div className="hidden items-center gap-1 md:flex">
          <span className="text-xs text-muted-foreground">Cabeçalho:</span>
          <Input
            className="h-7 w-28 text-xs"
            value={handle}
            onChange={handleHandleChange}
            placeholder="@usuario"
          />
        </div>

        {/* Footer input */}
        <div className="hidden items-center gap-1 md:flex">
          <span className="text-xs text-muted-foreground">Rodapé:</span>
          <Input
            className="h-7 w-32 text-xs"
            value={footerText}
            onChange={handleFooterChange}
            placeholder="MINHA MARCA"
          />
        </div>

        {/* Counter toggle */}
        <div className="hidden items-center gap-1 md:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showCounter ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-[10px]"
                onClick={handleToggleShowCounter}
              >
                {showCounter ? '1/5' : '—'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{showCounter ? 'Ocultar contador de slides' : 'Mostrar contador de slides'}</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-1 hidden h-5 md:block" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" onClick={onUndo} disabled={!canUndo}>
                <Undo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Desfazer (⌘Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" onClick={onRedo} disabled={!canRedo}>
                <Redo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refazer (⌘⇧Z)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-1 h-5" />

        {/* Preview toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isPreviewMode ? 'secondary' : 'ghost'}
              size="icon"
              className="size-8"
              onClick={onTogglePreview}
            >
              {isPreviewMode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isPreviewMode ? 'Sair da pré-visualização' : 'Pré-visualizar'}</TooltipContent>
        </Tooltip>

        {/* View mode */}
        <div className="hidden items-center gap-0.5 md:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'horizontal' ? 'secondary' : 'ghost'}
                size="icon"
                className="size-8"
                onClick={() => onSetViewMode('horizontal')}
              >
                <GalleryHorizontalEnd className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Vista carrossel</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="size-8"
                onClick={() => onSetViewMode('grid')}
              >
                <LayoutGrid className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Vista em grade</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-1 hidden h-5 md:flex" />

        {/* Zoom */}
        <div className="hidden items-center gap-0.5 md:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" onClick={onZoomOut}>
                <ZoomOut className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Diminuir zoom</TooltipContent>
          </Tooltip>

          <span className="min-w-[3ch] text-center text-xs tabular-nums text-muted-foreground">
            {zoomPercent}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" onClick={onZoomIn}>
                <ZoomIn className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Aumentar zoom</TooltipContent>
          </Tooltip>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save */}
        <Button variant="ghost" size="sm" className="hidden h-7 text-xs md:flex" onClick={onSaveNow} disabled={!isDirty || isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>

        {/* Export */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-7 gap-1.5 text-xs">
              <Download className="size-3.5" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Imagens</DropdownMenuLabel>
            <DropdownMenuItem onClick={onExportSlide}>
              <ImageIcon className="mr-2 size-4" />
              Slide atual (PNG)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportAll}>
              <FileArchive className="mr-2 size-4" />
              Todos os slides (ZIP)
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Dados</DropdownMenuLabel>

            <DropdownMenuItem onClick={onExportMarkdown}>
              <FileText className="mr-2 size-4" />
              <span className="flex-1">Markdown (.md)</span>
              <button
                className="ml-2 rounded p-0.5 hover:bg-accent"
                onClick={(e) => { e.stopPropagation(); onCopyMarkdown(); }}
                title="Copiar para clipboard"
              >
                <Copy className="size-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onExportJson}>
              <FileJson className="mr-2 size-4" />
              <span className="flex-1">JSON (.json)</span>
              <button
                className="ml-2 rounded p-0.5 hover:bg-accent"
                onClick={(e) => { e.stopPropagation(); onCopyJson(); }}
                title="Copiar para clipboard"
              >
                <Copy className="size-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onExportProjectZip}>
              <Package className="mr-2 size-4" />
              Projeto completo (.zip)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </TooltipProvider>
  );
}
