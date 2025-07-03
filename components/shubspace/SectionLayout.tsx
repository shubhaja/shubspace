'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionLayoutProps {
  title: string
  description: ReactNode
  children: ReactNode
  background?: 'white' | 'gray'
}

export default function SectionLayout({ title, description, children, background = 'white' }: SectionLayoutProps) {
  const bgClass = background === 'gray' ? 'bg-gray-50' : 'bg-white'
  
  return (
    <motion.div 
      className={`section-container ${bgClass}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center w-full">
          {/* Left side - Images (2/3 width) */}
          <motion.div 
            className="flex items-center justify-center lg:col-span-8 h-full order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-full flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
              {children}
            </div>
          </motion.div>
          
          {/* Right side - Description (1/3 width) */}
          <motion.div 
            className="flex items-center lg:col-span-4 order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="w-full">
              <motion.h2 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold font-shubha text-gray-900 mb-4 lg:mb-6 text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {title}
              </motion.h2>
              <motion.div 
                className="text-sm sm:text-base lg:text-lg text-gray-600 space-y-3 lg:space-y-4 text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {description}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 