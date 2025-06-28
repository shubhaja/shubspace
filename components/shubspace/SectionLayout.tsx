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
              {children}
            </div>
          </motion.div>
          
          {/* Right side - Description (1/3 width) */}
          <motion.div 
            className="flex items-center lg:col-span-4"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="w-full pr-6 lg:pr-12">
              <motion.h2 
                className="text-3xl lg:text-4xl font-bold font-shubha text-gray-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {title}
              </motion.h2>
              <motion.div 
                className="text-base lg:text-lg text-gray-600 space-y-4"
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