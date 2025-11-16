import { useState, useCallback } from "react";

interface ImageLoadState {
  [key: string]: boolean;
}

interface UseImageLoaderReturn {
  imagesLoaded: ImageLoadState;
  isLoading: boolean;
  progress: number;
  handleImageLoad: (key: string) => void;
  reset: () => void;
}

/**
 * Custom hook to track loading state of multiple images
 * @param imageKeys Array of unique keys for each image to track
 * @returns Object containing loading state, progress, and handlers
 */
export function useImageLoader(imageKeys: string[]): UseImageLoaderReturn {
  const [imagesLoaded, setImagesLoaded] = useState<ImageLoadState>(() => {
    const initialState: ImageLoadState = {};
    imageKeys.forEach((key) => {
      initialState[key] = false;
    });
    return initialState;
  });

  const handleImageLoad = useCallback((key: string) => {
    setImagesLoaded((prev) => {
      if (prev[key]) return prev; // Already loaded
      return { ...prev, [key]: true };
    });
  }, []);

  const reset = useCallback(() => {
    const resetState: ImageLoadState = {};
    imageKeys.forEach((key) => {
      resetState[key] = false;
    });
    setImagesLoaded(resetState);
  }, [imageKeys]);

  const loadedCount = Object.values(imagesLoaded).filter(Boolean).length;
  const totalImages = imageKeys.length;
  const isLoading = loadedCount < totalImages;
  const progress =
    totalImages > 0 ? Math.round((loadedCount / totalImages) * 100) : 0;

  return {
    imagesLoaded,
    isLoading,
    progress,
    handleImageLoad,
    reset,
  };
}
