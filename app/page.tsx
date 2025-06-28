'use client'

import { ShubspaceProvider, useShubspace } from '@/lib/context/ShubspaceContext'
import ControlPanel from '@/components/shubspace/ControlPanel'
import FacePreprocessor from '@/components/shubspace/FacePreprocessor'
import UnifiedImageGrid from '@/components/shubspace/UnifiedImageGrid'
import SectionLayout from '@/components/shubspace/SectionLayout'
import Image from 'next/image'
import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ShubspaceContent() {
  const { setFaceLandmarks, isPreprocessed } = useShubspace()
  const textContentRef = useRef<HTMLDivElement>(null)
  const [imageHeight, setImageHeight] = useState<number | undefined>()

  useEffect(() => {
    const updateImageHeight = () => {
      if (textContentRef.current) {
        setImageHeight(textContentRef.current.offsetHeight)
      }
    }

    updateImageHeight()
    window.addEventListener('resize', updateImageHeight)
    return () => window.removeEventListener('resize', updateImageHeight)
  }, [isPreprocessed])

  // Floating animation for the loading screen
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden scroll-snap-container">
      {/* Face preprocessor (hidden, auto-starts) */}
      <div style={{ display: 'none' }}>
        <FacePreprocessor onComplete={setFaceLandmarks} autoStart />
      </div>
      
      <AnimatePresence mode="wait">
        {!isPreprocessed && (
          <motion.div 
            className="h-screen flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-center"
              animate={floatingAnimation}
            >
              <motion.h1 
                className="text-5xl font-bold font-shubha text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                S(h)ubspace
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Loading face detection models...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isPreprocessed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="section-container bg-gray-50">
            <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 h-full flex items-center py-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start w-full">
                {/* Left side - Image (50% width) */}
                <motion.div 
                  className="flex items-start justify-end"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="w-full max-w-[600px] relative">
                    <motion.div 
                      className="relative w-full overflow-hidden rounded-lg shadow-lg"
                      style={{ height: imageHeight ? `${imageHeight}px` : 'auto' }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Image 
                        src="/images/intro.JPG" 
                        alt="Shub party attendees" 
                        width={1206}
                        height={2144}
                        className="w-full h-full object-cover object-top"
                        priority
                      />
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Right side - Title and Description (50% width) */}
                <motion.div 
                  className="flex items-start justify-start"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="w-full max-w-[600px]" ref={textContentRef}>
                    <motion.h1 
                      className="text-5xl md:text-6xl font-bold font-shubha text-gray-900 mb-8"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      s(h)ubspace
                    </motion.h1>
                    <motion.div 
                      className="text-base lg:text-lg text-gray-600 space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    >
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        One of the most fortunate—and bizarre—experiences I&apos;ve had in San Francisco was attending a party where every attendee shared my name. Well, more or less.
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                      >
                        &ldquo;Shub,&rdquo; meaning auspicious in several Indian languages, has sprouted a variety of permutations depending on region, gender, and family tradition: Shubham, Shubhankar, Shubhan, Shubha, and more.
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                      >
                        Fortunately, I remembered that the human face occupies a linear subspace—a principle from computer vision suggesting that any collection of faces can be mathematically averaged into a single composite.
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                      >
                        So I set out to create the Shubiest Shub of San Francisco. Or at least, of those Shubs willing to answer a random LinkedIn invitation and show up to a party.
                      </motion.p>
                    </motion.div>
                    <motion.div 
                      className="mt-12 text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1.0 }}
                    >
                      <p className="text-sm">Scroll down to explore the algorithm</p>
                      <motion.div 
                        className="mt-2"
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ↓
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Detected Landmarks Section */}
          <SectionLayout
            title="Detected Landmarks"
            background="white"
            description={
              <>
                <p>
                  Using face detection AI, we identify 68 key facial landmarks on each face. 
                  These points map important features like eyes, nose, mouth, and jawline.
                </p>
                <p>
                  The pink dots in the top-left show the <strong>weighted average</strong> of all landmark 
                  positions based on your slider settings. As you adjust the blend, these average 
                  points shift to represent the combined facial structure.
                </p>
                <p>
                  The green dots on each face show the detected landmarks that will be used 
                  for morphing. These form the foundation for our face blending algorithm.
                </p>
              </>
            }
          >
            <UnifiedImageGrid specialType="landmarks" />
          </SectionLayout>

          {/* Warped Images Section */}
          <SectionLayout
            title="Warped Images & Average Mesh"
            background="gray"
            description={
              <>
                <p>
                  The triangulation mesh (green lines) shows how we divide the face into 
                  triangular regions for morphing. This technique, called Delaunay triangulation, 
                  creates optimal triangles for smooth transformations.
                </p>
                <p>
                  Each face is then <strong>warped</strong> to match the average landmark positions. 
                  We use affine transformations on each triangle to smoothly deform the facial 
                  features while preserving local detail.
                </p>
                <p>
                  The pink dots represent the target positions where all faces are being 
                  morphed to - these change dynamically as you adjust the blend weights.
                </p>
              </>
            }
          >
            <UnifiedImageGrid specialType="mesh" />
          </SectionLayout>

          {/* Interactive Composite Section */}
          <motion.div 
            className="section-container bg-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 h-full flex items-center py-12 lg:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
                {/* Left side - Images (2/3 width) */}
                <motion.div 
                  className="flex items-center justify-center lg:col-span-8 h-full"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="w-full flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
                    <UnifiedImageGrid specialType="composite" />
                  </div>
                </motion.div>
                
                {/* Right side - Control Panel (1/3 width) */}
                <motion.div 
                  className="lg:col-span-4 flex items-center"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="w-full pr-6 lg:pr-12">
                    <motion.h2 
                      className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      Interactive Composite
                    </motion.h2>
                    <motion.div 
                      className="text-base lg:text-lg text-gray-600 space-y-4 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <p>
                        The final step blends all warped faces together using your specified weights. 
                        Each pixel is a weighted average of the corresponding pixels from all faces.
                      </p>
                      <p>
                        Adjust the sliders below to control how much each face contributes to 
                        the final composite. The weights automatically normalize to 100%.
                      </p>
                    </motion.div>
                    <ControlPanel />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <ShubspaceProvider>
      <ShubspaceContent />
    </ShubspaceProvider>
  )
}
