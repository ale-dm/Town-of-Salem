'use client';

import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape';

interface UseOrientationReturn {
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
  height: number;
  width: number;
}

export const useOrientation = (): UseOrientationReturn => {
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      
      // Determine orientation based on aspect ratio
      // Also check screen.orientation API if available
      let newOrientation: Orientation;
      
      if (window.screen?.orientation?.type) {
        // Use Screen Orientation API if available
        const type = window.screen.orientation.type;
        newOrientation = type.includes('landscape') ? 'landscape' : 'portrait';
      } else {
        // Fallback to width/height comparison
        newOrientation = width > height ? 'landscape' : 'portrait';
      }
      
      setOrientation(newOrientation);
      
      console.log(`📱 Orientation changed: ${newOrientation} (${width}x${height})`);
    };

    // Initial check
    updateOrientation();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      updateOrientation();
    };

    const handleResize = () => {
      updateOrientation();
    };

    // Add event listeners
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
    
    // For modern browsers with Screen Orientation API
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    width: dimensions.width,
    height: dimensions.height,
  };
};
