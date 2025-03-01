"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, User, Lock, AlertCircle } from "lucide-react"
import { NotificationDialog } from "@/components/notification-dialog"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    description: string
    status: "success" | "error"
  }>({
    isOpen: false,
    title: "",
    description: "",
    status: "success",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Here you would typically validate the credentials against a backend
    // For this example, we'll use a simple check
    if (username === "admin" && password === "password") {
      setNotification({
        isOpen: true,
        title: "Login Successful",
        description: "You will be redirected to the dashboard shortly.",
        status: "success",
      })
      login(username)
      setTimeout(() => {
        router.push("/")
      }, 1000) // Redirect after 2 seconds
    } else {
      setError("Invalid username or password")
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  }

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Card className="w-full max-w-md backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              hai admin hehe boi\(^_^)/
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                className="space-y-2"
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="username" className="sr-only">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </motion.div>
              <motion.div
                className="space-y-2"
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </motion.div>
              {error && (
                <motion.div
                  className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md flex items-center space-x-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Button type="submit" className="w-full">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
        <NotificationDialog
          isOpen={notification.isOpen}
          onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
          title={notification.title}
          description={notification.description}
          status={notification.status}
        />
      </motion.div>
    </div>
  )
}

