'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ScrollNavigationProps {
  currentSection: number
  totalSections: number
}

export default function ScrollNavigation({ currentSection, totalSections }: ScrollNavigationProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Show navigation after a brief delay
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])
  
  const scrollToSection = (direction: 'up' | 'down') => {
    const sections = document.querySelectorAll('.section-container')
    const targetIndex = direction === 'up' ? currentSection - 1 : currentSection + 1
    
    if (targetIndex >= 0 && targetIndex < sections.length) {
      sections[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  const showUpArrow = currentSection > 0
  const showDownArrow = currentSection < totalSections - 1
  
  if (!isVisible) return null
  
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 hidden lg:flex">
      {/* Up Arrow */}
      <motion.button
        className={`group relative p-3 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
          showUpArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => scrollToSection('up')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: showUpArrow ? 1 : 0, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg
          className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Previous Section
        </span>
      </motion.button>
      
      {/* Section Indicator Dots */}
      <div className="flex flex-col gap-2 py-2">
        {Array.from({ length: totalSections }).map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSection
                ? 'bg-gray-900 w-2 h-6'
                : 'bg-gray-400 hover:bg-gray-600 cursor-pointer'
            }`}
            onClick={() => {
              const sections = document.querySelectorAll('.section-container')
              sections[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            whileHover={{ scale: index === currentSection ? 1 : 1.5 }}
          />
        ))}
      </div>
      
      {/* Down Arrow */}
      <motion.button
        className={`group relative p-3 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300 ${
          showDownArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => scrollToSection('down')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: showDownArrow ? 1 : 0, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg
          className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Next Section
        </span>
      </motion.button>
    </div>
  )
} 