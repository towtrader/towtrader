import { useEffect, useState } from 'react';

interface ImagePreloaderOptions {
  priority?: boolean;
  threshold?: number;
}

export function useImagePreloader(src: string | null, options: ImagePreloaderOptions = {}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { priority = false, threshold = 0.1 } = options;

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.decoding = 'async';
    if (priority) {
      img.loading = 'eager';
    }

    const handleLoad = () => {
      setLoaded(true);
      setError(false);
    };

    const handleError = () => {
      setError(true);
      setLoaded(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    img.src = src;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, priority]);

  return { loaded, error };
}

export function preloadImages(urls: string[]): Promise<void[]> {
  const promises = urls.map((url) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'lazy';
      
      const cleanup = () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
      
      const handleLoad = () => {
        cleanup();
        resolve();
      };
      
      const handleError = () => {
        cleanup();
        resolve(); // Resolve even on error to not block other images
      };
      
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      img.src = url;
    });
  });

  return Promise.all(promises);
}