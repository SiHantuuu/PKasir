"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface NotificationDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  status: "success" | "error"
}

export function NotificationDialog({ isOpen, onClose, title, description, status }: NotificationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
            <DialogHeader>
              <motion.div
                className="flex flex-col items-center gap-4 py-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <motion.div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    status === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                  )}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                >
                  {status === "success" ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </motion.div>
                <motion.div
                  className="text-center space-y-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</DialogTitle>
                  <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
                    {description}
                  </DialogDescription>
                </motion.div>
              </motion.div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

