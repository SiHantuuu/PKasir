"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence, LayoutGroup, useScroll, useSpring } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, DollarSign, Calendar, User, Search, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Define TypeScript interfaces
interface Item {
  name: string
  price: number
  quantity: number
}

interface Payment {
  id: string
  dateTime: string
  userName: string
  totalPrice: number
  items: Item[]
}

// Mock data
const paymentHistory: Payment[] = [
  {
    id: "USR001",
    dateTime: "2025-01-23 20:15:30",
    userName: "arsyad",
    totalPrice: 150000,
    items: [
      { name: "Owl Perch", price: 75000, quantity: 1 },
      { name: "Feather Brush", price: 25000, quantity: 2 },
      { name: "Nocturnal Treats", price: 50000, quantity: 1 },
    ],
  },
  {
    id: "USR002",
    dateTime: "2025-02-22 15:30:45",
    userName: "athar",
    totalPrice: 200000,
    items: [
      { name: "Owl House", price: 120000, quantity: 1 },
      { name: "Owl Toy", price: 30000, quantity: 1 },
      { name: "Premium Owl Food", price: 50000, quantity: 1 },
    ],
  },
  {
    id: "USR003",
    dateTime: "2025-03-21 10:45:20",
    userName: "lano",
    totalPrice: 175000,
    items: [
      { name: "Night Vision Goggles", price: 100000, quantity: 1 },
      { name: "Silent Flight Training Manual", price: 75000, quantity: 1 },
    ],
  },
  {
    id: "USR004",
    dateTime: "2025-04-21 10:45:20",
    userName: "haris",
    totalPrice: 175000,
    items: [
      { name: "Night Vision Goggles", price: 100000, quantity: 1 },
      { name: "Silent Flight Training Manual", price: 75000, quantity: 1 },
    ],
  },
  {
    id: "USR005",
    dateTime: "2025-05-21 10:45:20",
    userName: "actual burung hantu",
    totalPrice: 175000,
    items: [
      { name: "Night Vision Goggles", price: 100000, quantity: 1 },
      { name: "Silent Flight Training Manual", price: 75000, quantity: 1 },
    ],
  },
  
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

const AnimatedButton = motion(Button)

function PurchaseDetailsDialog({
  payment,
  isOpen,
  onClose,
}: {
  payment: Payment
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
        <DialogHeader>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Purchase Details
            </DialogTitle>
          </motion.div>
        </DialogHeader>
        <AnimatedButton
          variant="ghost"
          className="absolute right-4 top-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </AnimatedButton>
        <motion.div
          className="mt-4 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="flex items-center space-x-2 text-sm"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Transaction ID:</span>
            <span className="text-gray-600 dark:text-gray-400">{payment.id}</span>
          </motion.div>
          <motion.div
            className="flex items-center space-x-2 text-sm"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {format(new Date(payment.dateTime), "dd MMM yyyy, HH:mm")}
            </span>
          </motion.div>
          <motion.div
            className="flex items-center space-x-2 text-sm"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <User className="h-5 w-5 text-primary" />
            <span className="font-medium text-gray-700 dark:text-gray-300">User:</span>
            <span className="text-gray-600 dark:text-gray-400">{payment.userName}</span>
          </motion.div>
          <motion.div
            className="mt-6 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {payment.items.map((item: Item, index: number) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="flex justify-between text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm p-3 rounded-lg shadow-sm"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {item.name} (x{item.quantity})
                </span>
                <span className="text-gray-600 dark:text-gray-400">Rp {item.price.toLocaleString()}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="mt-6 flex justify-between items-center p-4 bg-primary/10 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">Total Amount</span>
            <motion.span
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              whileHover={{ scale: 1.1 }}
            >
              Rp {payment.totalPrice.toLocaleString()}
            </motion.span>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

export default function Page() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const filteredPayments = useMemo(() => {
    return paymentHistory.filter((payment) => {
      const paymentDate = new Date(payment.dateTime)
      const matchesMonth = selectedMonth === null || paymentDate.getMonth() === selectedMonth
      const matchesSearch =
        payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesMonth && matchesSearch
    })
  }, [selectedMonth, searchQuery])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProgressBar />
        {/* Header Section */}
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
              Payment History
            </motion.h1>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container max-w-6xl p-6 mx-auto">
            {/* Search and Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  className="relative flex-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by user or transaction ID"
                    className="pl-10 w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </motion.div>
              </div>
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {months.map((month, index) => (
                  <AnimatedButton
                    key={month}
                    variant={selectedMonth === index ? "default" : "outline"}
                    onClick={() => setSelectedMonth(selectedMonth === index ? null : index)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm transition-all",
                      selectedMonth === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md",
                    )}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {month}
                  </AnimatedButton>
                ))}
              </motion.div>
            </motion.div>

            {/* Payment List */}
            <LayoutGroup>
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredPayments.map((payment: Payment, index: number) => (
                    <motion.div
                      key={payment.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => setSelectedPayment(payment)}
                      className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg rounded-xl cursor-pointer"
                      whileHover={{ y: -4, scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                          <motion.div
                            className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <DollarSign className="w-6 h-6 text-primary" />
                          </motion.div>
                          <div>
                            <motion.p className="font-medium text-gray-800 dark:text-gray-200" whileHover={{ x: 5 }}>
                              {payment.userName}
                            </motion.p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(payment.dateTime), "dd MMM yyyy, HH:mm")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <motion.p
                            className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.1 }}
                          >
                            Rp {payment.totalPrice.toLocaleString()}
                          </motion.p>
                          <motion.div whileHover={{ x: 5 }} className="text-primary">
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredPayments.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No payments found</p>
                  </motion.div> 
                )}
              </motion.div>
            </LayoutGroup>
          </div>
        </div>
      </SidebarInset>
      {selectedPayment && (
        <PurchaseDetailsDialog
          payment={selectedPayment}
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </SidebarProvider>
  )
}

