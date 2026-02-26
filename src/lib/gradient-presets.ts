import { db, type GradientPreset } from './db';

export async function getGradientPresets(category?: 'background' | 'overlay'): Promise<GradientPreset[]> {
  if (category) return db.gradientPresets.where('category').equals(category).toArray();
  return db.gradientPresets.toArray();
}

export async function saveGradientPreset(preset: Omit<GradientPreset, 'id'>): Promise<void> {
  await db.gradientPresets.add(preset as GradientPreset);
}

export async function deleteGradientPreset(id: number): Promise<void> {
  await db.gradientPresets.delete(id);
}
