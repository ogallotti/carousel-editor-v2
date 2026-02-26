'use client';

import Link from 'next/link';
import { Trash2, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/db';

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return `${Math.floor(days / 30)} meses`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}min`;
  return 'agora';
}

interface ProjectCardProps {
  project: Project;
  slideCount?: number;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, slideCount = 0, onDelete }: ProjectCardProps) {
  return (
    <Link
      href={`/editor/${project.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-primary/10 via-card to-primary/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <Layers className="size-10 text-primary/20" />
        </div>
        {slideCount > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-card/80 text-card-foreground backdrop-blur-sm border-0 text-xs">
              {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
            </Badge>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="font-semibold text-sm text-foreground truncate">
          {project.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {project.format === 'carousel' ? 'Carrossel' : 'Post'}
          </Badge>
          <span>{timeAgo(project.updatedAt)}</span>
        </div>
      </div>

      {/* Delete button - appears on hover */}
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card/60 hover:bg-destructive text-card-foreground hover:text-white backdrop-blur-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(project.id);
        }}
      >
        <Trash2 className="size-3" />
      </Button>
    </Link>
  );
}
