"use client"
import { useState } from "react"
import type React from "react"

import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import { CreditCard, Wallet, ArrowRight, X, Check, Search, Calendar } from "lucide-react"
import { format } from "date-fns"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dummy transaction history data
const transactions = [
  { id: 1, amount: 50000, type: "top-up", date: "2024-02-24T10:00:00", userName: "Burung Hantu" },
  { id: 2, amount: -25000, type: "payment", date: "2024-01-23T15:30:00", userName: "Burung Hantu" },
  { id: 3, amount: 100000, type: "top-up", date: "2024-01-22T09:15:00", userName: "Burung Hantu" },
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

interface ErrorDialogProps {
  isOpen: boolean
  onClose: () => void
}

function ErrorDialog({ isOpen, onClose }: ErrorDialogProps) {
  return (
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
              className="w-16 h-16 rounded-full flex items-center justify-center bg-destructive/10 text-destructive"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              <X className="w-8 h-8" />
            </motion.div>
            <motion.div
              className="text-center space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Card ID Failed</DialogTitle>
              <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
                The card ID you entered is not recognized. Please check and try again.
              </DialogDescription>
            </motion.div>
          </motion.div>
        </DialogHeader>
        <motion.div
          className="mt-4 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={onClose} className="px-8" variant="destructive">
            Try Again
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

const AnimatedButton = motion(Button)

export default function Page() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [nfcId, setNfcId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [showErrorDialog, setShowErrorDialog] = useState(false)
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

  // Dummy user data
  const user = nfcId
    ? {
        username: "johndoe",
        balance: 150000,
        nfcId: "burunghantu123",
      }
    : null

  const presetAmounts = [10000, 20000, 50000, 100000, 200000, 500000]
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
    const matchesSearch = transaction.userName.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setCustomAmount(value)
    const numValue = Number.parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue)
    } else {
      setSelectedAmount(null)
    }
  }

  const handlePresetAmount = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount(amount.toString())
  }

  const showNotification = (title: string, description: string, status: "success" | "error") => {
    setNotification({
      isOpen: true,
      title,
      description,
      status,
    })
  }

  const handleNfcSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const nfcValue = formData.get("nfc") as string

    setIsProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (nfcValue === "burunghantu123") {
        setNfcId(nfcValue)
        showNotification("Card Connected", "Your card has been successfully connected.", "success")
      } else {
        setShowErrorDialog(true)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTopUp = async () => {
    if (selectedAmount && selectedAmount >= 10000) {
      setIsProcessing(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        showNotification(
          "Top Up Successful",
          `Amount ${formatCurrency(selectedAmount)} has been successfully added to your balance.`,
          "success",
        )
        setTimeout(() => {
          setNfcId(null)
          setSelectedAmount(null)
          setCustomAmount("")
        }, 2000)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleClearNfc = () => {
    setNfcId(null)
    setSelectedAmount(null)
    setCustomAmount("")
  }

  const isValidAmount = selectedAmount && selectedAmount >= 10000

  if (!nfcId) {
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
                Top Up
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
                <form onSubmit={handleNfcSubmit} className="space-y-8 p-8">
                  <motion.div
                    className="space-y-4 text-center"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
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
                      className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Tap Your Card
                    </motion.h2>
                    <motion.p
                      className="text-sm text-gray-500 dark:text-gray-400"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Please tap your NFC card or enter your card ID manually
                    </motion.p>
                  </motion.div>
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="nfc" className="text-gray-700 dark:text-gray-300">
                      Card ID
                    </Label>
                    <Input
                      id="nfc"
                      name="nfc"
                      placeholder="Enter your card ID"
                      className="h-12 text-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-inner"
                      required
                    />
                  </motion.div>
                  <AnimatedButton
                    type="submit"
                    className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                    disabled={isProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <CreditCard className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      "Continue"
                    )}
                  </AnimatedButton>
                </form>
              </Card>
            </motion.div>
          </motion.div>
          <ErrorDialog isOpen={showErrorDialog} onClose={() => setShowErrorDialog(false)} />
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
            <Separator orientation="vertical" className="mx-4 h-4" />
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Top Up
            </motion.h1>
          </div>
        </motion.header>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container max-w-6xl p-6 mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring" }}
              >
                <Alert className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <AlertDescription className="flex items-center text-gray-700 dark:text-gray-300">
                    Card ID: {nfcId}
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={handleClearNfc}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-4 h-4 mr-1" /> Clear Card
                    </AnimatedButton>
                  </AlertDescription>
                </Alert>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                    <CardContent className="p-6 space-y-6">
                      <motion.div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          Profile
                        </h2>
                        <div className="text-lg text-gray-600 dark:text-gray-400">@{user?.username}</div>
                      </motion.div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Balance</div>
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
                          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {formatCurrency(user?.balance || 0)}
                          </span>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Top Up Card */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                    <CardContent className="p-6 space-y-6">
                      <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Top Up
                      </h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="custom-amount" className="text-gray-700 dark:text-gray-300">
                            Custom Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                              Rp
                            </span>
                            <Input
                              id="custom-amount"
                              type="text"
                              placeholder="Enter amount"
                              value={customAmount}
                              onChange={handleCustomAmountChange}
                              className="pl-9 h-12 text-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-inner"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-gray-700 dark:text-gray-300">Quick Amounts</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <AnimatePresence>
                              {presetAmounts.map((amount, index) => (
                                <motion.div
                                  key={amount}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <AnimatedButton
                                    variant="outline"
                                    className={cn(
                                      "w-full h-16 text-lg transition-all bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md",
                                      selectedAmount === amount && "border-primary border-2 bg-primary/5",
                                    )}
                                    onClick={() => handlePresetAmount(amount)}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {formatCurrency(amount)}
                                  </AnimatedButton>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                      <AnimatedButton
                        className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                        disabled={!isValidAmount || isProcessing}
                        onClick={handleTopUp}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isProcessing ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <ArrowRight className="w-6 h-6" />
                          </motion.div>
                        ) : isValidAmount ? (
                          <span className="flex items-center gap-2">
                            Top Up {formatCurrency(selectedAmount)} <ArrowRight className="w-5 h-5" />
                          </span>
                        ) : (
                          "Enter Valid Amount"
                        )}
                      </AnimatedButton>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Transaction History with Month Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <motion.h2
                        className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        Transaction History
                      </motion.h2>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <motion.div className="relative" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-full sm:w-[200px] pl-10">
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>
                        <motion.div className="relative" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Search transactions"
                            className="pl-10 w-full sm:w-64 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <AnimatePresence mode="wait">
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.map((transaction, index) => (
                            <motion.div
                              key={transaction.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                            >
                              <div
                                className={cn(
                                  "flex items-center justify-between p-4 rounded-lg",
                                  "bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md",
                                )}
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
                                    <ArrowRight className="w-5 h-5" />
                                  </motion.div>
                                  <div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                      {transaction.type === "top-up" ? "Top Up" : "Payment"}
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
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 text-gray-500 dark:text-gray-400"
                          >
                            No transactions found
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
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

