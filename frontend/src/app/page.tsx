"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import { Dot, CreditCard, User, ShoppingCart, X, Check, Plus, Minus, KeyRound, Scan, Banknote } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator as SeparatorUI } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/authService"
import { productService } from "@/services/productService"
import { historyService } from "@/services/historyService"

type Product = {
  id: string | number
  name: string
  price: number
}

type ScannedProduct = {
  id: string | number
  name: string
  price: number
  quantity: number
}

type StudentCard = {
  id: string
  name: string
  balance: number
  pin: string
}

const ProgressBar = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left" style={{ scaleX }} />
}

interface NotificationDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  status: "success" | "error"
}

function NotificationDialog({ isOpen, onClose, title, description, status }: NotificationDialogProps) {
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

const AnimatedButton = motion(Button)

function LiveCameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true)

      setTimeout(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas?.getContext("2d")
        if (!context) {
          console.error("Failed to get canvas context")
          setIsCapturing(false)
          return
        }

        if (video && canvas && context) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageDataUrl = canvas.toDataURL("image/png")
          setCapturedImage(imageDataUrl)
          setIsCapturing(false)
          stopCamera()
        } else {
          console.error("Video or canvas element not available")
          setIsCapturing(false)
        }
      }, 500)
    }
  }, [stopCamera])

  useEffect(() => {
    startCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [startCamera])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {capturedImage ? (
          <img src={capturedImage || "/placeholder.svg"} alt="Captured photo" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />

        <AnimatePresence>
          {isCapturing && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {!capturedImage && (
          <motion.div
            key="capture-button"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedButton
              onClick={capturePhoto}
              className="w-full h-12 bg-primary text-primary-foreground font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <Scan className="w-5 h-5 mr-2" />
                </motion.div>
              ) : (
                <>
                  <Scan className="w-5 h-5 mr-2" />
                  Take Photo
                </>
              )}
            </AnimatedButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DashboardPage() {
  const [tempCard, setTempCard] = useState<StudentCard | null>(null)
  const [scannedCard, setScannedCard] = useState<StudentCard | null>(null)
  const [pin, setPin] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
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

  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([])
  const [formData, setFormData] = useState({ rfid: "", name: "" })
  const [cardId, setCardId] = useState("")
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardSuccess, setCardSuccess] = useState<string | null>(null)

  const cardInputRef = useRef<HTMLInputElement>(null)
  const pinInputRef = useRef<HTMLInputElement>(null)

  // Focus the card input field when the component mounts
  useEffect(() => {
    if (!tempCard && cardInputRef.current) {
      cardInputRef.current.focus()
    }
  }, [tempCard])

  // Focus the PIN input field when we're in PIN entry state
  useEffect(() => {
    if (tempCard && !scannedCard && pinInputRef.current) {
      pinInputRef.current.focus()
    }
  }, [tempCard, scannedCard])

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await productService.getAllProducts()

        // Transform API response to match expected Product type
        const normalizedProducts = productsData.map((product: any) => ({
          id: product.id.toString(),
          name: product.ProductName, // Map from ProductName to name
          price: Number(product.Price), // Map from Price to price and ensure it's a number
        }))

        console.log("Normalized products:", normalizedProducts)
        setProducts(normalizedProducts)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      }
    }

    fetchProducts()
  }, [])

  // In handlePinSubmit function
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError(false)

    if (!tempCard || !tempCard.id || pin.length !== 4) {
      setPinError(true)
      setNotification({
        isOpen: true,
        title: "Validation Error",
        description:
          !tempCard || !tempCard.id
            ? "Card information is missing. Please scan your card again."
            : "PIN must be 4 digits.",
        status: "error",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Log the exact payload we're sending
      const loginPayload = {
        NFCId: tempCard.id,
        Pin: pin,
      }
      console.log("Sending login request with payload:", loginPayload)

      // Authenticate with the backend
      const response = await authService.loginSiswa(loginPayload)

      if (response.token) {
        // Get updated user data
        const userData = await authService.getUserByNFC(tempCard.id)
        setScannedCard({
          id: userData.NFCId,
          name: userData.Nama,
          balance: userData.Saldo,
          pin: pin,
        })
        setFormData({ rfid: userData.NFCId, name: userData.Nama })
        setPinError(false)
        setPin("")

        // Show success notification
        setNotification({
          isOpen: true,
          title: "Login Successful",
          description: `Welcome back, ${userData.Nama}!`,
          status: "success",
        })
      }
    } catch (error) {
      console.error("Login failed:", error)

      // Display the specific error message from the backend
      const errorMessage = error instanceof Error ? error.message : "Invalid PIN or NFC ID"

      setPinError(true)
      setPin("")
      setNotification({
        isOpen: true,
        title: "Login Failed",
        description: errorMessage,
        status: "error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCardError(null)
    setCardSuccess(null)

    if (!cardId || cardId.length !== 10) {
      setCardError("Please enter a valid 10-digit card ID")
      return
    }

    setIsProcessing(true)

    try {
      console.log("Attempting to verify card with ID:", cardId)

      // Get user data by NFC ID
      const userData = await authService.getUserByNFC(cardId)
      console.log("User data retrieved:", userData)

      if (!userData || !userData.NFCId) {
        throw new Error("Invalid card data received from server")
      }

      setTempCard({
        id: userData.NFCId, // Make sure this is exactly what the API expects
        name: userData.Nama,
        balance: userData.Saldo,
        pin: "", // We don't know the PIN yet
      })

      console.log("tempCard set to:", {
        id: userData.NFCId,
        name: userData.Nama,
        balance: userData.Saldo,
        pin: "[empty]",
      })

      setCardSuccess("Card validated successfully!")

      setNotification({
        isOpen: true,
        title: "Card Detected",
        description: `Hello ${userData.Nama}, please enter your PIN`,
        status: "success",
      })
    } catch (error) {
      console.error("Error scanning card:", error)
      setCardError(error instanceof Error ? error.message : "Invalid card ID. Please try again.")
      setNotification({
        isOpen: true,
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to scan card",
        status: "error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)

  const simulateProductScan = () => {
    setIsProductDialogOpen(true)
  }

  const handleSelectProduct = (product: Product) => {
    console.log("Selected product:", product)
    setScannedProducts((prevProducts) => {
      const existingProduct = prevProducts.find((p) => p.id === product.id)
      if (existingProduct) {
        return prevProducts.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p))
      } else {
        return [
          ...prevProducts,
          {
            ...product,
            quantity: 1,
          },
        ]
      }
    })
    setIsProductDialogOpen(false)
  }

  const totalPrice = scannedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)

  const handlePay = async () => {
    if (!scannedCard) return

    if (scannedCard.balance < totalPrice) {
      setNotification({
        isOpen: true,
        title: "Payment Failed",
        description: `Insufficient balance. You need ${formatCurrency(totalPrice - scannedCard.balance)} more.`,
        status: "error",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Log the cart contents and payment details
      console.log("--- PAYMENT PROCESSING START ---")
      console.log("User ID/NFCId:", tempCard.id)
      console.log("User Name:", tempCard.name)
      console.log("User Current Balance:", scannedCard.balance)
      console.log("Total Price to be Charged:", totalPrice)
      console.log("Products in Cart:", scannedProducts)

      // For each product in the cart, create a history entry
      const historyPromises = scannedProducts.map(async (product) => {
        // Calculate the total price for this specific product
        const productTotalPrice = product.price * product.quantity

        // Log each product payment request
        console.log(`Processing payment for product: ${product.name} (ID: ${product.id})`)
        console.log(`Quantity: ${product.quantity}, Price per unit: ${product.price}, Total: ${productTotalPrice}`)

        // Create the payload to send to the backend
        const paymentPayload = {
          NFCId: tempCard.id,
          totalPrice: Number(totalPrice), // Konversi ke number
          productId: Number(product.id), // Konversi ke number
        }

        console.log("Payment payload being sent to backend:", paymentPayload)

        // Create history entry for this product
        return historyService.processHistory(
          tempCard.id, // userId/NFCId
          productTotalPrice,
          product.id,
        )
      })

      // Wait for all history entries to be created
      const historyResults = await Promise.all(historyPromises)
      console.log("Payment responses from backend:", historyResults)
      console.log("New balance should be:", scannedCard.balance - totalPrice)
      console.log("--- PAYMENT PROCESSING COMPLETE ---")

      // Update local balance
      setScannedCard((prev) =>
        prev
          ? {
              ...prev,
              balance: prev.balance - totalPrice,
            }
          : null,
      )

      // Show success notification
      setNotification({
        isOpen: true,
        title: "Payment Successful",
        description: `Payment of ${formatCurrency(totalPrice)} processed.`,
        status: "success",
      })

      // Clear the cart
      setScannedProducts([])
      setCardId("") // Add this line to immediately clear the card ID

      // Reset after delay
      setTimeout(() => {
        setScannedCard(null)
        setTempCard(null)
        setCardId("") // Add this line to clear the card ID input
      }, 3000)
    } catch (error) {
      console.error("Payment failed:", error)
      console.log("Error details:", error.response?.data || error.message || error)

      // Use the error handling helper function
      const errorMessage = historyService.handleApiError
        ? historyService.handleApiError(error)
        : error instanceof Error
          ? error.message
          : "Payment processing failed"

      setNotification({
        isOpen: true,
        title: "Payment Failed",
        description: errorMessage,
        status: "error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleUpdateQuantity = (productId: string | number, action: "increase" | "decrease") => {
    setScannedProducts(
      (prevProducts) =>
        prevProducts
          .map((product) => {
            if (product.id === productId) {
              const newQuantity = action === "increase" ? product.quantity + 1 : Math.max(0, product.quantity - 1)
              return newQuantity === 0 ? null : { ...product, quantity: newQuantity }
            }
            return product
          })
          .filter(Boolean) as ScannedProduct[],
    )
  }

  // If no card is scanned yet, show the initial scan screen
  if (!tempCard) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <ProgressBar />
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="flex h-16 shrink-0 items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg w-full sticky top-0 z-40"
          >
            <div className="flex items-center px-6">
              <SidebarTrigger />
              <SeparatorUI orientation="vertical" className="mx-4 h-4" />
              <motion.h1
                className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Dashboard
              </motion.h1>
            </div>
          </motion.header>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-full max-w-md p-8"
            >
              <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                <form onSubmit={handleCardSubmit} className="p-8 text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <CreditCard className="w-20 h-20 mx-auto text-primary" />
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Scan Your Card
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="card-id" className="text-left block">
                        Card ID
                      </Label>
                      <div className="relative">
                        <CreditCard
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          id="card-id"
                          type="text"
                          value={cardId}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                            setCardId(value)
                            setCardError(null)
                            setCardSuccess(null)
                          }}
                          placeholder="Enter 10-digit card ID"
                          className="pl-10 h-12 text-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-inner"
                          maxLength={10}
                          autoFocus
                          ref={cardInputRef}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {cardError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-center space-x-2"
                        >
                          <X size={18} />
                          <span>{cardError}</span>
                        </motion.div>
                      )}

                      {cardSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md flex items-center space-x-2"
                        >
                          <Check size={18} />
                          <span>{cardSuccess}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                      disabled={isProcessing || cardId.length !== 10}
                    >
                      {isProcessing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        >
                          <CreditCard className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        "Validate Card"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // If card is scanned but PIN is not verified
  if (!scannedCard) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <ProgressBar />
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="flex h-16 shrink-0 items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg w-full sticky top-0 z-40"
          >
            <div className="flex items-center px-6">
              <SidebarTrigger />
              <SeparatorUI orientation="vertical" className="mx-4 h-4" />
              <motion.h1
                className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Enter PIN
              </motion.h1>
            </div>
          </motion.header>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-full max-w-md p-8"
            >
              <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                <form onSubmit={handlePinSubmit} className="p-8">
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4"
                    >
                      <KeyRound className="w-8 h-8 text-primary" />
                    </motion.div>
                    <motion.h2
                      className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Enter Your PIN
                    </motion.h2>
                    <motion.p
                      className="text-sm text-gray-500 dark:text-gray-400 mt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Please enter your 4-digit PIN to continue
                    </motion.p>
                  </div>
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="space-y-2">
                      <Input
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => {
                          setPinError(false)
                          setPin(e.target.value.replace(/\D/g, ""))
                        }}
                        className={cn(
                          "text-center text-2xl tracking-widest h-12",
                          pinError && "border-red-500 focus-visible:ring-red-500",
                        )}
                        placeholder="••••"
                        autoFocus
                        ref={pinInputRef}
                      />
                      {pinError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 text-center"
                        >
                          Incorrect PIN. Please try again.
                        </motion.p>
                      )}
                    </div>
                    <Button type="submit" className="w-full h-12" disabled={pin.length !== 4 || isProcessing}>
                      {isProcessing ? "Verifying..." : "Continue"}
                    </Button>
                  </motion.div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProgressBar />
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex h-16 shrink-0 items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg w-full sticky top-0 z-40"
        >
          <div className="flex items-center px-6">
            <SidebarTrigger />
            <SeparatorUI orientation="vertical" className="mx-4 h-4" />
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Dashboard
            </motion.h1>
          </div>
        </motion.header>
        <div className="flex-grow bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced User Information Card with Camera */}
            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="text-xl flex font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent items-center gap-2">
                    <motion.div
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <Scan className="w-5 h-5 text-primary" />
                    </motion.div>
                    <motion.span
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Scan Item Here
                    </motion.span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Live Camera Feed */}
                  <motion.div
                    className="mb-6 rounded-lg overflow-hidden bg-black"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <LiveCameraFeed />
                  </motion.div>
                </CardContent>
              </Card>

              <motion.div className="grid grid-cols-1 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={simulateProductScan}
                    className="w-full h-12 bg-primary text-primary-foreground font-medium"
                    disabled={!scannedCard}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Select Product
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Scanned Products Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg h-full">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="text-xl flex font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Scanned Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                    <AnimatePresence mode="popLayout">
                      {scannedProducts.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-8"
                        >
                          <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">No products scanned yet</p>
                        </motion.div>
                      ) : (
                        <div className="space-y-4">
                          {scannedProducts.map((product) => (
                            <motion.div
                              key={product.id}
                              layout
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{product.name}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatCurrency(product.price)} × {product.quantity}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleUpdateQuantity(product.id, "decrease")}
                                    className="p-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </motion.button>
                                  <span className="w-8 text-center font-medium">{product.quantity}</span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleUpdateQuantity(product.id, "increase")}
                                    className="p-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <motion.div
                className="flex items-center gap-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex items-center gap-1">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      <User className="inline-block w-5 h-5 mr-2 text-primary" />
                      {formData.name}
                    </p>
                  </motion.div>
                </div>
                <Dot orientation="vertical" opacity="0" />
                <div className="flex items-center gap-3">
                  <div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
                    </motion.div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      <Banknote className="inline-block w-5 h-5 mr-2 text-primary" />
                      {formatCurrency(scannedCard?.balance || 0)}
                    </p>
                  </div>
                </div>
              </motion.div>
              <div className="flex items-center gap-6">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {formatCurrency(totalPrice)}
                  </p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handlePay}
                    className="h-12 px-6 bg-primary text-primary-foreground font-medium relative overflow-hidden group"
                    disabled={!scannedCard || scannedProducts.length === 0 || isProcessing}
                  >
                    <motion.div
                      className="absolute inset-0 bg-primary-foreground opacity-0 group-hover:opacity-10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="flex items-center relative z-10"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {isProcessing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                          className="mr-2"
                        >
                          <Banknote className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <Banknote className="w-5 h-5 mr-2" />
                      )}
                      {isProcessing ? "Processing..." : "Pay"}
                    </motion.div>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.footer>

        <NotificationDialog
          isOpen={notification.isOpen}
          onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
          title={notification.title}
          description={notification.description}
          status={notification.status}
        />

        {/* Product Selection Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select a Product</DialogTitle>
              <DialogDescription>Choose a product to add to the cart</DialogDescription>
            </DialogHeader>
            <ScrollArea className="mt-4 max-h-[60vh]">
              <div className="grid gap-4 py-4">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
