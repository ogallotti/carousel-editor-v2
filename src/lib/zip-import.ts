import JSZip from 'jszip';
import { createProject, saveProjectSchema, saveAsset } from './projects';
import { validateSchema, migrateSchema } from './schema-validation';
import type { CarouselSchema } from '@/types/schema';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

/**
 * Import a .zip file as a new project.
 * Returns the new project ID.
 */
export async function importZipAsProject(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Find and parse schema.json
  const schemaFile = zip.file('schema.json');
  if (!schemaFile) throw new Error('schema.json não encontrado no arquivo ZIP');

  const schemaText = await schemaFile.async('text');
  let schemaData: unknown;
  try {
    schemaData = JSON.parse(schemaText);
  } catch {
    throw new Error('schema.json contém JSON inválido');
  }

  // Validate
  const validation = validateSchema(schemaData);
  if (!validation.valid) {
    throw new Error(`Schema inválido: ${validation.errors.join(', ')}`);
  }

  // Migrate to current format
  const schema: CarouselSchema = migrateSchema(schemaData as Record<string, unknown>);

  // Create project
  const project = await createProject(schema.title || 'Carrossel Importado');

  // Save schema with the new project's ID
  schema.id = project.id;
  await saveProjectSchema(project.id, schema);

  // Extract and save assets
  const assetsFolder = zip.folder('assets');
  if (assetsFolder) {
    const assetFiles: string[] = [];
    assetsFolder.forEach((relativePath) => {
      assetFiles.push(relativePath);
    });

    for (const relativePath of assetFiles) {
      const assetFile = assetsFolder.file(relativePath);
      if (!assetFile || assetFile.dir) continue;

      const blob = await assetFile.async('blob');
      const ext = '.' + (relativePath.split('.').pop()?.toLowerCase() || '');
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      const typedBlob = new Blob([blob], { type: mimeType });

      await saveAsset(project.id, `assets/${relativePath}`, typedBlob);
    }
  }

  return project.id;
}
