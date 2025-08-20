import React, { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ImageCard } from './ImageCard';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import type { ImageItem } from '../types';

interface GalleryGridProps {
  images: ImageItem[];
  onImageClick: (image: ImageItem, index: number) => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
}

export function GalleryGrid({
  images,
  onImageClick,
  onLoadMore,
  hasNextPage,
  isLoadingMore
}: GalleryGridProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Calculate responsive grid columns
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 2;
    if (width < 768) return 3;
    if (width < 1024) return 4;
    if (width < 1280) return 5;
    return 6;
  };

  const [columnCount, setColumnCount] = React.useState(getColumnCount);

  React.useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Group images into rows for virtualization
  const rows = useMemo(() => {
    const result: ImageItem[][] = [];
    for (let i = 0; i < images.length; i += columnCount) {
      result.push(images.slice(i, i + columnCount));
    }
    return result;
  }, [images, columnCount]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // Approximate row height including gap
    overscan: 5,
  });

  // Intersection observer for infinite scroll
  const setElement = useIntersectionObserver(() => {
    if (hasNextPage && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  });

  const handleKeyboardNavigation = React.useCallback((e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const currentIndex = parseInt(target.getAttribute('data-index') || '0');
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(currentIndex + 1, images.length - 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + columnCount, images.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - columnCount, 0);
        break;
      default:
        return;
    }
    
    if (nextIndex !== currentIndex) {
      e.preventDefault();
      const nextElement = document.querySelector(`[data-index="${nextIndex}"]`) as HTMLElement;
      nextElement?.focus();
    }
  }, [images.length, columnCount]);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
        </svg>
        <h3 className="text-lg font-medium mb-2">No images found</h3>
        <p className="text-sm">Try adjusting your search or check your configuration.</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-screen overflow-auto"
      onKeyDown={handleKeyboardNavigation}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;

          return (
            // GOOD - single style attribute with all properties
            <div
            className="grid gap-4 p-4"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
            >
              {row.map((image, colIndex) => {
                const globalIndex = virtualRow.index * columnCount + colIndex;
                return (
                  <ImageCard
                    key={image.name}
                    image={image}
                    onClick={() => onImageClick(image, globalIndex)}
                    tabIndex={0}
                    data-index={globalIndex}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Loading more indicator */}
      {hasNextPage && (
        <div
          ref={setElement}
          className="flex justify-center py-8"
        >
          {isLoadingMore ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading more images...</span>
            </div>
          ) : (
            <div className="h-8" /> // Sentinel element
          )}
        </div>
      )}
    </div>
  );
}