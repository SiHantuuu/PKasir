"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Camera, Minus, Plus, ShoppingCart, CreditCard, KeyRound, CheckCircle, XCircle, CameraOff } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: "Snack Potato Chips",
    price: 8000,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "Chocolate Bar",
    price: 12000,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Mineral Water",
    price: 5000,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    name: "Sandwich",
    price: 15000,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 5,
    name: "Fruit Juice",
    price: 10000,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 6,
    name: "Energy Drink",
    price: 18000,
    image: "/placeholder.svg?height=80&width=80",
  },
]

// Mock student data
const mockStudents = [
  {
    rfid: "NFC001",
    pin: "1234",
    name: "Ahmad Rizky",
    nis: "2023001",
    balance: 250000,
  },
  {
    rfid: "NFC002",
    pin: "5678",
    name: "Siti Nuraini",
    nis: "2023002",
    balance: 175000,
  },
  {
    rfid: "NFC003",
    pin: "9999",
    name: "Budi Santoso",
    nis: "2023003",
    balance: 125000,
  },
]

interface Product {
  id: number
  name: string
  price: number
  image: string
  quantity?: number
}

interface Student {
  rfid: string
  pin: string
  name: string
  nis: string
  balance: number
}

type AuthFlow = "rfid-scan" | "pin-input" | "dashboard"

interface PaymentResult {
  success: boolean
  message: string
  studentName: string
  totalAmount: number
  newBalance?: number
  items: Product[]
}

export default function Dashboard() {
  // Authentication flow state
  const [authFlow, setAuthFlow] = useState<AuthFlow>("rfid-scan")
  const [scannedRfid, setScannedRfid] = useState<string>("")
  const [authenticatedStudent, setAuthenticatedStudent] = useState<Student | null>(null)
  const [pin, setPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  // Dashboard state
  const [scannedProducts, setScannedProducts] = useState<Product[]>([])
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Payment result state
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [showPaymentResult, setShowPaymentResult] = useState(false)

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string>("")

  // Calculate total price
  const totalPrice = scannedProducts.reduce((total, product) => {
    return total + product.price * (product.quantity || 1)
  }, 0)

  // Auto-close payment result popup after 2 seconds
  useEffect(() => {
    if (showPaymentResult && paymentResult) {
      const timer = setTimeout(() => {
        setShowPaymentResult(false)
        setPaymentResult(null)

        // If payment was successful, reset everything and go back to RFID scan
        if (paymentResult.success) {
          resetToRfidScan()
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [showPaymentResult, paymentResult])

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError("")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsCameraActive(true)

        // Setup canvas to match video dimensions
        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth
          canvasRef.current.height = videoRef.current.videoHeight
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraError("Unable to access camera. Please check permissions.")
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  // Capture a frame from the camera
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && isCameraActive) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        // Draw the current video frame to the canvas
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)

        // You could return the data URL if needed
        // return canvasRef.current.toDataURL('image/jpeg')
      }
    }
  }

  // Start camera when entering dashboard
  useEffect(() => {
    if (authFlow === "dashboard") {
      startCamera()
    } else {
      stopCamera()
    }

    // Cleanup on unmount
    return () => {
      stopCamera()
    }
  }, [authFlow])

  // RFID Scan handlers
  const handleRfidScan = () => {
    setIsScanning(true)

    // Simulate RFID scanning delay
    setTimeout(() => {
      // Simulate random RFID scan (in real app, this would come from RFID reader)
      const randomStudent = mockStudents[Math.floor(Math.random() * mockStudents.length)]
      setScannedRfid(randomStudent.rfid)
      setIsScanning(false)
      setAuthFlow("pin-input")
    }, 2000)
  }

  const handleManualRfidInput = (rfid: string) => {
    const student = mockStudents.find((s) => s.rfid === rfid)
    if (student) {
      setScannedRfid(rfid)
      setAuthFlow("pin-input")
    } else {
      // Show error popup instead of browser alert
      setPaymentResult({
        success: false,
        message: "RFID tidak ditemukan dalam sistem!",
        studentName: "",
        totalAmount: 0,
        items: [],
      })
      setShowPaymentResult(true)
    }
  }

  // PIN verification handlers
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPinError("")

    const student = mockStudents.find((s) => s.rfid === scannedRfid && s.pin === pin)

    if (student) {
      setAuthenticatedStudent(student)
      setAuthFlow("dashboard")
      setPin("")
    } else {
      setPinError("PIN salah! Silakan coba lagi.")
      setPin("")
    }
  }

  // Dashboard handlers
  const addProduct = (product: Product) => {
    setScannedProducts((prev) => {
      const existingProductIndex = prev.findIndex((p) => p.id === product.id)

      if (existingProductIndex >= 0) {
        const updatedProducts = [...prev]
        const existingProduct = updatedProducts[existingProductIndex]
        updatedProducts[existingProductIndex] = {
          ...existingProduct,
          quantity: (existingProduct.quantity || 1) + 1,
        }
        return updatedProducts
      } else {
        return [...prev, { ...product, quantity: 1 }]
      }
    })

    setIsProductModalOpen(false)
  }

  const removeProduct = (productId: number) => {
    setScannedProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const increaseQuantity = (productId: number) => {
    setScannedProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            quantity: (product.quantity || 1) + 1,
          }
        }
        return product
      }),
    )
  }

  const decreaseQuantity = (productId: number) => {
    setScannedProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const newQuantity = (product.quantity || 1) - 1
          if (newQuantity <= 0) {
            return product
          }
          return {
            ...product,
            quantity: newQuantity,
          }
        }
        return product
      }),
    )
  }

  const handlePayment = () => {
    if (scannedProducts.length === 0) {
      setPaymentResult({
        success: false,
        message: "Tidak ada produk untuk dibayar!",
        studentName: authenticatedStudent?.name || "",
        totalAmount: 0,
        items: [],
      })
      setShowPaymentResult(true)
      return
    }

    if (authenticatedStudent && totalPrice > authenticatedStudent.balance) {
      setPaymentResult({
        success: false,
        message: `Saldo tidak mencukupi! Saldo Anda: Rp ${authenticatedStudent.balance.toLocaleString()}, Total belanja: Rp ${totalPrice.toLocaleString()}`,
        studentName: authenticatedStudent.name,
        totalAmount: totalPrice,
        items: [...scannedProducts],
      })
      setShowPaymentResult(true)
      return
    }

    // Payment successful
    if (authenticatedStudent) {
      const newBalance = authenticatedStudent.balance - totalPrice

      setPaymentResult({
        success: true,
        message: "Pembayaran berhasil diproses!",
        studentName: authenticatedStudent.name,
        totalAmount: totalPrice,
        newBalance: newBalance,
        items: [...scannedProducts],
      })

      // Update student balance (in real app, this would be sent to backend)
      setAuthenticatedStudent({
        ...authenticatedStudent,
        balance: newBalance,
      })

      setShowPaymentResult(true)
    }
  }

  const resetToRfidScan = () => {
    setAuthFlow("rfid-scan")
    setScannedRfid("")
    setAuthenticatedStudent(null)
    setPin("")
    setPinError("")
    setScannedProducts([])
  }

  const handleLogout = () => {
    resetToRfidScan()
  }

  // RFID Scan Page
  const renderRfidScanPage = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-500" />
            Scan Kartu RFID
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* RFID Scanner Area */}
          <div className="relative bg-slate-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
            {isScanning ? (
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                <p className="text-lg">Scanning...</p>
                <p className="text-sm opacity-70 mt-2">Tempelkan kartu RFID</p>
              </div>
            ) : (
              <div className="text-white text-center">
                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg opacity-70">Siap untuk scan</p>
                <p className="text-sm opacity-50 mt-2">Tempelkan kartu RFID Anda</p>
              </div>
            )}
          </div>

          <Button className="w-full" onClick={handleRfidScan} disabled={isScanning}>
            {isScanning ? "Scanning..." : "Mulai Scan RFID"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Atau masukkan ID manual untuk testing:</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleManualRfidInput("NFC001")}>
                NFC001
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleManualRfidInput("NFC002")}>
                NFC002
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleManualRfidInput("NFC003")}>
                NFC003
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // PIN Input Page
  const renderPinInputPage = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <KeyRound className="h-6 w-6 text-green-500" />
            Masukkan PIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Kartu RFID berhasil discan</span>
            </div>
            <p className="text-sm text-muted-foreground">ID: {scannedRfid}</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN (4 digit)</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pin"
                  type="password"
                  placeholder="Masukkan PIN Anda"
                  className="pl-10 text-center text-lg tracking-widest"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  autoFocus
                />
              </div>
              {pinError && <p className="text-sm text-red-500">{pinError}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={pin.length !== 4}>
              Verifikasi PIN
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={() => setAuthFlow("rfid-scan")}>
              Kembali ke Scan RFID
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">Testing PIN:</p>
            <p className="text-xs text-muted-foreground">NFC001: 1234, NFC002: 5678, NFC003: 9999</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Dashboard Page with working camera
  const renderDashboard = () => (
    <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-8 justify-between">
          <h1 className="text-2xl font-semibold">Dashboard Payment</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{authenticatedStudent?.name}</p>
              <p className="text-xs text-muted-foreground">NIS: {authenticatedStudent?.nis}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - split into two equal columns */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 h-full">
          {/* Left section - Camera */}
          <div className="p-6 border-r">
            <Card className="w-full h-full flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  {isCameraActive ? (
                    <Camera className="h-6 w-6 text-green-500" />
                  ) : (
                    <CameraOff className="h-6 w-6 text-red-500" />
                  )}
                  Camera
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-2">
                {/* Camera area */}
                <div className="relative flex-1 bg-slate-900 rounded-md overflow-hidden mb-6">
                  {isCameraActive ? (
                    <>
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ display: "none" }} // Hidden by default, can be used for AI processing
                      />
                      {/* Status indicator */}
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Camera Active
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      {cameraError ? (
                        <div className="text-center p-8">
                          <CameraOff className="h-16 w-16 mx-auto mb-4 text-red-400" />
                          <p className="text-lg text-red-400 mb-2">Camera Error</p>
                          <p className="text-sm opacity-70">{cameraError}</p>
                          <Button variant="outline" size="sm" className="mt-4" onClick={startCamera}>
                            Retry Camera
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg opacity-70">Starting camera...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Camera controls */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant={isCameraActive ? "destructive" : "default"}
                    onClick={isCameraActive ? stopCamera : startCamera}
                  >
                    {isCameraActive ? (
                      <>
                        <CameraOff className="mr-2 h-4 w-4" />
                        Stop Camera
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsProductModalOpen(true)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Select Product
                  </Button>
                </div>

                {/* Instructions */}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>Camera feed ready for AI processing</p>
                  <p className="text-xs mt-1">Use the camera to capture product images</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right section - Scanned Products */}
          <div className="p-6">
            <Card className="w-full h-full flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShoppingCart className="h-6 w-6" />
                  Scanned Products
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-2">
                {scannedProducts.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                    <ShoppingCart className="h-32 w-32 mb-6 opacity-30" />
                    <p className="text-xl">No products scanned yet</p>
                    <p className="text-sm mt-2">Add products manually</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <div className="space-y-4">
                      {scannedProducts.map((product) => (
                        <div key={product.id} className="flex items-center gap-4 p-4 border rounded-md">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={70}
                            height={70}
                            className="rounded-md object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-lg truncate">{product.name}</p>
                            <p className="text-muted-foreground">Rp {product.price.toLocaleString()}</p>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mr-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => decreaseQuantity(product.id)}
                              disabled={(product.quantity || 1) <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{product.quantity || 1}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => increaseQuantity(product.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-medium text-lg">
                              Rp {(product.price * (product.quantity || 1)).toLocaleString()}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 px-2 mt-1"
                              onClick={() => removeProduct(product.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom bar - Order Summary */}
      <div className="border-t bg-white shadow-lg">
        <Card className="w-full rounded-none border-0">
          <CardContent className="py-3 px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* User Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{authenticatedStudent?.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="font-medium">Rp {authenticatedStudent?.balance.toLocaleString()}</span>
                </div>
              </div>

              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium">{scannedProducts.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Quantity:</span>
                  <span className="font-medium">
                    {scannedProducts.reduce((total, item) => total + (item.quantity || 1), 0)}
                  </span>
                </div>
              </div>

              {/* Price and Payment */}
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  <span className="text-lg mr-2">Total Price:</span>
                  <span className="text-2xl font-bold">Rp {totalPrice.toLocaleString()}</span>
                </div>

                <Button size="lg" disabled={scannedProducts.length === 0} onClick={handlePayment} className="px-6 py-2">
                  Pay Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Selection Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Product</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="grid" className="w-full" onValueChange={(value) => setViewMode(value as "grid" | "list")}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {sampleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => addProduct(product)}
                  >
                    <div className="flex justify-center mb-4">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-center text-lg">{product.name}</h3>
                    <p className="text-center text-muted-foreground mt-1">Rp {product.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <div className="space-y-3">
                {sampleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-6 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => addProduct(product)}
                  >
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{product.name}</h3>
                    </div>
                    <p className="font-medium text-lg">Rp {product.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />

        {authFlow === "rfid-scan" && renderRfidScanPage()}
        {authFlow === "pin-input" && renderPinInputPage()}
        {authFlow === "dashboard" && renderDashboard()}

        {/* Payment Result Dialog - Auto close after 2 seconds */}
        <AlertDialog open={showPaymentResult} onOpenChange={() => {}}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-2 mb-2">
                {paymentResult?.success ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <AlertDialogTitle className={paymentResult?.success ? "text-green-800" : "text-red-800"}>
                  {paymentResult?.success ? "Payment Successful!" : "Payment Failed"}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-left space-y-3">
                <div className="text-gray-700">
                  <p className="font-medium">{paymentResult?.message}</p>

                  {paymentResult?.studentName && (
                    <div className="mt-3 space-y-1">
                      <p>
                        <span className="font-medium">Student:</span> {paymentResult.studentName}
                      </p>
                      <p>
                        <span className="font-medium">Total Amount:</span> Rp{" "}
                        {paymentResult.totalAmount.toLocaleString()}
                      </p>
                      {paymentResult.success && paymentResult.newBalance !== undefined && (
                        <p>
                          <span className="font-medium">New Balance:</span> Rp{" "}
                          {paymentResult.newBalance.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {paymentResult?.items && paymentResult.items.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium mb-2">Items purchased:</p>
                      <div className="space-y-1 text-sm">
                        {paymentResult.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>
                              {item.name} x{item.quantity || 1}
                            </span>
                            <span>Rp {(item.price * (item.quantity || 1)).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Auto-close indicator */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      {paymentResult?.success
                        ? "Returning to RFID scan in 2 seconds..."
                        : "This dialog will close automatically in 2 seconds..."}
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  )
}
