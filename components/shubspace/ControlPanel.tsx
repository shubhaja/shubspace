'use client'

import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useShubspace } from "@/lib/context/ShubspaceContext"
import { motion, AnimatePresence } from "framer-motion"

const ControlPanel = () => {
  const { weights, rawWeights, setWeights, updateRawWeight } = useShubspace()
  
  const handleWeightChange = (index: number, value: number[]) => {
    updateRawWeight(index, value[0])
  }
  
  const setEqualWeights = () => {
    setWeights([20, 20, 20, 20, 20])
  }
  
  const setRandomWeights = () => {
    const random = Array(5).fill(0).map(() => Math.random())
    const sum = random.reduce((a, b) => a + b, 0)
    const normalized = random.map(w => Math.round((w / sum) * 100))
    setWeights(normalized)
  }

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'] // red, orange, yellow, green, blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-white/95 border-gray-200 backdrop-blur-sm">
        <motion.h2 
          className="text-2xl font-bold text-gray-900 mb-6" 
          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', textTransform: 'none' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Control Panel
        </motion.h2>
        
        <div className="space-y-6 mb-8">
          {rawWeights.map((rawWeight, index) => (
            <motion.div 
              key={`slider-${index}`} 
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <div className="flex justify-between items-center">
                <label className="text-gray-900 font-medium flex items-center gap-2">
                  <motion.span 
                    style={{ fontFamily: 'Shubha-Writing, serif', fontSize: '1.25rem', lineHeight: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    shub
                  </motion.span>
                  <motion.span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ backgroundColor: colors[index] }}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {index + 1}
                  </motion.span>
                </label>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={weights[index]}
                    className="text-gray-700 font-mono text-lg font-semibold bg-gray-100 px-3 py-1 rounded"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {weights[index]}%
                  </motion.span>
                </AnimatePresence>
              </div>
              <div 
                className="slider-wrapper" 
                style={{ '--color': colors[index] } as React.CSSProperties}
              >
                <Slider
                  value={[rawWeight]}
                  onValueChange={(value) => handleWeightChange(index, value)}
                  max={100}
                  step={1}
                  className="w-full cursor-grab active:cursor-grabbing"
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Button 
              onClick={setEqualWeights}
              variant="outline" 
              className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Equal Mix
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Button 
              onClick={setRandomWeights}
              variant="outline" 
              className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Random Mix
            </Button>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  )
}

export default ControlPanel 