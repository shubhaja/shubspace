interface CacheEntry {
  key: string
  canvas: HTMLCanvasElement
  timestamp: number
}

export class MorphCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number = 50 // Increased cache size
  private maxAge: number = 300000 // 5 minutes
  
  // Canvas pool to reuse canvases
  private canvasPool: HTMLCanvasElement[] = []
  private maxPoolSize: number = 10

  private generateKey(weights: number[], imageCount: number): string {
    return `${weights.join(',')}-${imageCount}`
  }
  
  private getPooledCanvas(width: number, height: number): HTMLCanvasElement {
    // Try to reuse a canvas from the pool
    let canvas = this.canvasPool.find(c => c.width === width && c.height === height)
    
    if (!canvas && this.canvasPool.length > 0) {
      canvas = this.canvasPool.pop()!
      canvas.width = width
      canvas.height = height
    }
    
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
    }
    
    return canvas
  }
  
  private returnToPool(canvas: HTMLCanvasElement): void {
    if (this.canvasPool.length < this.maxPoolSize) {
      // Clear the canvas before returning to pool
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      this.canvasPool.push(canvas)
    }
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
        // Entry expired - return canvas to pool
        this.returnToPool(entry.canvas)
        this.cache.delete(key)
      }
    }
    
    return null
  }

  set(weights: number[], imageCount: number, canvas: HTMLCanvasElement): void {
    const key = this.generateKey(weights, imageCount)
    
    // Check if we already have this key
    const existingEntry = this.cache.get(key)
    if (existingEntry) {
      this.returnToPool(existingEntry.canvas)
    }
    
    // Clone the canvas using pooled canvas
    const clonedCanvas = this.getPooledCanvas(canvas.width, canvas.height)
    const ctx = clonedCanvas.getContext('2d')!
    ctx.drawImage(canvas, 0, 0)
    
    const entry: CacheEntry = {
      key,
      canvas: clonedCanvas,
      timestamp: Date.now()
    }
    
    // Remove oldest entries if cache is full
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        const oldEntry = this.cache.get(firstKey)
        if (oldEntry) {
          this.returnToPool(oldEntry.canvas)
        }
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, entry)
  }

  clear(): void {
    // Return all canvases to pool or clear them
    this.cache.forEach(entry => {
      this.returnToPool(entry.canvas)
    })
    this.cache.clear()
    
    // Clear the pool
    this.canvasPool = []
  }
}

export const morphCache = new MorphCache() 