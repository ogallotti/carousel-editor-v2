'use client';

import { useState, useRef } from 'react';
import { Upload, Link } from 'lucide-react';
import { saveAsset } from '@/lib/projects';
import { useAssetContext } from '@/lib/asset-urls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelected: (src: string) => void;
  currentSrc?: string;
  projectId: string;
}

export function ImageDialog({ open, onOpenChange, onImageSelected, currentSrc, projectId }: ImageDialogProps) {
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resolveUrl, registerAssetUrl } = useAssetContext();

  const rawPreviewSrc = urlInput.trim() || currentSrc;
  const previewSrc = rawPreviewSrc ? resolveUrl(rawPreviewSrc) : undefined;

  function handleUseUrl() {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onImageSelected(trimmed);
      setUrlInput('');
      onOpenChange(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const filename = `assets/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      await saveAsset(projectId, filename, file);
      registerAssetUrl(filename, file);
      onImageSelected(filename);
      setUrlInput('');
      onOpenChange(false);
    }
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleUseUrl();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Imagem</DialogTitle>
          <DialogDescription>
            Cole a URL de uma imagem ou faça upload de um arquivo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* URL input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              URL da imagem
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Colar URL da imagem"
                  className="pl-8"
                />
              </div>
              <Button onClick={handleUseUrl} disabled={!urlInput.trim()}>
                Usar
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Ou faça upload</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* File upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Escolher arquivo
            </Button>
          </div>

          {/* Image preview */}
          {previewSrc && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">Pré-visualização</span>
              <div className="flex items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20 p-3">
                <img
                  src={previewSrc}
                  alt="Pré-visualização"
                  className="max-h-48 rounded object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = 'block';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
