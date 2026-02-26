import Dexie, { type EntityTable } from 'dexie';

// ─── Table Interfaces ───────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  format: 'carousel' | 'single-post';
  thumbnail?: Blob;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectData {
  projectId: string;
  schema: Record<string, unknown>;
  version: number;
}

export interface Asset {
  id: string;
  projectId: string;
  filename: string;
  blob: Blob;
  mimeType: string;
  size: number;
  createdAt: Date;
}

export interface UserSettings {
  key: string;
  value: unknown;
}

export interface CustomTheme {
  name: string;
  colors: Record<string, string>;
  typography: Record<string, { family: string; weight: number }>;
  fontScale: number;
  createdAt: Date;
}

// ─── Database Definition ────────────────────────────────────

const db = new Dexie('CarouselEditor') as Dexie & {
  projects: EntityTable<Project, 'id'>;
  projectData: EntityTable<ProjectData, 'projectId'>;
  assets: EntityTable<Asset, 'id'>;
  settings: EntityTable<UserSettings, 'key'>;
  customThemes: EntityTable<CustomTheme, 'name'>;
};

db.version(1).stores({
  projects: 'id, title, updatedAt, format',
  projectData: 'projectId',
  assets: 'id, projectId, filename, [projectId+filename]',
  settings: 'key',
  customThemes: 'name',
});

export { db };
