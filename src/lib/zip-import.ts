import JSZip from 'jszip';
import { createProject, saveProjectSchema, saveAsset } from './projects';
import { validateSchema, migrateSchema } from './schema-validation';
import type { CarouselSchema, ImageElement } from '@/types/schema';

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

  // Extract and save assets — collect imported paths
  const importedAssets = new Set<string>();
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

      const assetPath = `assets/${relativePath}`;
      await saveAsset(project.id, assetPath, typedBlob);
      importedAssets.add(assetPath);
    }
  }

  // Validate asset references — clear broken refs instead of failing
  for (const slide of schema.slides) {
    // Check slide backgroundImage
    if (slide.backgroundImage && typeof slide.backgroundImage === 'string' && slide.backgroundImage.startsWith('assets/')) {
      if (!importedAssets.has(slide.backgroundImage)) {
        console.warn(`[zip-import] Asset ausente para backgroundImage: ${slide.backgroundImage}`);
        slide.backgroundImage = null;
      }
    }

    // Check image elements
    for (const el of slide.elements) {
      if (el.type === 'image') {
        const img = el as ImageElement;
        if (img.src && img.src.startsWith('assets/') && !importedAssets.has(img.src)) {
          console.warn(`[zip-import] Asset ausente para imagem: ${img.src}`);
          img.src = '';
        }
      }
    }
  }

  await saveProjectSchema(project.id, schema);

  return project.id;
}
