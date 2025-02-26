"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, User, Wallet, ShoppingCart, Search } from "lucide-react"

// Simulated RFID card data
const rfidCards = [
  { id: "12345", name: "John Doe", balance: 50000 },
  { id: "67890", name: "Jane Smith", balance: 75000 },
  { id: "24680", name: "Alice Johnson", balance: 100000 },
]

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

export default function Page() {
  const [scannedCard, setScannedCard] = useState<(typeof rfidCards)[0] | null>(null)
  const [formData, setFormData] = useState({ rfid: "", name: "" })
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const simulateScan = () => {
    const randomCard = rfidCards[Math.floor(Math.random() * rfidCards.length)]
    setScannedCard(randomCard)
  }

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
    if (scannedCard) {
      setFormData({ rfid: scannedCard.id, name: scannedCard.name })
    }
  }, [scannedCard])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const totalPrice = scannedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)

  const handlePay = () => {
    if (scannedCard) {
      console.log("Processing payment for:", scannedCard)
      console.log("Products:", scannedProducts)
      console.log("Total amount:", totalPrice)
      // Here you would typically process the payment
      // For now, we'll just clear the scanned card and products
      setScannedCard(null)
      setFormData({ rfid: "", name: "" })
      setScannedProducts([])
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
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
              RFID Scanner
            </motion.h1>
          </div>
          <div className="flex-1 flex justify-end items-center space-x-4 px-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
            </motion.div>
          </div>
        </motion.header>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
          <div className="grid grid-cols-2 gap-4 flex-grow">
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rfid">RFID Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="rfid"
                          name="rfid"
                          placeholder="RFID Number"
                          value={formData.rfid}
                          onChange={handleInputChange}
                          className="pl-8"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="User Name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-8"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={simulateScan} size="lg" className="w-full bg-primary text-primary-foreground">
                Simulate RFID Scan
              </Button>
              <Button onClick={simulateProductScan} size="lg" className="w-full bg-primary text-primary-foreground">
                Simulate Product Scan
              </Button>
            </motion.div>
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="flex-grow bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Scanned Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    {scannedProducts.length === 0 ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-gray-500"
                      >
                        No products scanned yet
                      </motion.p>
                    ) : (
                      <ul className="space-y-2">
                        {scannedProducts.map((product) => (
                          <motion.li
                            key={product.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex justify-between items-center"
                          >
                            <span>{product.name}</span>
                            <span>
                              {product.quantity} x Rp {product.price.toLocaleString("id-ID")}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <motion.div
            className="grid grid-cols-2 gap-4 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {scannedCard && (
              <Card className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                <CardContent className="flex items-center p-4">
                  <Wallet className="h-6 w-6 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold">Rp {scannedCard.balance.toLocaleString("id-ID")}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex flex-col items-end justify-end">
              <div className="mb-2 text-right">
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold">Rp {totalPrice.toLocaleString("id-ID")}</p>
              </div>
              <Button
                onClick={handlePay}
                size="lg"
                className="w-full md:w-auto bg-primary text-primary-foreground"
                disabled={!scannedCard || scannedProducts.length === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Pay
              </Button>
            </div>
          </motion.div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

