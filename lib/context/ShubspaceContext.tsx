'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react'
import { FaceLandmarks } from '@/lib/face-detection/faceDetection'

interface ProcessedFaceData {
  imageIndex: number
  landmarks: FaceLandmarks
  imageUrl: string
}

interface ShubspaceContextType {
  weights: number[]
  rawWeights: number[]
  setWeights: (weights: number[]) => void
  updateWeight: (index: number, value: number) => void
  updateRawWeight: (index: number, value: number) => void
  faceLandmarks: ProcessedFaceData[]
  setFaceLandmarks: (landmarks: ProcessedFaceData[]) => void
  isPreprocessed: boolean
  isNormalizing: boolean
}

const ShubspaceContext = createContext<ShubspaceContextType | undefined>(undefined)

export const useShubspace = () => {
  const context = useContext(ShubspaceContext)
  if (!context) {
    throw new Error('useShubspace must be used within a ShubspaceProvider')
  }
  return context
}

interface ShubspaceProviderProps {
  children: ReactNode
}

export const ShubspaceProvider = ({ children }: ShubspaceProviderProps) => {
  const [weights, setWeights] = useState([20, 20, 20, 20, 20])
  const [rawWeights, setRawWeights] = useState([20, 20, 20, 20, 20])
  const [faceLandmarks, setFaceLandmarks] = useState<ProcessedFaceData[]>([])
  const [isPreprocessed, setIsPreprocessed] = useState(false)
  const [isNormalizing, setIsNormalizing] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  
  // Update raw weight immediately (for slider display)
  const updateRawWeight = useCallback((index: number, value: number) => {
    const newRawWeights = [...rawWeights]
    newRawWeights[index] = value
    setRawWeights(newRawWeights)
    setIsNormalizing(true)
    
    // Debounce the normalization and actual weight update
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    debounceTimer.current = setTimeout(() => {
      // Use requestAnimationFrame for smoother UI updates
      requestAnimationFrame(() => {
        // Normalize weights to sum to 100
        const sum = newRawWeights.reduce((a, b) => a + b, 0)
        if (sum > 0) {
          const normalizedWeights = newRawWeights.map(w => Math.round((w / sum) * 100))
          setWeights(normalizedWeights)
          setRawWeights(normalizedWeights)
        }
        setIsNormalizing(false)
      })
    }, 50) // Reduced to 50ms for faster response
  }, [rawWeights])
  
  // Legacy updateWeight for Equal/Random buttons
  const updateWeight = useCallback((index: number, value: number) => {
    const newWeights = [...weights]
    newWeights[index] = value
    
    // Normalize weights to sum to 100
    const sum = newWeights.reduce((a, b) => a + b, 0)
    if (sum > 0) {
      const normalizedWeights = newWeights.map(w => Math.round((w / sum) * 100))
      setWeights(normalizedWeights)
      setRawWeights(normalizedWeights)
    }
  }, [weights])
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])
  
  const handleSetFaceLandmarks = (landmarks: ProcessedFaceData[]) => {
    setFaceLandmarks(landmarks)
    setIsPreprocessed(landmarks.length > 0)
  }
  
  const handleSetWeights = (newWeights: number[]) => {
    setIsNormalizing(true)
    setWeights(newWeights)
    setRawWeights(newWeights)
    
    // Show the normalizing indicator briefly
    setTimeout(() => {
      requestAnimationFrame(() => {
        setIsNormalizing(false)
      })
    }, 300)
  }
  
  return (
    <ShubspaceContext.Provider value={{ 
      weights, 
      rawWeights,
      setWeights: handleSetWeights, 
      updateWeight,
      updateRawWeight,
      faceLandmarks,
      setFaceLandmarks: handleSetFaceLandmarks,
      isPreprocessed,
      isNormalizing
    }}>
      {children}
    </ShubspaceContext.Provider>
  )
} 