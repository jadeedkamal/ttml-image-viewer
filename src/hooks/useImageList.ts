import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query'; // Import InfiniteData
import { azureGalleryService } from '../services/azureGalleryService'; 
import type { GalleryResponse } from '../services/azureGalleryService'; 

export function useImageList(prefix?: string) {
  return useInfiniteQuery<GalleryResponse, Error, InfiniteData<GalleryResponse>, ['images', string | undefined], string | undefined>({
    queryKey: ['images', prefix],
    queryFn: ({ pageParam }) => azureGalleryService.getImages(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.continuationToken, 
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    retry: (failureCount, error: any) => {
      if (error?.status === 403) return false;
      return failureCount < 3;
    }
  });
}

export function usePrefetch(nextPageKey?: string) {
  return null;
}