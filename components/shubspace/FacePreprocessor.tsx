'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { loadModels, detectFaceLandmarks, normalizeLandmarks, FaceLandmarks } from '@/lib/face-detection/faceDetection'

interface ProcessedFaceData {
  imageIndex: number
  landmarks: FaceLandmarks
  imageUrl: string
}

export default function FacePreprocessor({ onComplete, autoStart = false }: { onComplete: (data: ProcessedFaceData[]) => void; autoStart?: boolean }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processedData, setProcessedData] = useState<ProcessedFaceData[]>([])
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const processImages = useCallback(async () => {
    setIsProcessing(true)
    setError(null)
    setProgress(0)
    
    try {
      // Load face detection models
      await loadModels()
      setProgress(10)
      
      const results: ProcessedFaceData[] = []
      
      // Process each Shub image
      for (let i = 1; i <= 5; i++) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = `/images/shub${i}.png`
        })
        
        // Detect landmarks on full-size image
        const landmarks = await detectFaceLandmarks(img as HTMLImageElement)
        
        if (landmarks) {
          // Normalize landmarks to 0-1 range using actual image dimensions
          const normalizedLandmarks = normalizeLandmarks(landmarks, img.width, img.height)
          normalizedLandmarks.imageIndex = i - 1
          
          results.push({
            imageIndex: i - 1,
            landmarks: normalizedLandmarks,
            imageUrl: img.src // Use the original image URL
          })
        } else {
          throw new Error(`Could not detect face in Shub ${i}`)
        }
        
        setProgress(10 + (i * 18))
      }
      
      setProcessedData(results)
      setProgress(100)
      
      // Call the completion callback
      onComplete(results)
      
    } catch (err) {
      console.error('Error processing images:', err)
      setError(err instanceof Error ? err.message : 'Failed to process images')
    } finally {
      setIsProcessing(false)
    }
  }, [onComplete])

  // Auto-start face detection if requested
  useEffect(() => {
    if (autoStart && !isProcessing && processedData.length === 0) {
      processImages()
    }
  }, [autoStart, isProcessing, processedData.length, processImages])

  // Visualize landmarks on canvas
  const drawLandmarks = (data: ProcessedFaceData) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const img = new Image()
    img.onload = () => {
      // Set canvas to match image aspect ratio
      const maxWidth = 400
      const scale = maxWidth / img.width
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Draw landmarks
      ctx.fillStyle = '#ff00ff'
      ctx.strokeStyle = '#00ff00'
      
      data.landmarks.positions.forEach((point, index) => {
        const x = point.x * canvas.width
        const y = point.y * canvas.height
        
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fill()
        
        // Draw landmark number
        ctx.fillStyle = '#ffff00'
        ctx.font = '8px Arial'
        ctx.fillText(index.toString(), x + 3, y - 3)
        ctx.fillStyle = '#ff00ff'
      })
    }
    img.src = data.imageUrl
  }

  return (
    <Card className="p-6 bg-gray-50 border-gray-200 mb-8">
      <h2 className="text-2xl font-bold font-shubha text-gray-900 mb-4">Face Detection & Preprocessing</h2>
      
      <div className="space-y-4">
        {!isProcessing && !processedData.length && (
          <div>
            <p className="text-gray-600 mb-4">
              Click the button below to automatically detect faces and extract landmark points from all Shub images.
            </p>
            <Button 
              onClick={processImages}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              Start Face Detection
            </Button>
          </div>
        )}
        
        {isProcessing && (
          <div>
            <p className="text-gray-900 mb-2">Processing faces...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-500 text-sm mt-2">{Math.round(progress)}% complete</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
        
        {processedData.length > 0 && (
          <div>
            <p className="text-gray-900 mb-4">✓ Successfully detected faces in all {processedData.length} images!</p>
            
            <div className="grid grid-cols-5 gap-4 mb-4">
              {processedData.map((data) => (
                <div 
                  key={data.imageIndex}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => drawLandmarks(data)}
                >
                  <Card className="p-2 bg-white border-gray-200">
                    <p className="text-gray-900 text-sm text-center">
                      Shub {data.imageIndex + 1} - {data.landmarks.positions.length} points
                    </p>
                  </Card>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <p className="text-gray-600 text-sm mb-2">Click on any result above to visualize landmarks:</p>
              <canvas 
                ref={canvasRef}
                className="border border-gray-200 rounded bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 