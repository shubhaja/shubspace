import { FaceLandmarks } from '@/lib/face-detection/faceDetection'

interface CacheKey {
  weights: number[]
  imageCount: number
}

interface CacheEntry {
  key: string
  canvas: HTMLCanvasElement
  timestamp: number
}

class MorphCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number = 10
  private maxAge: number = 60000 // 1 minute

  private generateKey(weights: number[], imageCount: number): string {
    return `${weights.join(',')}-${imageCount}`
  }

  get(weights: number[], imageCount: number): HTMLCanvasElement | null {
    const key = this.generateKey(weights, imageCount)
    const entry = this.cache.get(key)
    
    if (entry) {
      // Check if entry is still valid
      if (Date.now() - entry.timestamp < this.maxAge) {
        // Move to end (LRU)
        this.cache.delete(key)
        this.cache.set(key, entry)
        return entry.canvas
      } else {
        // Entry expired
        this.cache.delete(key)
      }
    }
    
    return null
  }

  set(weights: number[], imageCount: number, canvas: HTMLCanvasElement): void {
    const key = this.generateKey(weights, imageCount)
    
    // Clone the canvas to avoid mutations
    const clonedCanvas = document.createElement('canvas')
    clonedCanvas.width = canvas.width
    clonedCanvas.height = canvas.height
    const ctx = clonedCanvas.getContext('2d')!
    ctx.drawImage(canvas, 0, 0)
    
    const entry: CacheEntry = {
      key,
      canvas: clonedCanvas,
      timestamp: Date.now()
    }
    
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, entry)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const morphCache = new MorphCache() 