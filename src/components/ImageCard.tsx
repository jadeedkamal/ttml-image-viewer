import React, { useState } from 'react';
import type { ImageItem } from '../types';

interface ImageCardProps {
  image: ImageItem;
  onClick: () => void;
  onLoad?: () => void;
  tabIndex?: number;
}

export function ImageCard({ image, onClick, onLoad, tabIndex }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useThumb, setUseThumb] = useState(!!image.thumbUrl);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    if (useThumb && image.thumbUrl) {
      // Fallback to main image if thumbnail fails
      setUseThumb(false);
      setHasError(false);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const imageUrl = useThumb && image.thumbUrl ? image.thumbUrl : image.url;
  const fileName = image.name.split('/').pop() || image.name;

  return (
<div
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role="button"
      aria-label={`View image ${fileName}`}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
        </div>
      )}

      {/* Image */}
      {!hasError && (
        <img
          src={imageUrl}
          alt={fileName}
          className={`
            w-full h-full object-cover transition-all duration-300 group-hover:scale-105
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Overlay with filename */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-white text-sm truncate font-medium">{fileName}</p>
        </div>
      </div>
    </div>
  );
}