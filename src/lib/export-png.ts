import { toPng } from 'html-to-image';
import JSZip from 'jszip';

export async function exportSlidePng(slideIndex: number): Promise<void> {
  // Target the .slide-renderer inside the main canvas (not thumbnails)
  // The main canvas .slide-renderer is the one NOT inside .slide-wrapper with small zoom
  const allRenderers = document.querySelectorAll('.slide-renderer');
  // The main canvas renderer is typically the largest one (or the one in the center panel)
  let el: HTMLElement | null = null;
  for (const r of allRenderers) {
    const parent = r.closest('.slide-wrapper') as HTMLElement;
    if (parent) {
      const zoom = parseFloat((r as HTMLElement).style.zoom || '1');
      if (zoom > 0.2) {
        el = r as HTMLElement;
        break;
      }
    }
  }
  if (!el) el = allRenderers[allRenderers.length - 1] as HTMLElement;
  if (!el) return;

  // Store original zoom and reset for export
  const originalZoom = el.style.zoom;
  el.style.zoom = '1';

  try {
    const dataUrl = await toPng(el, {
      width: 1080,
      height: 1440,
      pixelRatio: 1,
      filter: filterEditorUI,
    });

    const link = document.createElement('a');
    link.download = `slide-${String(slideIndex + 1).padStart(2, '0')}.png`;
    link.href = dataUrl;
    link.click();
  } finally {
    el.style.zoom = originalZoom;
  }
}

function findMainRenderer(): HTMLElement | null {
  const allRenderers = document.querySelectorAll('.slide-renderer');
  for (const r of allRenderers) {
    const zoom = parseFloat((r as HTMLElement).style.zoom || '1');
    if (zoom > 0.2) {
      return r as HTMLElement;
    }
  }
  return (allRenderers[allRenderers.length - 1] as HTMLElement) ?? null;
}

function filterEditorUI(node: HTMLElement): boolean {
  if (node.dataset?.editorControl !== undefined) return false;
  return true;
}

function waitForFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export async function exportAllSlidesPng(
  totalSlides: number,
  selectSlide: (index: number) => void,
): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < totalSlides; i++) {
    selectSlide(i);
    // Wait for render to complete (double rAF + small delay for complex slides)
    await waitForFrame();
    await new Promise((r) => setTimeout(r, 200));

    const el = findMainRenderer();
    if (!el) continue;

    const originalZoom = el.style.zoom;
    el.style.zoom = '1';

    try {
      const dataUrl = await toPng(el, {
        width: 1080,
        height: 1440,
        pixelRatio: 1,
        filter: filterEditorUI,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, blob);
    } finally {
      el.style.zoom = originalZoom;
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.download = 'slides.zip';
  link.href = URL.createObjectURL(zipBlob);
  link.click();
  URL.revokeObjectURL(link.href);
}
