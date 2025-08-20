import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getImageUrl, getThumbUrl } from '../azure'

// Mock environment variables
vi.mock('../../env', () => ({
  VITE_AZURE_ACCOUNT_URL: 'https://testaccount.blob.core.windows.net',
  VITE_AZURE_CONTAINER: 'images',
  VITE_AZURE_SAS: '?sv=2022-11-02&sig=test'
}))

describe('Azure utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate correct image URL', () => {
    const url = getImageUrl('test/image.jpg')
    expect(url).toBe('https://testaccount.blob.core.windows.net/images/test/image.jpg?sv=2022-11-02&sig=test')
  })

  it('should generate thumbnail URL for images/ prefix', () => {
    const thumbUrl = getThumbUrl('images/photo.jpg')
    expect(thumbUrl).toBe('https://testaccount.blob.core.windows.net/images/thumbs/photo.jpg?sv=2022-11-02&sig=test')
  })

  it('should generate thumbnail URL with -thumb suffix', () => {
    const thumbUrl = getThumbUrl('gallery/photo.jpg')
    expect(thumbUrl).toBe('https://testaccount.blob.core.windows.net/images/gallery/photo-thumb.jpg?sv=2022-11-02&sig=test')
  })

  it('should return undefined for files without extension', () => {
    const thumbUrl = getThumbUrl('test-file')
    expect(thumbUrl).toBeUndefined()
  })
})