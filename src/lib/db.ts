import Dexie, { type EntityTable } from 'dexie';
import type { CarouselSchema, ThemeColors, ThemeTypography } from '@/types/schema';

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
  schema: CarouselSchema | Record<string, unknown>;
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
  colors: ThemeColors;
  typography: ThemeTypography;
  fontScale: number;
  createdAt: Date;
}

export interface GradientPreset {
  id?: number;
  name: string;
  fill: string;
  category: 'background' | 'overlay';
  createdAt: Date;
}

// ─── Database Definition ────────────────────────────────────

const db = new Dexie('CarouselEditor') as Dexie & {
  projects: EntityTable<Project, 'id'>;
  projectData: EntityTable<ProjectData, 'projectId'>;
  assets: EntityTable<Asset, 'id'>;
  settings: EntityTable<UserSettings, 'key'>;
  customThemes: EntityTable<CustomTheme, 'name'>;
  gradientPresets: EntityTable<GradientPreset, 'id'>;
};

db.version(1).stores({
  projects: 'id, title, updatedAt, format',
  projectData: 'projectId',
  assets: 'id, projectId, filename, [projectId+filename]',
  settings: 'key',
  customThemes: 'name',
});

db.version(2).stores({
  projects: 'id, title, updatedAt, format',
  projectData: 'projectId',
  assets: 'id, projectId, filename, [projectId+filename]',
  settings: 'key',
  customThemes: 'name',
  gradientPresets: '++id, name, category',
});

export { db };
