'use client';

import type { GuideLine } from '@/hooks/useSmartGuides';

interface SmartGuideOverlayProps {
  guides: GuideLine[];
}

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1440;

export function SmartGuideOverlay({ guides }: SmartGuideOverlayProps) {
  if (guides.length === 0) return null;

  return (
    <svg
      data-editor-control
      style={{
        position: 'absolute',
        inset: 0,
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      {guides.map((guide, i) =>
        guide.type === 'v' ? (
          <line
            key={`v-${i}`}
            x1={guide.position}
            y1={0}
            x2={guide.position}
            y2={SLIDE_HEIGHT}
            stroke="var(--editor-accent)"
            strokeWidth={1}
            strokeDasharray="6 4"
          />
        ) : (
          <line
            key={`h-${i}`}
            x1={0}
            y1={guide.position}
            x2={SLIDE_WIDTH}
            y2={guide.position}
            stroke="var(--editor-accent)"
            strokeWidth={1}
            strokeDasharray="6 4"
          />
        )
      )}
    </svg>
  );
}
