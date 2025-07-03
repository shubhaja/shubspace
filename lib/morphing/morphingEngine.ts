import { FaceLandmarks } from '@/lib/face-detection/faceDetection'
import { createTriangulation, Triangle, Point } from '@/lib/triangulation/triangulation'
import { morphCache } from './morphCache'

export interface MorphedImageData {
  canvas: HTMLCanvasElement
  imageData: ImageData
}

// Calculate weighted average of landmark positions
export function calculateWeightedLandmarks(
  allLandmarks: FaceLandmarks[],
  weights: number[]
): Point[] {
  // Normalize weights to sum to 1
  const sum = weights.reduce((a, b) => a + b, 0)
  const normalizedWeights = weights.map(w => w / sum)
  
  // Get number of landmark points
  const numPoints = allLandmarks[0].positions.length
  const weightedPositions: Point[] = []
  
  // Calculate weighted average for each landmark point
  for (let i = 0; i < numPoints; i++) {
    let x = 0
    let y = 0
    
    for (let j = 0; j < allLandmarks.length; j++) {
      x += allLandmarks[j].positions[i].x * normalizedWeights[j]
      y += allLandmarks[j].positions[i].y * normalizedWeights[j]
    }
    
    weightedPositions.push({ x, y })
  }
  
  return weightedPositions
}

// Create affine transformation matrix from triangle to triangle
function getAffineTransform(
  srcTriangle: { p1: Point; p2: Point; p3: Point },
  dstTriangle: { p1: Point; p2: Point; p3: Point }
): number[] {
  const x1 = srcTriangle.p1.x
  const y1 = srcTriangle.p1.y
  const x2 = srcTriangle.p2.x
  const y2 = srcTriangle.p2.y
  const x3 = srcTriangle.p3.x
  const y3 = srcTriangle.p3.y
  
  const u1 = dstTriangle.p1.x
  const v1 = dstTriangle.p1.y
  const u2 = dstTriangle.p2.x
  const v2 = dstTriangle.p2.y
  const u3 = dstTriangle.p3.x
  const v3 = dstTriangle.p3.y
  
  const denominator = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)
  
  const a = ((u1 * (y2 - y3) + u2 * (y3 - y1) + u3 * (y1 - y2)) / denominator)
  const b = ((u1 * (x3 - x2) + u2 * (x1 - x3) + u3 * (x2 - x1)) / denominator)
  const c = ((u1 * (x2 * y3 - x3 * y2) + u2 * (x3 * y1 - x1 * y3) + u3 * (x1 * y2 - x2 * y1)) / denominator)
  const d = ((v1 * (y2 - y3) + v2 * (y3 - y1) + v3 * (y1 - y2)) / denominator)
  const e = ((v1 * (x3 - x2) + v2 * (x1 - x3) + v3 * (x2 - x1)) / denominator)
  const f = ((v1 * (x2 * y3 - x3 * y2) + v2 * (x3 * y1 - x1 * y3) + v3 * (x1 * y2 - x2 * y1)) / denominator)
  
  return [a, b, c, d, e, f]
}

// Apply affine transformation to a point
function applyAffineTransform(point: Point, transform: number[]): Point {
  const [a, b, c, d, e, f] = transform
  return {
    x: a * point.x + b * point.y + c,
    y: d * point.x + e * point.y + f
  }
}

// Check if a point is inside a triangle
function isPointInTriangle(p: Point, p1: Point, p2: Point, p3: Point): boolean {
  const denominator = (p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y)
  const a = ((p2.y - p3.y) * (p.x - p3.x) + (p3.x - p2.x) * (p.y - p3.y)) / denominator
  const b = ((p3.y - p1.y) * (p.x - p3.x) + (p1.x - p3.x) * (p.y - p3.y)) / denominator
  const c = 1 - a - b
  
  return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1
}

// Bilinear interpolation for sampling pixels
function bilinearInterpolate(
  imageData: ImageData,
  x: number,
  y: number
): { r: number; g: number; b: number; a: number } {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data
  
  // Clamp coordinates
  x = Math.max(0, Math.min(x, width - 1))
  y = Math.max(0, Math.min(y, height - 1))
  
  const x1 = Math.floor(x)
  const x2 = Math.min(x1 + 1, width - 1)
  const y1 = Math.floor(y)
  const y2 = Math.min(y1 + 1, height - 1)
  
  const fx = x - x1
  const fy = y - y1
  
  // Get pixel values
  const idx11 = (y1 * width + x1) * 4
  const idx12 = (y1 * width + x2) * 4
  const idx21 = (y2 * width + x1) * 4
  const idx22 = (y2 * width + x2) * 4
  
  // Interpolate
  const r = (1 - fx) * (1 - fy) * data[idx11] +
            fx * (1 - fy) * data[idx12] +
            (1 - fx) * fy * data[idx21] +
            fx * fy * data[idx22]
            
  const g = (1 - fx) * (1 - fy) * data[idx11 + 1] +
            fx * (1 - fy) * data[idx12 + 1] +
            (1 - fx) * fy * data[idx21 + 1] +
            fx * fy * data[idx22 + 1]
            
  const b = (1 - fx) * (1 - fy) * data[idx11 + 2] +
            fx * (1 - fy) * data[idx12 + 2] +
            (1 - fx) * fy * data[idx21 + 2] +
            fx * fy * data[idx22 + 2]
            
  const a = (1 - fx) * (1 - fy) * data[idx11 + 3] +
            fx * (1 - fy) * data[idx12 + 3] +
            (1 - fx) * fy * data[idx21 + 3] +
            fx * fy * data[idx22 + 3]
  
  return { r, g, b, a }
}

// Warp a single image to target landmarks using inverse warping
export async function warpImageToTarget(
  sourceImage: HTMLImageElement,
  sourceLandmarks: Point[],
  targetLandmarks: Point[],
  triangles: Triangle[],
  outputWidth: number,
  outputHeight: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d', { 
    willReadFrequently: true,
    alpha: true,
    desynchronized: true // Hint for better performance
  })!
  
  // Create a temporary canvas for the source image
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = sourceImage.width
  srcCanvas.height = sourceImage.height
  const srcCtx = srcCanvas.getContext('2d', { 
    willReadFrequently: true,
    alpha: true,
    desynchronized: true
  })!
  srcCtx.drawImage(sourceImage, 0, 0)
  const srcImageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height)
  
  // Create output image data
  const outputImageData = ctx.createImageData(outputWidth, outputHeight)
  const outputData = outputImageData.data
  
  // Fill with transparent black
  for (let i = 0; i < outputData.length; i += 4) {
    outputData[i] = 0
    outputData[i + 1] = 0
    outputData[i + 2] = 0
    outputData[i + 3] = 255
  }
  
  // Pre-calculate scale factors
  const outputWidthScale = outputWidth
  const outputHeightScale = outputHeight
  const srcWidthScale = srcCanvas.width
  const srcHeightScale = srcCanvas.height
  
  // Process each triangle using inverse warping
  for (const triangle of triangles) {
    // Check bounds
    if (triangle.p1 >= targetLandmarks.length || 
        triangle.p2 >= targetLandmarks.length || 
        triangle.p3 >= targetLandmarks.length) {
      continue
    }
    
    // Get destination triangle (in target/output image)
    const dstTri = {
      p1: {
        x: targetLandmarks[triangle.p1].x * outputWidthScale,
        y: targetLandmarks[triangle.p1].y * outputHeightScale
      },
      p2: {
        x: targetLandmarks[triangle.p2].x * outputWidthScale,
        y: targetLandmarks[triangle.p2].y * outputHeightScale
      },
      p3: {
        x: targetLandmarks[triangle.p3].x * outputWidthScale,
        y: targetLandmarks[triangle.p3].y * outputHeightScale
      }
    }
    
    // Get source triangle
    const srcTri = {
      p1: {
        x: sourceLandmarks[triangle.p1].x * srcWidthScale,
        y: sourceLandmarks[triangle.p1].y * srcHeightScale
      },
      p2: {
        x: sourceLandmarks[triangle.p2].x * srcWidthScale,
        y: sourceLandmarks[triangle.p2].y * srcHeightScale
      },
      p3: {
        x: sourceLandmarks[triangle.p3].x * srcWidthScale,
        y: sourceLandmarks[triangle.p3].y * srcHeightScale
      }
    }
    
    // Skip degenerate triangles
    const area = Math.abs((dstTri.p1.x * (dstTri.p2.y - dstTri.p3.y) + 
                          dstTri.p2.x * (dstTri.p3.y - dstTri.p1.y) + 
                          dstTri.p3.x * (dstTri.p1.y - dstTri.p2.y)) / 2)
    if (area < 0.01) continue
    
    // Get affine transformation from destination to source
    const transform = getAffineTransform(dstTri, srcTri)
    
    // Find bounding box of destination triangle
    const minX = Math.floor(Math.min(dstTri.p1.x, dstTri.p2.x, dstTri.p3.x))
    const maxX = Math.ceil(Math.max(dstTri.p1.x, dstTri.p2.x, dstTri.p3.x))
    const minY = Math.floor(Math.min(dstTri.p1.y, dstTri.p2.y, dstTri.p3.y))
    const maxY = Math.ceil(Math.max(dstTri.p1.y, dstTri.p2.y, dstTri.p3.y))
    
    // Clamp to canvas bounds
    const startX = Math.max(0, minX)
    const endX = Math.min(outputWidth - 1, maxX)
    const startY = Math.max(0, minY)
    const endY = Math.min(outputHeight - 1, maxY)
    
    // Iterate through pixels in bounding box
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        // Check if pixel is inside destination triangle
        if (isPointInTriangle({ x, y }, dstTri.p1, dstTri.p2, dstTri.p3)) {
          // Transform pixel to source coordinates
          const srcPoint = applyAffineTransform({ x, y }, transform)
          
          // Sample from source image using bilinear interpolation
          const color = bilinearInterpolate(srcImageData, srcPoint.x, srcPoint.y)
          
          // Set pixel in output
          const idx = (y * outputWidth + x) * 4
          outputData[idx] = color.r
          outputData[idx + 1] = color.g
          outputData[idx + 2] = color.b
          outputData[idx + 3] = 255
        }
      }
    }
  }
  
  // Put the image data on the canvas
  ctx.putImageData(outputImageData, 0, 0)
  
  return canvas
}

// Blend multiple warped images with weights
export function blendImages(
  warpedCanvases: HTMLCanvasElement[],
  weights: number[]
): HTMLCanvasElement {
  if (warpedCanvases.length === 0) return document.createElement('canvas')
  
  // Normalize weights to sum to 1
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  const normalizedWeights = weights.map(w => w / sum)
  
  // Filter out zero-weight canvases early
  const activeCanvases: { canvas: HTMLCanvasElement; weight: number }[] = []
  for (let i = 0; i < warpedCanvases.length; i++) {
    if (normalizedWeights[i] > 0.001) { // Skip very small weights
      activeCanvases.push({ canvas: warpedCanvases[i], weight: normalizedWeights[i] })
    }
  }
  
  // If only one canvas has weight, return it directly
  if (activeCanvases.length === 1 && Math.abs(activeCanvases[0].weight - 1) < 0.001) {
    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = activeCanvases[0].canvas.width
    outputCanvas.height = activeCanvases[0].canvas.height
    const ctx = outputCanvas.getContext('2d')!
    ctx.drawImage(activeCanvases[0].canvas, 0, 0)
    return outputCanvas
  }
  
  // Create output canvas
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = warpedCanvases[0].width
  outputCanvas.height = warpedCanvases[0].height
  const ctx = outputCanvas.getContext('2d', { willReadFrequently: true })!
  
  // Get all image data at once to minimize context switches
  const imageDatas: { data: Uint8ClampedArray; weight: number }[] = []
  for (const { canvas, weight } of activeCanvases) {
    const tempCtx = canvas.getContext('2d', { willReadFrequently: true })!
    const imageData = tempCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height)
    imageDatas.push({ data: imageData.data, weight })
  }
  
  // Create output image data
  const outputImageData = ctx.createImageData(outputCanvas.width, outputCanvas.height)
  const outputData = outputImageData.data
  const pixelCount = outputData.length
  
  // Blend all pixels in a single loop
  for (let i = 0; i < pixelCount; i += 4) {
    let r = 0, g = 0, b = 0
    
    for (const { data, weight } of imageDatas) {
      r += data[i] * weight
      g += data[i + 1] * weight
      b += data[i + 2] * weight
    }
    
    outputData[i] = Math.round(r)
    outputData[i + 1] = Math.round(g)
    outputData[i + 2] = Math.round(b)
    outputData[i + 3] = 255
  }
  
  // Put the blended image data on the canvas
  ctx.putImageData(outputImageData, 0, 0)
  
  return outputCanvas
}

// Main morphing function
export async function morphFaces(
  images: HTMLImageElement[],
  landmarks: FaceLandmarks[],
  weights: number[]
): Promise<HTMLCanvasElement> {
  // Check cache first
  const cached = morphCache.get(weights, images.length)
  if (cached) {
    return cached
  }
  
  // Use the dimensions of the first image as the output size
  const outputWidth = images[0].width
  const outputHeight = images[0].height
  
  // Calculate target (weighted average) landmarks
  const targetLandmarks = calculateWeightedLandmarks(landmarks, weights)
  
  // Add boundary points for triangulation
  const boundaryPoints = [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
    { x: 0.5, y: 0 }, { x: 0.5, y: 1 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }
  ]
  
  const allTargetPoints = [
    ...targetLandmarks,
    ...boundaryPoints
  ]
  
  // Create triangulation using all points including boundaries
  const triangles = createTriangulation(allTargetPoints)
  
  // Warp each image to the target shape
  const warpedCanvases: HTMLCanvasElement[] = []
  
  for (let i = 0; i < images.length; i++) {
    const sourcePoints = [
      ...landmarks[i].positions,
      ...boundaryPoints
    ]
    
    const warpedCanvas = await warpImageToTarget(
      images[i],
      sourcePoints,
      allTargetPoints,
      triangles,
      outputWidth,
      outputHeight
    )
    
    warpedCanvases.push(warpedCanvas)
  }
  
  // Blend the warped images
  const result = blendImages(warpedCanvases, weights)
  
  // Cache the result
  morphCache.set(weights, images.length, result)
  
  return result
} 