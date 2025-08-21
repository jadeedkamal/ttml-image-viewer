import React from 'react';
import { QueryClient, QueryClientProvider, InfiniteData } from '@tanstack/react-query'; 
import { GalleryGrid } from './components/GalleryGrid';
import { Lightbox } from './components/Lightbox';
import { SasExpiredBanner } from './components/SasExpiredBanner'; 
import { useImageList } from './hooks/useImageList';
import type { ImageItem } from './types';
import type { GalleryResponse } from './services/azureGalleryService'; 
import './style.css'; 

const queryClient = new QueryClient();

function App() {
  const [selectedImage, setSelectedImage] = React.useState<ImageItem | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  const prefix = import.meta.env.VITE_BLOB_PREFIX || undefined;

  const { 
    data,
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    isError, 
    error 
  } = useImageList(prefix); // Removed explicit type annotation here

  const images: ImageItem[] = React.useMemo(() => {
    return data?.pages?.flatMap((page: GalleryResponse) => page.images) || [];
  }, [data]);

  const handleImageClick = (image: ImageItem, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  const handleNextImage = () => {
    if (selectedImage) {
      const nextIndex = (selectedIndex + 1) % images.length;
      setSelectedImage(images[nextIndex]);
      setSelectedIndex(nextIndex);
    }
  };

  const handlePrevImage = () => {
    if (selectedImage) {
      const prevIndex = (selectedIndex - 1 + images.length) % images.length;
      setSelectedImage(images[prevIndex]);
      setSelectedIndex(prevIndex);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading gallery...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Gallery</h1>
          <p className="text-gray-700">{error?.message || 'An unknown error occurred.'}</p>
          {error?.message.includes('Failed to fetch images') && (
            <p className="text-sm text-gray-500 mt-2">Please check if your backend server is running and configured correctly.</p>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-gray-100 min-h-screen"> 
      {/* <SasExpiredBanner /> Temporarily commented out */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Azure Image Gallery</h1>
      </header>
      
      <main className="container mx-auto p-4">
        <GalleryGrid
          images={images}
          onImageClick={handleImageClick}
          onLoadMore={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoadingMore={isFetchingNextPage}
        />
      </main>

      {selectedImage && (
        <Lightbox
          image={selectedImage} 
          onClose={handleCloseLightbox}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          hasPrev={selectedIndex > 0} 
          hasNext={selectedIndex < images.length - 1} 
        />
      )}
    </div>
  );
}

export default function ProvidedApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
