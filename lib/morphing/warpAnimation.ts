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
  private pauseCounter = 0
  private pauseDuration = 10 // frames to pause at start/end
  
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
    
    // Clear canvas to prevent white flash
    ctx.fillStyle = '#f3f4f6' // Match background color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Smoothly blend between source and target
    ctx.globalAlpha = 1
    ctx.drawImage(this.sourceCanvas, 0, 0)
    
    if (progress > 0) {
      // Crossfade to target
      ctx.globalAlpha = progress
      ctx.drawImage(this.targetCanvas, 0, 0)
    }
    
    // Add mesh grid visualization on top
    if (progress > 0 && progress < 1) {
      ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.4
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 1
      
      // Draw warping grid lines
      const gridSize = 25
      for (let x = 0; x < canvas.width; x += gridSize) {
        const offset = Math.sin(progress * Math.PI) * 8 * Math.sin(x / 60)
        ctx.beginPath()
        ctx.moveTo(x + offset * 0.5, 0)
        ctx.lineTo(x + offset, canvas.height)
        ctx.stroke()
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        const offset = Math.sin(progress * Math.PI) * 8 * Math.cos(y / 60)
        ctx.beginPath()
        ctx.moveTo(0, y + offset * 0.5)
        ctx.lineTo(canvas.width, y + offset)
        ctx.stroke()
      }
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
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(frame.canvas, 0, 0)
      }
      
      // Handle pauses at start/end
      if ((this.currentFrame === 0 || this.currentFrame === this.frames.length - 1) && this.pauseCounter < this.pauseDuration) {
        this.pauseCounter++
      } else {
        this.pauseCounter = 0
        
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
    this.pauseCounter = 0
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