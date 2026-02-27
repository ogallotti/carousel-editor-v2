'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { db, type Project } from '@/lib/db';
import { createEmptySchema, SCHEMA_VERSION } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/gallery/ProjectCard';
import { EmptyState } from '@/components/gallery/EmptyState';
import { CreateProjectDialog } from '@/components/gallery/CreateProjectDialog';
import { ImportZipButton } from '@/components/gallery/ImportZipButton';
import { importZipAsProject } from '@/lib/zip-import';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [slideCounts, setSlideCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const loadProjects = useCallback(async () => {
    try {
      const all = await db.projects.orderBy('updatedAt').reverse().toArray();
      setProjects(all);

      // Load slide counts from projectData
      const counts: Record<string, number> = {};
      for (const p of all) {
        const data = await db.projectData.get(p.id);
        if (data?.schema) {
          const schema = data.schema as { slides?: unknown[] };
          counts[p.id] = schema.slides?.length ?? 0;
        }
      }
      setSlideCounts(counts);
    } catch {
      // DB not ready yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, search]);

  const handleCreate = async (title: string) => {
    const id = crypto.randomUUID();
    const now = new Date();
    const schema = createEmptySchema(id);
    schema.title = title;

    await db.projects.add({
      id,
      title,
      format: 'carousel',
      createdAt: now,
      updatedAt: now,
    });
    await db.projectData.add({
      projectId: id,
      schema,
      version: SCHEMA_VERSION,
    });

    router.push(`/editor/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await db.projects.delete(deleteTarget);
    await db.projectData.delete(deleteTarget);
    await db.assets.where('projectId').equals(deleteTarget).delete();
    setDeleteTarget(null);
    loadProjects();
  };

  const handleImport = async (file: File) => {
    try {
      const projectId = await importZipAsProject(file);
      router.push(`/editor/${projectId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao importar ZIP');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const hasProjects = projects.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Carousel Editor</h1>
          </div>

          {hasProjects && (
            <div className="flex items-center gap-2">
              <ImportZipButton onImport={handleImport} />
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
                Novo
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {hasProjects ? (
          <>
            {/* Search */}
            <div className="relative mb-6 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar projetos..."
                className="pl-9"
              />
            </div>

            {/* Grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    slideCount={slideCounts[project.id] ?? 0}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-sm">Nenhum projeto encontrado para "{search}"</p>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            onCreateNew={() => setCreateOpen(true)}
            onImportZip={() => importInputRef.current?.click()}
          />
        )}
      </main>

      {/* Create dialog */}
      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir projeto</DialogTitle>
            <DialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden import input for empty state */}
      <input
        ref={importInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImport(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
