import Delaunator from 'delaunator'

export interface Point {
  x: number
  y: number
}

export interface Triangle {
  p1: number  // Index of first point
  p2: number  // Index of second point
  p3: number  // Index of third point
}

// Create Delaunay triangulation from points
export function createTriangulation(points: Point[]): Triangle[] {
  // Add boundary points for better triangulation
  const boundaryPoints: Point[] = [
    { x: 0, y: 0 },         // Top-left
    { x: 1, y: 0 },         // Top-right
    { x: 0, y: 1 },         // Bottom-left
    { x: 1, y: 1 },         // Bottom-right
    { x: 0.5, y: 0 },       // Top-center
    { x: 0.5, y: 1 },       // Bottom-center
    { x: 0, y: 0.5 },       // Left-center
    { x: 1, y: 0.5 },       // Right-center
  ]
  
  const allPoints = [...points, ...boundaryPoints]
  
  // Convert points to array format for Delaunator
  const pointsArray = allPoints.map(p => [p.x, p.y])
  
  try {
    // Create triangulation
    const delaunay = Delaunator.from(pointsArray)
    
    // Convert triangle indices to our format
    const triangles: Triangle[] = []
    for (let i = 0; i < delaunay.triangles.length; i += 3) {
      triangles.push({
        p1: delaunay.triangles[i],
        p2: delaunay.triangles[i + 1],
        p3: delaunay.triangles[i + 2]
      })
    }
    
    return triangles
  } catch (error) {
    console.error('Delaunator error:', error)
    return []
  }
}

// Get the bounding box of a triangle
export function getTriangleBounds(triangle: Triangle, points: Point[]) {
  const p1 = points[triangle.p1]
  const p2 = points[triangle.p2]
  const p3 = points[triangle.p3]
  
  return {
    minX: Math.min(p1.x, p2.x, p3.x),
    maxX: Math.max(p1.x, p2.x, p3.x),
    minY: Math.min(p1.y, p2.y, p3.y),
    maxY: Math.max(p1.y, p2.y, p3.y)
  }
}

// Check if a point is inside a triangle
export function isPointInTriangle(
  px: number, 
  py: number, 
  triangle: Triangle, 
  points: Point[]
): boolean {
  const p1 = points[triangle.p1]
  const p2 = points[triangle.p2]
  const p3 = points[triangle.p3]
  
  const denominator = ((p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y))
  
  const a = ((p2.y - p3.y) * (px - p3.x) + (p3.x - p2.x) * (py - p3.y)) / denominator
  const b = ((p3.y - p1.y) * (px - p3.x) + (p1.x - p3.x) * (py - p3.y)) / denominator
  const c = 1 - a - b
  
  return a >= 0 && b >= 0 && c >= 0
}

// Calculate barycentric coordinates for a point in a triangle
export function getBarycentricCoordinates(
  px: number,
  py: number,
  triangle: Triangle,
  points: Point[]
): { u: number; v: number; w: number } {
  const p1 = points[triangle.p1]
  const p2 = points[triangle.p2]
  const p3 = points[triangle.p3]
  
  const denominator = ((p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y))
  
  const u = ((p2.y - p3.y) * (px - p3.x) + (p3.x - p2.x) * (py - p3.y)) / denominator
  const v = ((p3.y - p1.y) * (px - p3.x) + (p1.x - p3.x) * (py - p3.y)) / denominator
  const w = 1 - u - v
  
  return { u, v, w }
} 