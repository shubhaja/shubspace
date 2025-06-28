'use client'

import { useRef, useEffect, useState, memo } from 'react'
import { useShubspace } from '@/lib/context/ShubspaceContext'
import { FaceLandmarks } from '@/lib/face-detection/faceDetection'
import { createTriangulation } from '@/lib/triangulation/triangulation'
import { morphFaces, warpImageToTarget } from '@/lib/morphing/morphingEngine'
import { motion } from 'framer-motion'

interface UnifiedImageGridProps {
  specialType: 'composite' | 'landmarks' | 'mesh'
}

const UnifiedImageGrid = memo(function UnifiedImageGrid({ specialType }: UnifiedImageGridProps) {
  const { weights, faceLandmarks, isPreprocessed } = useShubspace()
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([null, null, null, null, null, null])
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([])
  const [animationProgress, setAnimationProgress] = useState(0)
  const animationRef = useRef<number | null>(null)
  const warpedCanvasCache = useRef<(HTMLCanvasElement | null)[]>([null, null, null, null, null])

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const imgs: HTMLImageElement[] = []
      for (let i = 1; i <= 5; i++) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve) => {
          img.onload = resolve
          img.src = `/images/shub${i}.png`
        })
        imgs.push(img)
      }
      setLoadedImages(imgs)
    }
    loadImages()
  }, [])

  // Animation loop for mesh warping
  useEffect(() => {
    if (specialType !== 'mesh' || !isPreprocessed) return

    const animate = () => {
      setAnimationProgress(prev => {
        // Use sine wave for smooth in-out animation
        const newProgress = (prev + 0.01) % 1
        return newProgress
      })
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [specialType, isPreprocessed])

  // Clear warped canvas cache when weights or images change
  useEffect(() => {
    warpedCanvasCache.current = [null, null, null, null, null]
  }, [weights, loadedImages])

  // Draw special image in first canvas
  useEffect(() => {
    if (!isPreprocessed || faceLandmarks.length === 0 || loadedImages.length === 0) return
    
    const landmarks = faceLandmarks.map(data => data.landmarks)
    const specialCanvas = canvasRefs.current[0]
    if (!specialCanvas) return
    
    const draw = async () => {
      const ctx = specialCanvas.getContext('2d')!
      
      if (specialType === 'composite') {
        // Draw morphed composite
        const container = specialCanvas.parentElement
        if (!container) return
        
        // Get the morphed result at original size
        const morphedCanvas = await morphFaces(loadedImages, landmarks, weights)
        
        // Calculate scale to fit container
        const containerWidth = container.clientWidth
        const maxHeight = (window.innerHeight - 192) / 2
        
        let scale = containerWidth / morphedCanvas.width
        if (morphedCanvas.height * scale > maxHeight) {
          scale = maxHeight / morphedCanvas.height
        }
        
        // Set canvas size and draw scaled result
        specialCanvas.width = morphedCanvas.width * scale
        specialCanvas.height = morphedCanvas.height * scale
        ctx.drawImage(morphedCanvas, 0, 0, specialCanvas.width, specialCanvas.height)
      } else if (specialType === 'landmarks') {
        // Calculate weighted average landmarks
        const sum = weights.reduce((a, b) => a + b, 0)
        const normalizedWeights = weights.map(w => w / sum)
        
        const avgLandmarks: FaceLandmarks = {
          positions: landmarks[0].positions.map((_, idx) => {
            let x = 0, y = 0
            landmarks.forEach((lm: FaceLandmarks, i: number) => {
              x += lm.positions[idx].x * normalizedWeights[i]
              y += lm.positions[idx].y * normalizedWeights[i]
            })
            return { x, y }
          }),
          imageIndex: -1
        }
        
        // Show pink average landmark dots on black background
        // Set canvas to match first image aspect ratio
        const img = loadedImages[0]
        const container = specialCanvas.parentElement
        if (!container) return
        
        const containerWidth = container.clientWidth
        const maxHeight = (window.innerHeight - 192) / 2
        
        let scale = containerWidth / img.width
        if (img.height * scale > maxHeight) {
          scale = maxHeight / img.height
        }
        
        specialCanvas.width = img.width * scale
        specialCanvas.height = img.height * scale
        
        // Fill with black background
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, specialCanvas.width, specialCanvas.height)
        
        // Draw small pink average landmark dots
        ctx.fillStyle = '#ff1493'
        avgLandmarks.positions.forEach(point => {
          ctx.beginPath()
          ctx.arc(point.x * specialCanvas.width, point.y * specialCanvas.height, 4, 0, 2 * Math.PI)
          ctx.fill()
        })
      } else if (specialType === 'mesh') {
        // Calculate weighted landmarks for mesh visualization
        const sum = weights.reduce((a, b) => a + b, 0)
        const normalizedWeights = weights.map(w => w / sum)
        
        const avgLandmarks: FaceLandmarks = {
          positions: landmarks[0].positions.map((_, idx) => {
            let x = 0, y = 0
            landmarks.forEach((lm: FaceLandmarks, i: number) => {
              x += lm.positions[idx].x * normalizedWeights[i]
              y += lm.positions[idx].y * normalizedWeights[i]
            })
            return { x, y }
          }),
          imageIndex: -1
        }
        
        // Set canvas size to match first image
        const img = loadedImages[0]
        const container = specialCanvas.parentElement
        if (!container) return
        
        const containerWidth = container.clientWidth
        const maxHeight = (window.innerHeight - 192) / 2
        
        let scale = containerWidth / img.width
        if (img.height * scale > maxHeight) {
          scale = maxHeight / img.height
        }
        
        specialCanvas.width = img.width * scale
        specialCanvas.height = img.height * scale
        
        // Fill with black background
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, specialCanvas.width, specialCanvas.height)
        
        // Add boundary points for triangulation
        const boundaryPoints = [
          { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
          { x: 0.5, y: 0 }, { x: 0.5, y: 1 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }
        ]
        const allPoints = [...avgLandmarks.positions, ...boundaryPoints]
        const triangles = createTriangulation(allPoints)
        
        // Draw triangulation mesh in green
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 1
        
        triangles.forEach(triangle => {
          const p1 = allPoints[triangle.p1]
          const p2 = allPoints[triangle.p2]
          const p3 = allPoints[triangle.p3]
          
          ctx.beginPath()
          ctx.moveTo(p1.x * specialCanvas.width, p1.y * specialCanvas.height)
          ctx.lineTo(p2.x * specialCanvas.width, p2.y * specialCanvas.height)
          ctx.lineTo(p3.x * specialCanvas.width, p3.y * specialCanvas.height)
          ctx.closePath()
          ctx.stroke()
        })
        
        // Draw large pink average mesh points on top
        ctx.fillStyle = '#ff1493'
        avgLandmarks.positions.forEach(point => {
          ctx.beginPath()
          ctx.arc(point.x * specialCanvas.width, point.y * specialCanvas.height, 4, 0, 2 * Math.PI)
          ctx.fill()
        })
        
        // Add text to indicate this is the target shape
        ctx.fillStyle = '#10b981'
        ctx.font = `${12 * scale}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText('Target Mesh', specialCanvas.width / 2, specialCanvas.height - 10 * scale)
      }
    }
    
    draw()
  }, [isPreprocessed, faceLandmarks, weights, loadedImages, specialType])

  // Draw images with appropriate overlays
  useEffect(() => {
    if (!isPreprocessed || faceLandmarks.length === 0 || loadedImages.length === 0) return
    
    const landmarks = faceLandmarks.map(data => data.landmarks)
    
    const drawImages = async () => {
      if (specialType === 'landmarks') {
        // Draw each Shub image with large green landmark dots
        for (let i = 0; i < 5; i++) {
          const canvas = canvasRefs.current[i + 1]
          if (!canvas) continue
          
          const ctx = canvas.getContext('2d')!
          const img = loadedImages[i]
          const container = canvas.parentElement
          if (!container) continue
          
          // Scale canvas to fit container while maintaining aspect ratio
          const containerWidth = container.clientWidth
          const maxHeight = (window.innerHeight - 192) / 2
          
          let scale = containerWidth / img.width
          if (img.height * scale > maxHeight) {
            scale = maxHeight / img.height
          }
          
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          
          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          // Draw large green landmark dots
          ctx.fillStyle = '#00ff00'
          landmarks[i].positions.forEach(point => {
            ctx.beginPath()
            ctx.arc(point.x * canvas.width, point.y * canvas.height, 12 * scale, 0, 2 * Math.PI)
            ctx.fill()
          })
        }
      } else if (specialType === 'mesh') {
        // Draw animated transition between unwarped and warped images
        const sum = weights.reduce((a, b) => a + b, 0)
        const normalizedWeights = weights.map(w => w / sum)
        
        // Calculate average landmarks
        const avgLandmarks: FaceLandmarks = {
          positions: landmarks[0].positions.map((_, idx) => {
            let x = 0, y = 0
            landmarks.forEach((lm: FaceLandmarks, i: number) => {
              x += lm.positions[idx].x * normalizedWeights[i]
              y += lm.positions[idx].y * normalizedWeights[i]
            })
            return { x, y }
          }),
          imageIndex: -1
        }
        
        // Get target landmarks with boundary points
        const boundaryPoints = [
          { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
          { x: 0.5, y: 0 }, { x: 0.5, y: 1 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }
        ]
        const allTargetPoints = [...avgLandmarks.positions, ...boundaryPoints]
        
        // Create triangulation
        const triangles = createTriangulation(allTargetPoints)
        
        // Calculate blend factor using sine wave for smooth in-out
        const blendFactor = (Math.sin(animationProgress * Math.PI * 2) + 1) / 2
        
        // Draw each image with animated warping
        for (let i = 0; i < 5; i++) {
          const canvas = canvasRefs.current[i + 1]
          if (!canvas) continue
          
          const container = canvas.parentElement
          if (!container) continue
          
          const img = loadedImages[i]
          const containerWidth = container.clientWidth
          const maxHeight = (window.innerHeight - 192) / 2
          
          let scale = containerWidth / img.width
          if (img.height * scale > maxHeight) {
            scale = maxHeight / img.height
          }
          
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d', { willReadFrequently: true })!
          
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          
          // Always draw original image at full opacity first
          ctx.globalAlpha = 1
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          // Only compute and draw warped image if we need it
          if (blendFactor > 0.01) {
            let warpedCanvas = warpedCanvasCache.current[i]
            
            // Generate warped canvas if not cached
            if (!warpedCanvas) {
              const sourcePoints = [...landmarks[i].positions, ...boundaryPoints]
              
              // Use warpImageToTarget to create warped version
              warpedCanvas = await warpImageToTarget(
                loadedImages[i],
                sourcePoints,
                allTargetPoints,
                triangles,
                canvas.width,
                canvas.height
              )
              
              // Cache the result
              warpedCanvasCache.current[i] = warpedCanvas
            }
            
            // Draw warped image on top with blend factor opacity
            ctx.globalAlpha = blendFactor
            ctx.drawImage(warpedCanvas, 0, 0)
            
            // Reset alpha
            ctx.globalAlpha = 1
          }
        }
      } else {
        // For composite type, just show the original images
        for (let i = 0; i < 5; i++) {
          const canvas = canvasRefs.current[i + 1]
          if (!canvas) continue
          
          const ctx = canvas.getContext('2d')!
          const img = loadedImages[i]
          const container = canvas.parentElement
          if (!container) continue
          
          // Scale canvas to fit container while maintaining aspect ratio
          const containerWidth = container.clientWidth
          const maxHeight = (window.innerHeight - 192) / 2
          
          let scale = containerWidth / img.width
          if (img.height * scale > maxHeight) {
            scale = maxHeight / img.height
          }
          
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
      }
    }
    
    drawImages()
  }, [isPreprocessed, faceLandmarks, loadedImages, specialType, weights, animationProgress])

  // Define colors matching the control panel
  const rainbowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'] // red, orange, yellow, green, blue

  // Define wiggle animation variant
  const wiggleAnimation = {
    rest: { rotate: 0 },
    hover: {
      rotate: [0, -5, 5, -5, 5, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut" as const,
      }
    }
  }

  // Define stagger container for grid animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10
      }
    }
  }

  return (
    <motion.div 
      className="flex items-center justify-center w-full h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-3 gap-2 md:gap-3 auto-rows-auto p-2" style={{ maxHeight: 'calc(100vh - 12rem)', width: 'auto' }}>
        {/* Special image (composite/landmarks/mesh) in top-left */}
        <motion.div 
          className="relative p-1"
          variants={itemVariants}
          whileHover="hover"
          initial="rest"
          animate="rest"
        >
          <motion.div variants={wiggleAnimation}>
            <canvas 
              ref={el => { canvasRefs.current[0] = el }}
              className="w-full h-auto block rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            />
          </motion.div>
        </motion.div>
        
        {/* Shub images with numbers */}
        {[1, 2, 3, 4, 5].map((num, idx) => (
          <motion.div 
            key={num} 
            className="relative p-1"
            variants={itemVariants}
            whileHover="hover"
            initial="rest"
            animate="rest"
          >
            <motion.div variants={wiggleAnimation}>
              <canvas 
                ref={el => { canvasRefs.current[idx + 1] = el }}
                className="w-full h-auto block rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              />
              {/* Circle with number - use rainbow colors for composite, red for others */}
              <motion.div 
                className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg pointer-events-none"
                style={{ 
                  backgroundColor: specialType === 'composite' ? rainbowColors[idx] : '#ef4444',
                  zIndex: 50 
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.3 + idx * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }}
              >
                {num}
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
})

export default UnifiedImageGrid 