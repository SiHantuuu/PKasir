"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  CreditCard,
  KeyRound,
  History,
  Check,
  X,
  Search,
  Calendar,
  ShoppingCart,
  Wallet,
  User,
  Eye,
  AlertTriangle,
} from "lucide-react"

// Mock transaction data
const transactions = [
  { id: 1, amount: -15000, type: "payment", date: "2025-02-24T10:00:00", itemName: "Owl Perch" },
  { id: 2, amount: -25000, type: "payment", date: "2025-01-23T15:30:00", itemName: "Feather Brush" },
  { id: 3, amount: 100000, type: "top-up", date: "2025-01-22T09:15:00", itemName: "Balance Top Up" },
  { id: 4, amount: -50000, type: "payment", date: "2025-01-20T14:20:00", itemName: "Nocturnal Treats" },
  { id: 5, amount: -30000, type: "payment", date: "2025-01-18T11:45:00", itemName: "Owl Toy" },
  { id: 6, amount: 50000, type: "top-up", date: "2025-01-15T16:30:00", itemName: "Balance Top Up" },
]

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
                  <p className="text-base text-gray-600 dark:text-gray-300">{description}</p>
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

// Add this new component for the authentication form
const AuthForm = ({ onAuthenticate }: { onAuthenticate: (nisn: string, pin: string) => void }) => {
  const [nisn, setNisn] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nisn.length !== 10) {
      setError("NISN must be 10 digits long")
      return
    }
    if (pin.length !== 4) {
      setError("PIN must be 4 digits long")
      return
    }
    onAuthenticate(nisn, pin)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-[calc(100vh-4rem)]"
    >
      <Card className="w-full max-w-md overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Access Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nisn">NISN (National Student ID Number)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="nisn"
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="pl-10"
                  placeholder="Enter your 10-digit NISN"
                  maxLength={10}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hint: Use "1234567890"</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="pl-10"
                  placeholder="Enter your 4-digit PIN"
                  maxLength={4}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hint: Use "1234"</p>
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-center space-x-2"
              >
                <X size={18} />
                <span>{error}</span>
              </motion.div>
            )}
            <Button type="submit" className="w-full">
              Access Wallet
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Modify the main component to include the authentication state and form
export default function MyWalletPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinError, setPinError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
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
  const [isCurrentPinCorrect, setIsCurrentPinCorrect] = useState<boolean | null>(null)

  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  // Mock user data
  const user = {
    name: "Student User",
    cardId: "12345",
    balance: 150000,
    pin: "1234", // This would normally be stored securely and not in plain text
  }

  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    const matchesMonth = selectedMonth === "all" || (transactionDate.getMonth() + 1).toString() === selectedMonth

    const query = searchQuery.trim().toLowerCase()

    // If search query is empty, don't filter by search
    if (!query) {
      return matchesMonth
    }

    // Filter by item name and transaction type
    const itemName = transaction.itemName.toLowerCase()
    const transactionType = transaction.type.toLowerCase()
    const matchesSearch = itemName.includes(query) || transactionType.includes(query)

    return matchesMonth && matchesSearch
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Update the handlePinChange function to show notifications for both success and failure cases
  const handlePinChange = () => {
    setPinError(null)
    setIsProcessing(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Validate current PIN
      if (currentPin !== user.pin) {
        setPinError("Current PIN is incorrect")
        setIsProcessing(false)
        setNotification({
          isOpen: true,
          title: "PIN Change Failed",
          description: "The current PIN you entered is incorrect. Please try again.",
          status: "error",
        })
        return
      }

      // Validate new PIN
      if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        setPinError("New PIN must be 4 digits")
        setIsProcessing(false)
        setNotification({
          isOpen: true,
          title: "PIN Change Failed",
          description: "New PIN must be 4 digits. Please try again.",
          status: "error",
        })
        return
      }

      // Validate PIN confirmation
      if (newPin !== confirmPin) {
        setPinError("PINs do not match")
        setIsProcessing(false)
        setNotification({
          isOpen: true,
          title: "PIN Change Failed",
          description: "The new PINs you entered do not match. Please try again.",
          status: "error",
        })
        return
      }

      // Success case
      setNotification({
        isOpen: true,
        title: "PIN Changed Successfully",
        description: "Your PIN has been updated. Please use your new PIN for future transactions.",
        status: "success",
      })

      // Reset form
      setCurrentPin("")
      setNewPin("")
      setConfirmPin("")
      setIsProcessing(false)
    }, 1500)
  }

  // Update the handleAuthenticate function to show notifications for both success and failure cases
  const handleAuthenticate = useCallback((nisn: string, pin: string) => {
    // For demonstration, we'll use a simple check. In a real app, this would involve a server call.
    if (nisn === "1234567890" && pin === "1234") {
      setIsAuthenticated(true)
      setNotification({
        isOpen: true,
        title: "Authentication Successful",
        description: "Welcome to your wallet!",
        status: "success",
      })
    } else {
      setNotification({
        isOpen: true,
        title: "Authentication Failed",
        description: "Invalid NISN or PIN. Please try again.",
        status: "error",
      })
    }
  }, [])

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  // Modify the return statement to conditionally render based on authentication state
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
              My Wallet
            </motion.h1>
          </div>
        </motion.header>

        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container max-w-6xl p-6 mx-auto min-h-[calc(100vh-4rem)]">
            <AnimatePresence mode="wait">
              {!isAuthenticated ? (
                <AuthForm onAuthenticate={handleAuthenticate} />
              ) : (
                // Existing wallet content goes here
                <motion.div
                  key="wallet-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* User Balance Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                              Welcome, {user.name}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <CreditCard className="w-4 h-4" />
                              <span>Card ID: {user.cardId}</span>
                            </div>
                          </div>
                          <motion.div
                            className="flex items-center gap-3"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <motion.div
                              animate={{
                                rotate: [0, 10, -10, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: "reverse",
                              }}
                            >
                              <Wallet className="w-8 h-8 text-primary" />
                            </motion.div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {formatCurrency(user.balance)}
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Tabs for PIN Management and Transaction History */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Tabs defaultValue="pin" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="pin" className="text-base py-3">
                          <KeyRound className="w-4 h-4 mr-2" />
                          Change PIN
                        </TabsTrigger>
                        <TabsTrigger value="history" className="text-base py-3">
                          <History className="w-4 h-4 mr-2" />
                          Transaction History
                        </TabsTrigger>
                      </TabsList>

                      {/* PIN Management Tab */}
                      <TabsContent value="pin">
                        <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                              Change Your PIN
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <motion.div
                              className="space-y-4"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <div className="space-y-2">
                                <Label htmlFor="current-pin" className="text-gray-700 dark:text-gray-300">
                                  Current PIN
                                </Label>
                                <div className="relative">
                                  <KeyRound
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                  />
                                  <Input
                                    id="current-pin"
                                    type={showCurrentPin ? "text" : "password"}
                                    value={currentPin}
                                    onChange={(e) => {
                                      const newPin = e.target.value.replace(/\D/g, "").slice(0, 4)
                                      setCurrentPin(newPin)
                                      setPinError(null)
                                      setIsCurrentPinCorrect(newPin === user.pin)
                                    }}
                                    placeholder="Enter current PIN"
                                    className="pl-10 pr-10"
                                    maxLength={4}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onMouseDown={() => setShowCurrentPin(true)}
                                    onMouseUp={() => setShowCurrentPin(false)}
                                    onMouseLeave={() => setShowCurrentPin(false)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                                <AnimatePresence>
                                  {currentPin && isCurrentPinCorrect === false && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      transition={{ duration: 0.2 }}
                                      className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-center space-x-2"
                                    >
                                      <AlertTriangle size={18} />
                                      <span>Current PIN is incorrect</span>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="new-pin" className="text-gray-700 dark:text-gray-300">
                                  New PIN (4 digits)
                                </Label>
                                <div className="relative">
                                  <KeyRound
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                  />
                                  <Input
                                    id="new-pin"
                                    type={showNewPin ? "text" : "password"}
                                    value={newPin}
                                    onChange={(e) => {
                                      setPinError(null)
                                      setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                                    }}
                                    placeholder="Enter new PIN"
                                    className="pl-10 pr-10"
                                    maxLength={4}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onMouseDown={() => setShowNewPin(true)}
                                    onMouseUp={() => setShowNewPin(false)}
                                    onMouseLeave={() => setShowNewPin(false)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="confirm-pin" className="text-gray-700 dark:text-gray-300">
                                  Confirm New PIN
                                </Label>
                                <div className="relative">
                                  <KeyRound
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                  />
                                  <Input
                                    id="confirm-pin"
                                    type={showConfirmPin ? "text" : "password"}
                                    value={confirmPin}
                                    onChange={(e) => {
                                      setPinError(null)
                                      setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                                    }}
                                    placeholder="Confirm new PIN"
                                    className="pl-10 pr-10"
                                    maxLength={4}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onMouseDown={() => setShowConfirmPin(true)}
                                    onMouseUp={() => setShowConfirmPin(false)}
                                    onMouseLeave={() => setShowConfirmPin(false)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {newPin !== confirmPin && newPin && confirmPin && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-md flex items-center space-x-2"
                                >
                                  <AlertTriangle size={18} />
                                  <span>New PIN and Confirm PIN do not match</span>
                                </motion.div>
                              )}

                              <motion.div
                                className="pt-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                              >
                                <AnimatedButton
                                  onClick={handlePinChange}
                                  className="w-full"
                                  disabled={
                                    isProcessing ||
                                    currentPin.length !== 4 ||
                                    newPin.length !== 4 ||
                                    confirmPin.length !== 4 ||
                                    newPin !== confirmPin ||
                                    isCurrentPinCorrect === false
                                  }
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {isProcessing ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                    >
                                      <KeyRound className="w-5 h-5" />
                                    </motion.div>
                                  ) : (
                                    "Change PIN"
                                  )}
                                </AnimatedButton>
                              </motion.div>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Transaction History Tab */}
                      <TabsContent value="history">
                        <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                          <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Transaction History
                              </CardTitle>
                              <div className="flex flex-col sm:flex-row gap-4">
                                <motion.div
                                  className="relative"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                  <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full sm:w-[200px] pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  >
                                    {months.map((month) => (
                                      <option key={month.value} value={month.value}>
                                        {month.label}
                                      </option>
                                    ))}
                                  </select>
                                </motion.div>
                                <motion.div
                                  className="relative"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                  <Input
                                    type="text"
                                    placeholder="Search transactions"
                                    className="pl-10 w-full sm:w-64 bg-white/50 dark:bg-gray-700/50 border-0 shadow-inner"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                  />
                                </motion.div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <motion.div layout className="space-y-4">
                              <AnimatePresence mode="popLayout">
                                {filteredTransactions.length > 0 ? (
                                  filteredTransactions.map((transaction) => (
                                    <motion.div
                                      key={transaction.id}
                                      layout
                                      variants={itemVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 50,
                                        mass: 1,
                                      }}
                                    >
                                      <motion.div
                                        className={cn(
                                          "flex items-center justify-between p-4 rounded-lg",
                                          "bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md",
                                        )}
                                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                      >
                                        <div className="flex items-center gap-4">
                                          <motion.div
                                            className={cn(
                                              "w-10 h-10 rounded-full flex items-center justify-center",
                                              transaction.type === "top-up"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-destructive/10 text-destructive",
                                            )}
                                            whileHover={{ rotate: transaction.type === "top-up" ? 90 : -90 }}
                                          >
                                            {transaction.type === "top-up" ? (
                                              <Wallet className="w-5 h-5" />
                                            ) : (
                                              <ShoppingCart className="w-5 h-5" />
                                            )}
                                          </motion.div>
                                          <div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                              {transaction.itemName}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                              {format(new Date(transaction.date), "dd MMM yyyy, HH:mm")}
                                            </div>
                                          </div>
                                        </div>
                                        <motion.div
                                          className={cn(
                                            "text-lg font-medium",
                                            transaction.type === "top-up" ? "text-primary" : "text-destructive",
                                          )}
                                          whileHover={{ scale: 1.1 }}
                                        >
                                          {transaction.type === "top-up" ? "+" : "-"}
                                          {formatCurrency(Math.abs(transaction.amount))}
                                        </motion.div>
                                      </motion.div>
                                    </motion.div>
                                  ))
                                ) : (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                  >
                                    No transactions found
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

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

