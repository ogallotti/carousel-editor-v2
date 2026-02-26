import { db, type CustomTheme } from './db';

export async function getCustomThemes(): Promise<CustomTheme[]> {
  return db.customThemes.orderBy('name').toArray();
}

export async function saveCustomTheme(theme: CustomTheme): Promise<void> {
  await db.customThemes.put(theme);
}

export async function deleteCustomTheme(name: string): Promise<void> {
  await db.customThemes.delete(name);
}
