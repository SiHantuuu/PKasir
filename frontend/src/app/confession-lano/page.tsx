"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Music, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConfessionPage() {
  const [showContent, setShowContent] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const router = useRouter()

  const confessionTexts = [
    "Salsa, your smile lights up my world like nothing else.",
    "Your kindness and compassion inspire me every day.",
    "I love the way your eyes sparkle when you laugh.",
    "Your strength and determination are truly admirable.",
    "Being with you makes every moment special and meaningful.",
  ]

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % confessionTexts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // New effect to handle automatic redirection after viewing all slides
  useEffect(() => {
    // Start countdown after all slides have been shown (after 5 slides × 5 seconds)
    if (showContent) {
      const redirectTimer = setTimeout(
        () => {
          // Start a 10-second countdown before redirecting
          setCountdown(10)
        },
        confessionTexts.length * 5000 + 2000,
      ) // Add 2 seconds buffer

      return () => clearTimeout(redirectTimer)
    }
  }, [showContent])

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Redirect to dashboard when countdown reaches 0
      router.push("/")
    }
  }, [countdown, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 flex flex-col items-center justify-center p-4">
      <motion.div
        className="absolute top-4 left-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          className="bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors duration-300"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </motion.div>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-pink-600 mb-8"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              For My Dearest Salsa
            </motion.h1>
            <motion.div
              className="bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-6 mb-8 max-w-2xl mx-auto"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl md:text-2xl text-gray-800 italic"
                >
                  "{confessionTexts[currentSlide]}"
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.div className="flex justify-center space-x-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 20 }}
                whileTap={{ scale: 0.8, rotate: -20 }}
                className="text-red-500"
              >
                <Heart size={40} />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2, rotate: 20 }}
                whileTap={{ scale: 0.8, rotate: -20 }}
                className="text-yellow-500"
              >
                <Star size={40} />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.2, rotate: 20 }}
                whileTap={{ scale: 0.8, rotate: -20 }}
                className="text-blue-500"
              >
                <Music size={40} />
              </motion.div>
            </motion.div>

            <motion.p
              className="text-lg md:text-xl text-purple-700 font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              Salsa, you mean the world to me. Will you be mine forever?
            </motion.p>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
            >
              <p className="text-sm text-gray-600">With all my love,</p>
              <p className="text-xl font-bold text-pink-600">Lano</p>
            </motion.div>

            {/* Countdown display */}
            {countdown !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg inline-block"
              >
                <p className="text-gray-600">Redirecting to dashboard in {countdown} seconds...</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

