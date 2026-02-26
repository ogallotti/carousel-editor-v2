import JSZip from 'jszip';
import { getProjectSchema, getProjectAssets } from './projects';

/**
 * Export a project as a .zip file containing schema.json + assets/
 */
export async function exportProjectAsZip(projectId: string): Promise<Blob> {
  const schema = await getProjectSchema(projectId);
  if (!schema) throw new Error('Schema do projeto não encontrado');

  const assets = await getProjectAssets(projectId);

  const zip = new JSZip();

  // Add schema.json with updated timestamp
  const schemaWithTimestamp = { ...schema, updatedAt: new Date().toISOString() };
  zip.file('schema.json', JSON.stringify(schemaWithTimestamp, null, 2));

  // Add assets into the zip preserving their filename paths (e.g. "assets/cover.jpg")
  for (const asset of assets) {
    zip.file(asset.filename, asset.blob);
  }

  return zip.generateAsync({ type: 'blob' });
}

/**
 * Download a Blob as a file via a temporary link.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
