export interface GuideLine {
  type: 'h' | 'v';
  position: number;
}

export interface GuideResult {
  snappedX: number;
  snappedY: number;
  guides: GuideLine[];
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1440;
const DEFAULT_THRESHOLD = 5;

/**
 * Calculate smart guides for a dragging element.
 * Snaps to slide center/edges and other element edges/centers.
 */
export function calculateSmartGuides(
  dragging: Rect,
  others: Rect[],
  threshold = DEFAULT_THRESHOLD,
): GuideResult {
  const guides: GuideLine[] = [];
  let snappedX = dragging.x;
  let snappedY = dragging.y;

  // Dragging element edges
  const dLeft = dragging.x;
  const dCenterX = dragging.x + dragging.w / 2;
  const dRight = dragging.x + dragging.w;
  const dTop = dragging.y;
  const dCenterY = dragging.y + dragging.h / 2;
  const dBottom = dragging.y + dragging.h;

  // Vertical snap targets (x-axis lines)
  const vTargets: number[] = [
    0,                      // left edge
    SLIDE_WIDTH / 2,        // center (540)
    SLIDE_WIDTH,            // right edge
  ];

  // Horizontal snap targets (y-axis lines)
  const hTargets: number[] = [
    0,                      // top edge
    SLIDE_HEIGHT / 2,       // center (720)
    SLIDE_HEIGHT,           // bottom edge
  ];

  // Add targets from other elements
  for (const other of others) {
    const oLeft = other.x;
    const oCenterX = other.x + other.w / 2;
    const oRight = other.x + other.w;
    const oTop = other.y;
    const oCenterY = other.y + other.h / 2;
    const oBottom = other.y + other.h;

    vTargets.push(oLeft, oCenterX, oRight);
    hTargets.push(oTop, oCenterY, oBottom);
  }

  // Find best vertical snap (x-axis)
  let bestVDist = threshold + 1;
  let bestVSnap: { offset: number; target: number } | null = null;

  for (const target of vTargets) {
    // Check dragging element's left, center, right against target
    const checks = [
      { edge: dLeft, offset: 0 },
      { edge: dCenterX, offset: dragging.w / 2 },
      { edge: dRight, offset: dragging.w },
    ];

    for (const { edge, offset } of checks) {
      const dist = Math.abs(edge - target);
      if (dist < bestVDist) {
        bestVDist = dist;
        bestVSnap = { offset, target };
      }
    }
  }

  if (bestVSnap) {
    snappedX = bestVSnap.target - bestVSnap.offset;
    guides.push({ type: 'v', position: bestVSnap.target });
  }

  // Find best horizontal snap (y-axis)
  let bestHDist = threshold + 1;
  let bestHSnap: { offset: number; target: number } | null = null;

  for (const target of hTargets) {
    const checks = [
      { edge: dTop, offset: 0 },
      { edge: dCenterY, offset: dragging.h / 2 },
      { edge: dBottom, offset: dragging.h },
    ];

    for (const { edge, offset } of checks) {
      const dist = Math.abs(edge - target);
      if (dist < bestHDist) {
        bestHDist = dist;
        bestHSnap = { offset, target };
      }
    }
  }

  if (bestHSnap) {
    snappedY = bestHSnap.target - bestHSnap.offset;
    guides.push({ type: 'h', position: bestHSnap.target });
  }

  return { snappedX, snappedY, guides };
}
