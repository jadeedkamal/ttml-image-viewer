// src/services/azureGalleryService.ts
import type { ImageItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface GalleryResponse {
  images: ImageItem[];
  continuationToken?: string;
  hasMore: boolean;
}

export const azureGalleryService = {
  /**
   * Fetch images with SAS URLs from your backend
   */
  async getImages(continuationToken?: string): Promise<GalleryResponse> {
    const url = new URL(`${API_BASE_URL}/gallery/images`);
    if (continuationToken) {
      url.searchParams.set('continuationToken', continuationToken);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get a single SAS URL for a specific blob
   */
  async getSASUrl(containerName: string, blobName: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/gallery/sas-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        containerName, 
        blobName 
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get SAS URL: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  },

  /**
   * Refresh SAS URLs for existing images when they're about to expire
   */
  async refreshImageUrls(images: ImageItem[]): Promise<ImageItem[]> {
    const response = await fetch(`${API_BASE_URL}/gallery/refresh-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        images: images.map(img => ({ 
          name: img.name, 
          container: img.container || 'default-container' 
        }))
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh URLs: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
};