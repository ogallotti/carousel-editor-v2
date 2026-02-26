'use client';

import { Layers, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateNew: () => void;
  onImportZip: () => void;
}

export function EmptyState({ onCreateNew, onImportZip }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="flex items-center justify-center size-20 rounded-2xl bg-primary/10 mb-6">
        <Layers className="size-10 text-primary" />
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">
        Nenhum projeto ainda
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8">
        Crie um novo carrossel ou importe um arquivo ZIP para começar
      </p>

      <div className="flex gap-3">
        <Button onClick={onCreateNew}>
          <Plus className="size-4" />
          Novo Carrossel
        </Button>
        <Button variant="outline" onClick={onImportZip}>
          <Upload className="size-4" />
          Importar ZIP
        </Button>
      </div>
    </div>
  );
}
