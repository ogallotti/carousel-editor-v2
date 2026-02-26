import { toPng } from 'html-to-image';
import JSZip from 'jszip';

/**
 * Find a slide renderer in the main canvas by its slide index.
 * Filters out thumbnail renderers (zoom <= 0.2) to only match the main canvas.
 */
function findRendererByIndex(slideIndex: number): HTMLElement | null {
  const candidates = document.querySelectorAll(
    `.slide-renderer[data-slide-index="${slideIndex}"]`
  );
  for (const el of candidates) {
    const zoom = parseFloat((el as HTMLElement).style.zoom || '1');
    if (zoom > 0.2) {
      return el as HTMLElement;
    }
  }
  return null;
}

function filterEditorUI(node: HTMLElement): boolean {
  if (node.dataset?.editorControl !== undefined) return false;
  return true;
}

async function captureSlide(el: HTMLElement): Promise<string> {
  const originalZoom = el.style.zoom;
  el.style.zoom = '1';
  try {
    return await toPng(el, {
      width: 1080,
      height: 1440,
      pixelRatio: 1,
      filter: filterEditorUI,
    });
  } finally {
    el.style.zoom = originalZoom;
  }
}

export async function exportSlidePng(slideIndex: number): Promise<void> {
  const el = findRendererByIndex(slideIndex);
  if (!el) return;

  const dataUrl = await captureSlide(el);
  const link = document.createElement('a');
  link.download = `slide-${String(slideIndex + 1).padStart(2, '0')}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportAllSlidesPng(totalSlides: number): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < totalSlides; i++) {
    const el = findRendererByIndex(i);
    if (!el) continue;

    const dataUrl = await captureSlide(el);
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.download = 'slides.zip';
  link.href = URL.createObjectURL(zipBlob);
  link.click();
  URL.revokeObjectURL(link.href);
}
