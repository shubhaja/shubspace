import * as faceapi from 'face-api.js'

// Types for facial landmarks
export interface FaceLandmarks {
  positions: { x: number; y: number }[]
  imageIndex: number
}

// Initialize face-api models
let modelsLoaded = false

export async function loadModels() {
  if (modelsLoaded) return
  
  const MODEL_URL = '/models'
  
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ])
    modelsLoaded = true
    console.log('Face detection models loaded successfully')
  } catch (error) {
    console.error('Error loading face detection models:', error)
    throw error
  }
}

// Detect face and extract 68 landmark points
export async function detectFaceLandmarks(imageElement: HTMLImageElement): Promise<FaceLandmarks | null> {
  if (!modelsLoaded) {
    await loadModels()
  }
  
  try {
    const detection = await faceapi
      .detectSingleFace(imageElement)
      .withFaceLandmarks()
    
    if (!detection) {
      console.warn('No face detected in image')
      return null
    }
    
    // Extract the 68 landmark points
    const landmarks = detection.landmarks.positions.map(pos => ({
      x: pos.x,
      y: pos.y
    }))
    
    return {
      positions: landmarks,
      imageIndex: 0 // Will be set by caller
    }
  } catch (error) {
    console.error('Error detecting face landmarks:', error)
    return null
  }
}

// Normalize landmarks to a common coordinate system (0-1 range)
export function normalizeLandmarks(landmarks: FaceLandmarks, imageWidth: number, imageHeight: number): FaceLandmarks {
  return {
    ...landmarks,
    positions: landmarks.positions.map(pos => ({
      x: pos.x / imageWidth,
      y: pos.y / imageHeight
    }))
  }
}

// Get average landmarks from multiple faces
export function getAverageLandmarks(allLandmarks: FaceLandmarks[]): { x: number; y: number }[] {
  if (allLandmarks.length === 0) return []
  
  const numPoints = allLandmarks[0].positions.length
  const averagePositions: { x: number; y: number }[] = []
  
  for (let i = 0; i < numPoints; i++) {
    let sumX = 0
    let sumY = 0
    
    for (const landmarks of allLandmarks) {
      sumX += landmarks.positions[i].x
      sumY += landmarks.positions[i].y
    }
    
    averagePositions.push({
      x: sumX / allLandmarks.length,
      y: sumY / allLandmarks.length
    })
  }
  
  return averagePositions
}

// Add corner points for triangulation
export function addCornerPoints(landmarks: { x: number; y: number }[]): { x: number; y: number }[] {
  return [
    ...landmarks,
    { x: 0, y: 0 },           // Top-left
    { x: 1, y: 0 },           // Top-right
    { x: 0, y: 1 },           // Bottom-left
    { x: 1, y: 1 },           // Bottom-right
    { x: 0.5, y: 0 },         // Top-center
    { x: 0.5, y: 1 },         // Bottom-center
    { x: 0, y: 0.5 },         // Left-center
    { x: 1, y: 0.5 },         // Right-center
  ]
} 