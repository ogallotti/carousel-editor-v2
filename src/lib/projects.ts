import { db, type Project, type Asset } from './db';
import type { CarouselSchema } from '@/types/schema';
import { createEmptySchema } from '@/types/schema';
import { migrateSchema } from './schema-validation';
import { nanoid } from './nanoid';

export async function createProject(title: string): Promise<Project> {
  const id = nanoid();
  const now = new Date();
  const project: Project = { id, title, format: 'carousel', createdAt: now, updatedAt: now };

  await db.projects.add(project);

  const schema = createEmptySchema(id);
  schema.title = title;
  await db.projectData.add({
    projectId: id,
    schema,
    version: schema.version,
  });

  return project;
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function getAllProjects(): Promise<Project[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function updateProject(id: string, data: Partial<Omit<Project, 'id'>>): Promise<void> {
  await db.projects.update(id, { ...data, updatedAt: new Date() });
}

export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', [db.projects, db.projectData, db.assets], async () => {
    await db.assets.where('projectId').equals(id).delete();
    await db.projectData.delete(id);
    await db.projects.delete(id);
  });
}

export async function saveProjectSchema(projectId: string, schema: CarouselSchema): Promise<void> {
  // Clone with updated timestamp — never mutate the original (it's React state)
  const schemaToSave = { ...schema, updatedAt: new Date().toISOString() };

  await db.projectData.put({
    projectId,
    schema: schemaToSave,
    version: schemaToSave.version,
  });

  await db.projects.update(projectId, { updatedAt: new Date() });
}

export async function getProjectSchema(projectId: string): Promise<CarouselSchema | null> {
  const record = await db.projectData.get(projectId);
  return record ? migrateSchema(record.schema) : null;
}

export async function saveAsset(projectId: string, filename: string, blob: Blob): Promise<Asset> {
  const existing = await db.assets.where('[projectId+filename]').equals([projectId, filename]).first();

  const asset: Asset = {
    id: existing?.id ?? nanoid(),
    projectId,
    filename,
    blob,
    mimeType: blob.type,
    size: blob.size,
    createdAt: existing?.createdAt ?? new Date(),
  };

  await db.assets.put(asset);
  return asset;
}

export async function getAsset(projectId: string, filename: string): Promise<Asset | undefined> {
  return db.assets.where('[projectId+filename]').equals([projectId, filename]).first();
}

export async function getProjectAssets(projectId: string): Promise<Asset[]> {
  return db.assets.where('projectId').equals(projectId).toArray();
}

export async function deleteAsset(id: string): Promise<void> {
  await db.assets.delete(id);
}
