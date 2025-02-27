"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import { CreditCard, User, Wallet, ShoppingCart, X, Check, Plus, Minus } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Simulated RFID card data
const rfidCards = [{ id: "14170", name: "SaLano", balance: 50000, pin: "1417" }]

// Simulated product data
const products = [
  { id: "P001", name: "Product A", price: 10000 },
  { id: "P002", name: "Product B", price: 15000 },
  { id: "P003", name: "Product C", price: 20000 },
]

type ScannedProduct = {
  id: string
  name: string
  price: number
  quantity: number
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

export default function DashboardPage() {
  const [scannedCard, setScannedCard] = useState<(typeof rfidCards)[0] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
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

  const [formData, setFormData] = useState({ rfid: "", name: "" })
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([])

  const simulateProductScan = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)]
    setScannedProducts((prevProducts) => {
      const existingProduct = prevProducts.find((p) => p.id === randomProduct.id)
      if (existingProduct) {
        return prevProducts.map((p) => (p.id === randomProduct.id ? { ...p, quantity: p.quantity + 1 } : p))
      } else {
        return [...prevProducts, { ...randomProduct, quantity: 1 }]
      }
    })
  }

  useEffect(() => {
    // Simulate card scan on component mount
    const card = rfidCards[0]
    setScannedCard(card)
    setFormData({ rfid: card.id, name: card.name })
  }, [])

  const totalPrice = scannedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)

  const handlePay = () => {
    if (scannedCard) {
      if (scannedCard.balance < totalPrice) {
        setNotification({
          isOpen: true,
          title: "Payment Failed",
          description: `Insufficient balance. You need ${formatCurrency(totalPrice - scannedCard.balance)} more to complete this transaction.`,
          status: "error",
        })
        return
      }

      setNotification({
        isOpen: true,
        title: "Payment Successful",
        description: `Payment of ${formatCurrency(totalPrice)} has been processed.`,
        status: "success",
      })
      setScannedProducts([])
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

  const handleUpdateQuantity = (productId: string, action: "increase" | "decrease") => {
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
            <Separator orientation="vertical" className="mx-4 h-4" />
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
            {/* Enhanced User Information Card */}
            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      initial={{ rotate: -180 }}
                      animate={{ rotate: 0 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <User className="w-5 h-5 text-primary" />
                    </motion.div>
                    <motion.span
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      User Information
                    </motion.span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div
                      className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <motion.div
                        className="p-3 rounded-full bg-primary/10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                      >
                        <User className="w-6 h-6 text-primary" />
                      </motion.div>
                      <div className="flex-1">
                        <motion.p
                          className="text-sm text-gray-500 dark:text-gray-400"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          Account Holder
                        </motion.p>
                        <motion.h3
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          {formData.name}
                        </motion.h3>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <motion.div
                        className="p-3 rounded-full bg-primary/10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                      >
                        <CreditCard className="w-6 h-6 text-primary" />
                      </motion.div>
                      <div className="flex-1">
                        <motion.p
                          className="text-sm text-gray-500 dark:text-gray-400"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          Card Number
                        </motion.p>
                        <motion.h3
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          {formData.rfid}
                        </motion.h3>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <motion.div
                        className="p-3 rounded-full bg-primary/10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.8 }}
                      >
                        <Wallet className="w-6 h-6 text-primary" />
                      </motion.div>
                      <div className="flex-1">
                        <motion.p
                          className="text-sm text-gray-500 dark:text-gray-400"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.9 }}
                        >
                          Available Balance
                        </motion.p>
                        <motion.h3
                          className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1 }}
                        >
                          {formatCurrency(scannedCard?.balance || 0)}
                        </motion.h3>
                      </div>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>

              <motion.div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={simulateProductScan}
                    className="w-full h-12 bg-primary text-primary-foreground font-medium"
                    disabled={!scannedCard}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Scan Product
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Scanned Products Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Scanned Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(scannedCard?.balance || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalPrice)}</p>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handlePay}
                    className="h-12 px-6 bg-primary text-primary-foreground font-medium"
                    disabled={!scannedCard || scannedProducts.length === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Pay Now
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
      </SidebarInset>
    </SidebarProvider>
  )
}

