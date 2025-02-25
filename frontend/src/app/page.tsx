"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, User, Wallet, ShoppingCart } from "lucide-react"

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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-2xl font-bold">RFID Scanner</h1>
          </div>
        </header>
        <div className="flex flex-col h-[calc(100vh-4rem)] p-4">
          <div className="grid grid-cols-2 gap-4 flex-grow">
            <div className="flex flex-col gap-4">
              <Card className="w-full">
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
              <Button onClick={simulateScan} size="lg" className="w-full">
                Simulate RFID Scan
              </Button>
              <Button onClick={simulateProductScan} size="lg" className="w-full">
                Simulate Product Scan
              </Button>
            </div>
            <div className="flex flex-col">
              <Card className="flex-grow">
                <CardHeader>
                  <CardTitle>Scanned Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {scannedProducts.length === 0 ? (
                    <p className="text-center text-gray-500">No products scanned yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {scannedProducts.map((product) => (
                        <li key={product.id} className="flex justify-between items-center">
                          <span>{product.name}</span>
                          <span>
                            {product.quantity} x Rp {product.price.toLocaleString("id-ID")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {scannedCard && (
              <Card className="w-full">
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
                className="w-full md:w-auto"
                disabled={!scannedCard || scannedProducts.length === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Pay
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

