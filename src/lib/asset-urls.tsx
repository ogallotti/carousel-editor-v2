'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { getAsset, getProjectAssets } from './projects';

export function createAssetUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeAssetUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * React hook that loads an asset from IndexedDB and returns an object URL.
 * Cleans up the URL on unmount.
 */
export function useAssetUrl(projectId: string, filename: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    getAsset(projectId, filename).then((asset) => {
      if (cancelled) return;
      if (asset) {
        objectUrl = URL.createObjectURL(asset.blob);
        setUrl(objectUrl);
      }
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [projectId, filename]);

  return url;
}

// ─── Asset Context ──────────────────────────────────────────

interface AssetContextValue {
  resolveUrl: (src: string) => string;
  registerAssetUrl: (filename: string, blob: Blob) => void;
  isLoading: boolean;
}

const AssetContext = createContext<AssetContextValue | null>(null);

export function useAssetContext(): AssetContextValue {
  const ctx = useContext(AssetContext);
  if (!ctx) throw new Error('useAssetContext must be used within an AssetProvider');
  return ctx;
}

export function AssetProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const blobMapRef = useRef(new Map<string, string>());

  // Load all existing assets on mount
  useEffect(() => {
    let cancelled = false;

    getProjectAssets(projectId).then((assets) => {
      if (cancelled) return;
      const map = blobMapRef.current;
      for (const asset of assets) {
        if (!map.has(asset.filename)) {
          map.set(asset.filename, URL.createObjectURL(asset.blob));
        }
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      // Revoke all blob URLs on unmount
      const map = blobMapRef.current;
      for (const url of map.values()) {
        URL.revokeObjectURL(url);
      }
      map.clear();
    };
  }, [projectId]);

  const resolveUrl = useCallback((src: string): string => {
    if (!src) return src;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('blob:')) {
      return src;
    }
    if (src.startsWith('assets/')) {
      return blobMapRef.current.get(src) ?? src;
    }
    return src;
  }, []);

  const registerAssetUrl = useCallback((filename: string, blob: Blob) => {
    const existing = blobMapRef.current.get(filename);
    if (existing) URL.revokeObjectURL(existing);
    blobMapRef.current.set(filename, URL.createObjectURL(blob));
  }, []);

  const value = useMemo(
    () => ({ resolveUrl, registerAssetUrl, isLoading }),
    [resolveUrl, registerAssetUrl, isLoading],
  );

  return <AssetContext value={value}>{children}</AssetContext>;
}
