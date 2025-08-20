import { BlobServiceClient, AnonymousCredential, newPipeline } from '@azure/storage-blob';
import type { ImageItem, ListImagesResult } from '../types';

const ACCOUNT_URL = import.meta.env.VITE_AZURE_ACCOUNT_URL;
const CONTAINER_NAME = import.meta.env.VITE_AZURE_CONTAINER;
const SAS_TOKEN = import.meta.env.VITE_AZURE_SAS;
const BLOB_PREFIX = import.meta.env.VITE_BLOB_PREFIX || '';

if (!ACCOUNT_URL || !CONTAINER_NAME || !SAS_TOKEN) {
  throw new Error('Missing required Azure configuration. Check your .env file.');
}

let blobServiceClient: BlobServiceClient;

export function createBlobServiceClient(sasToken: string = SAS_TOKEN): BlobServiceClient {
  const pipeline = newPipeline(new AnonymousCredential());
  const serviceUrl = `${ACCOUNT_URL}${sasToken}`;
  return new BlobServiceClient(serviceUrl, pipeline);
}

export function initializeAzureClient(): void {
  blobServiceClient = createBlobServiceClient();
}

export function getImageUrl(blobName: string, sasToken: string = SAS_TOKEN): string {
  return `${ACCOUNT_URL}/${CONTAINER_NAME}/${blobName}${sasToken}`;
}

export function getThumbUrl(blobName: string, sasToken: string = SAS_TOKEN): string | undefined {
  // Try to derive thumbnail URL
  if (blobName.startsWith('images/')) {
    const thumbName = blobName.replace('images/', 'thumbs/');
    return `${ACCOUNT_URL}/${CONTAINER_NAME}/${thumbName}${sasToken}`;
  }
  
  if (blobName.includes('.')) {
    const parts = blobName.split('.');
    const ext = parts.pop();
    const nameWithoutExt = parts.join('.');
    const thumbName = `${nameWithoutExt}-thumb.${ext}`;
    return `${ACCOUNT_URL}/${CONTAINER_NAME}/${thumbName}${sasToken}`;
  }
  
  return undefined;
}

export async function listImages(
  prefix: string = BLOB_PREFIX,
  continuationToken?: string,
  pageSize: number = 300
): Promise<ListImagesResult> {
  try {
    if (!blobServiceClient) {
      initializeAzureClient();
    }

    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const options = {
      prefix,
      maxPageSize: pageSize,
      ...(continuationToken && { continuationToken })
    };

    const items: ImageItem[] = [];
    const iterator = containerClient.listBlobsFlat(options).byPage({ maxPageSize: pageSize });
    const result = await iterator.next();

    if (result.done) {
      return { items: [] };
    }

    const page = result.value;
    
    for (const blob of page.segment.blobItems) {
      // Filter for image files
      const isImage = blob.properties.contentType?.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(blob.name);
      
      if (isImage) {
        const item: ImageItem = {
          name: blob.name,
          url: getImageUrl(blob.name),
          thumbUrl: getThumbUrl(blob.name),
          size: blob.properties.contentLength,
          contentType: blob.properties.contentType,
          lastModified: blob.properties.lastModified?.toISOString()
        };
        items.push(item);
      }
    }

    return {
      items,
      nextToken: page.continuationToken
    };
  } catch (error) {
    console.error('Error listing images:', error);
    throw error;
  }
}

export async function refreshSasToken(): Promise<string> {
  const refreshUrl = import.meta.env.VITE_SAS_REFRESH_URL;
  
  if (!refreshUrl) {
    throw new Error('No SAS refresh URL configured');
  }

  try {
    const response = await fetch(refreshUrl);
    if (!response.ok) {
      throw new Error(`Failed to refresh SAS token: ${response.status}`);
    }
    
    const data = await response.json();
    const newSasToken = data.sasToken || data.token;
    
    if (!newSasToken) {
      throw new Error('No SAS token in refresh response');
    }

    // Reinitialize client with new token
    blobServiceClient = createBlobServiceClient(newSasToken);
    
    return newSasToken;
  } catch (error) {
    console.error('Error refreshing SAS token:', error);
    throw error;
  }
}