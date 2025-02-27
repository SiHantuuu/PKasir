"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ConfessionPage() {
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [typedTexts, setTypedTexts] = useState<string[]>([])
  const [showButton, setShowButton] = useState(false)

  const confessionTexts = [
    "Dear Salsa,",
    "Aku sudah lama menyimpan perasaan ini...",
    "Setiap kali melihatmu tersenyum, hatiku berdebar tidak karuan.",
    "Aku menyukaimu, Salsa.",
    "Maukah kamu menjadi pacarku?",
    "- Lano",
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showContent || currentTextIndex >= confessionTexts.length) return

    const currentText = confessionTexts[currentTextIndex]
    let currentChar = 0
    let typingInterval: NodeJS.Timeout

    const startTyping = () => {
      typingInterval = setInterval(() => {
        if (currentChar < currentText.length) {
          setTypedTexts((prev) => {
            const newTexts = [...prev]
            newTexts[currentTextIndex] = (newTexts[currentTextIndex] || "") + currentText.charAt(currentChar)
            return newTexts
          })
          currentChar++
        } else {
          clearInterval(typingInterval)

          setTimeout(() => {
            setCurrentTextIndex((prev) => prev + 1)
          }, 500)
        }
      }, 50)
    }

    startTyping()

    return () => clearInterval(typingInterval)
  }, [showContent, currentTextIndex])

  useEffect(() => {
    if (currentTextIndex >= confessionTexts.length) {
      const timer = setTimeout(() => {
        setShowButton(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [currentTextIndex])

  const handleContinue = () => {
    router.push("/dashboard")
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gradient-to-b from-pink-50 to-red-100 dark:from-pink-950 dark:to-red-900">
        <AppSidebar />
        <SidebarInset className="flex-grow overflow-auto">
          <div className="flex items-center justify-center min-h-full p-6">
            <Dialog open={showContent} onOpenChange={setShowContent}>
              <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-0 shadow-xl">
                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="w-full rounded-3xl p-8 relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute -top-20 -right-20 w-80 h-80 opacity-10"
                        animate={{
                          rotate: 360,
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                          scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
                        }}
                      >
                        <Heart className="w-full h-full text-red-500" />
                      </motion.div>

                      <div className="text-center mb-8">
                        <motion.h1
                          className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"
                          initial={{ y: -50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          Hi Salsa
                        </motion.h1>
                      </div>

                      <div className="min-h-[300px] flex flex-col items-center justify-start">
                        {typedTexts.map((text, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.3 }}
                            className="text-xl text-center font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-4"
                          >
                            {text}
                          </motion.div>
                        ))}
                        {currentTextIndex < confessionTexts.length && (
                          <motion.span
                            animate={{ opacity: [0, 1] }}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.7 }}
                            className="text-xl"
                          >
                            |
                          </motion.span>
                        )}
                      </div>

                      {showButton && (
                        <motion.div
                          className="mt-8 flex justify-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Button
                            onClick={handleContinue}
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl text-lg font-medium"
                          >
                            <span>Continue to Dashboard</span>
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </DialogContent>
            </Dialog>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

