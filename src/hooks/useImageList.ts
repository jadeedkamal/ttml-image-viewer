import { useInfiniteQuery } from '@tanstack/react-query';
import { listImages } from '../lib/azure';
import type { ListImagesResult } from '../types';

export function useImageList(prefix?: string) {
  return useInfiniteQuery({
    queryKey: ['images', prefix],
    queryFn: ({ pageParam }) => listImages(prefix, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ListImagesResult) => lastPage.nextToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 403 (SAS expired)
      if (error?.status === 403) return false;
      return failureCount < 3;
    }
  });
}

export function usePrefetch(nextPageKey?: string) {
  // This could be implemented to warm the next page
  // For now, we'll rely on React Query's built-in prefetching
  return null;
}