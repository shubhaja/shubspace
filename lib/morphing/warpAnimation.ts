import { Point } from '@/lib/triangulation/triangulation'

export interface AnimationFrame {
  canvas: HTMLCanvasElement
  progress: number
}

export class WarpAnimator {
  private frames: AnimationFrame[] = []
  private currentFrame = 0
  private animationId: number | null = null
  private isPlaying = false
  private direction: 'forward' | 'backward' = 'forward'
  
  constructor(
    private sourceCanvas: HTMLCanvasElement,
    private targetCanvas: HTMLCanvasElement,
    private frameCount: number = 30
  ) {}
  
  // Generate intermediate frames between source and target
  generateFrames(): void {
    this.frames = []
    
    for (let i = 0; i <= this.frameCount; i++) {
      const progress = i / this.frameCount
      const frame = this.createInterpolatedFrame(progress)
      this.frames.push({ canvas: frame, progress })
    }
  }
  
  private createInterpolatedFrame(progress: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = this.sourceCanvas.width
    canvas.height = this.sourceCanvas.height
    const ctx = canvas.getContext('2d')!
    
    // Draw base image
    ctx.drawImage(this.sourceCanvas, 0, 0)
    
    // Create a mesh overlay effect during transition
    if (progress > 0 && progress < 1) {
      // Semi-transparent overlay
      ctx.globalAlpha = progress * 0.6
      ctx.drawImage(this.targetCanvas, 0, 0)
      
      // Add mesh grid visualization
      ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.3
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 1
      
      // Draw grid lines to show warping
      const gridSize = 20
      for (let x = 0; x < canvas.width; x += gridSize) {
        const offset = Math.sin(progress * Math.PI) * 10 * Math.sin(x / 50)
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + offset, canvas.height)
        ctx.stroke()
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        const offset = Math.sin(progress * Math.PI) * 10 * Math.cos(y / 50)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y + offset)
        ctx.stroke()
      }
    } else if (progress === 1) {
      // Full target image
      ctx.drawImage(this.targetCanvas, 0, 0)
    }
    
    return canvas
  }
  
  play(canvas: HTMLCanvasElement, loop: boolean = true, fps: number = 24): void {
    if (this.isPlaying) return
    
    this.isPlaying = true
    const ctx = canvas.getContext('2d')!
    const frameDelay = 1000 / fps
    let lastTime = 0
    
    const animate = (currentTime: number) => {
      if (!this.isPlaying) return
      
      // Control frame rate
      if (currentTime - lastTime < frameDelay) {
        this.animationId = requestAnimationFrame(animate)
        return
      }
      lastTime = currentTime
      
      // Draw current frame
      const frame = this.frames[this.currentFrame]
      if (frame) {
        // Don't clear - just draw over to avoid white flash
        ctx.drawImage(frame.canvas, 0, 0)
      }
      
      // Update frame index
      if (this.direction === 'forward') {
        this.currentFrame++
        if (this.currentFrame >= this.frames.length) {
          if (loop) {
            this.direction = 'backward'
            this.currentFrame = this.frames.length - 1
          } else {
            this.stop()
            return
          }
        }
      } else {
        this.currentFrame--
        if (this.currentFrame < 0) {
          if (loop) {
            this.direction = 'forward'
            this.currentFrame = 0
          } else {
            this.stop()
            return
          }
        }
      }
      
      this.animationId = requestAnimationFrame(animate)
    }
    
    animate(0)
  }
  
  stop(): void {
    this.isPlaying = false
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }
  
  reset(): void {
    this.currentFrame = 0
    this.direction = 'forward'
  }
  
  destroy(): void {
    this.stop()
    this.frames = []
  }
}

// Helper to create smooth morph animation between two sets of points
export function createMorphAnimation(
  sourceImage: HTMLImageElement,
  sourcePoints: Point[],
  targetPoints: Point[],
  width: number,
  height: number,
  steps: number = 30
): AnimationFrame[] {
  const frames: AnimationFrame[] = []
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    
    // Interpolate points
    const interpolatedPoints = sourcePoints.map((srcPt, idx) => {
      const tgtPt = targetPoints[idx]
      return {
        x: srcPt.x + (tgtPt.x - srcPt.x) * t,
        y: srcPt.y + (tgtPt.y - srcPt.y) * t
      }
    })
    
    // For now, we'll use a simple approach
    // In a full implementation, we'd use the warpImageToTarget function
    // with the interpolated points
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    
    // Simple morph visualization - can be enhanced
    ctx.drawImage(sourceImage, 0, 0, width, height)
    
    // Add visual effect to show warping
    ctx.globalAlpha = t * 0.3
    ctx.fillStyle = '#ff1493'
    ctx.fillRect(0, 0, width, height)
    
    frames.push({ canvas, progress: t })
  }
  
  return frames
} 