export interface ImageItem {
  name: string;
  url: string;
  thumbUrl?: string;
  size?: number;
  contentType?: string;
  lastModified?: string;
  container?: string; // Added container property
}

export interface ListImagesResult {
  items: ImageItem[];
  nextToken?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
}