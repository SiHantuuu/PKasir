"use client"

import type React from "react"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Search, Wallet, CreditCard, ArrowRight, CreditCardIcon, CheckCircle, XCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TopUpPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [idInput, setIdInput] = useState("")

  // Student state after authentication
  const [student, setStudent] = useState<Student | null>(null)
  const [selectedAmount, setSelectedAmount] = useState<string>("")
  const [customAmount, setCustomAmount] = useState("")

  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showFailureAlert, setShowFailureAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock student data
  const mockStudent: Student = {
    id: 1,
    nis: "2023001",
    nisn: "9876543210",
    name: "Ahmad Rizky",
    balance: 250000,
    avatar: "/placeholder.svg?height=40&width=40",
  }

  // Mock transaction history
  const transactions = [
    {
      id: 1,
      date: "2023-05-15",
      time: "10:15:23",
      type: "top-up",
      amount: 50000,
      note: "Monthly allowance",
    },
    {
      id: 2,
      date: "2023-05-14",
      time: "12:30:45",
      type: "purchase",
      amount: 15000,
      note: "Canteen purchase",
    },
    {
      id: 3,
      date: "2023-05-10",
      time: "08:45:12",
      type: "top-up",
      amount: 100000,
      note: "Monthly allowance",
    },
    {
      id: 4,
      date: "2023-05-08",
      time: "09:20:33",
      type: "purchase",
      amount: 8000,
      note: "Stationery purchase",
    },
    {
      id: 5,
      date: "2023-05-05",
      time: "11:05:27",
      type: "purchase",
      amount: 12000,
      note: "Canteen purchase",
    },
  ]

  // Quick amount options
  const quickAmounts = [
    { value: "10000", label: "Rp 10.000" },
    { value: "20000", label: "Rp 20.000" },
    { value: "50000", label: "Rp 50.000" },
    { value: "100000", label: "Rp 100.000" },
    { value: "200000", label: "Rp 200.000" },
    { value: "500000", label: "Rp 500.000" },
  ]

  // Handle authentication
  const handleAuthenticate = () => {
    // In a real app, this would verify against a database
    if (idInput.trim()) {
      setIsAuthenticated(true)
      setStudent(mockStudent)
    }
  }

  // Handle logout/reset
  const handleLogout = () => {
    setIsAuthenticated(false)
    setStudent(null)
    setIdInput("")
    setSelectedAmount("")
    setCustomAmount("")
  }

  // Handle amount selection
  const handleAmountSelect = (value: string) => {
    setSelectedAmount(value)
    setCustomAmount("")
  }

  // Handle custom amount change
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value)
    setSelectedAmount("")
  }

  // Handle top-up submission
  const handleTopUp = async () => {
    const amount = selectedAmount || customAmount
    if (!student || !amount) {
      setAlertMessage("Please select an amount to top up.")
      setShowFailureAlert(true)
      return
    }

    const numericAmount = Number.parseInt(amount)

    // Validate amount
    if (numericAmount <= 0) {
      setAlertMessage("Please enter a valid amount greater than 0.")
      setShowFailureAlert(true)
      return
    }

    if (numericAmount > 1000000) {
      setAlertMessage("Maximum top-up amount is Rp 1.000.000 per transaction.")
      setShowFailureAlert(true)
      return
    }

    setIsProcessing(true)

    try {
      // Simulate API call with random success/failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 90% success rate for demo purposes
          const isSuccess = Math.random() > 0.1
          if (isSuccess) {
            resolve(true)
          } else {
            reject(new Error("Network error or insufficient funds"))
          }
        }, 2000) // 2 second delay to simulate processing
      })

      // Success scenario
      const newBalance = student.balance + numericAmount
      setStudent({ ...student, balance: newBalance })
      setAlertMessage(
        `Top-up successful! Rp ${numericAmount.toLocaleString()} has been added to ${student.name}'s account. New balance: Rp ${newBalance.toLocaleString()}`,
      )
      setShowSuccessAlert(true)

      // Reset form
      setSelectedAmount("")
      setCustomAmount("")
    } catch (error) {
      // Failure scenario
      setAlertMessage(
        `Top-up failed for ${student.name}. ${error instanceof Error ? error.message : "Please try again or contact support."}`,
      )
      setShowFailureAlert(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSuccessAlertClose = () => {
    setShowSuccessAlert(false)
    setAlertMessage("")
  }

  const handleFailureAlertClose = () => {
    setShowFailureAlert(false)
    setAlertMessage("")
  }

  return (
    <SidebarProvider>
      <AppSidebar isLoggedIn={true} isAdmin={true} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-6" />
            <h1 className="text-lg font-semibold">Top Up</h1>
          </div>
          {isAuthenticated && student && (
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                  <AvatarFallback>{student?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{student.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6">
          {!isAuthenticated ? (
            // Authentication screen - full width with centered content
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
              <Card className="w-full max-w-lg">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Student Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="student-id" className="text-base">
                      Student ID (NIS/NISN)
                    </Label>
                    <div className="relative">
                      <CreditCardIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="student-id"
                        placeholder="Type or scan NFC card"
                        className="h-12 pl-10 text-lg"
                        value={idInput}
                        onChange={(e) => setIdInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAuthenticate()}
                        autoFocus
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Enter student ID manually or scan NFC card to automatically input ID
                    </p>
                  </div>
                  <Button className="w-full h-12 text-base" onClick={handleAuthenticate} disabled={!idInput.trim()}>
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Continue to Top Up
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Top-up screen (after authentication) - full width layout
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile section */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center text-center mb-6">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={student?.avatar || "/placeholder.svg"} alt={student?.name} />
                        <AvatarFallback className="text-2xl">{student?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-medium">{student?.name}</h3>
                      <p className="text-sm text-muted-foreground">NIS: {student?.nis}</p>
                      <p className="text-sm text-muted-foreground">NISN: {student?.nisn}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Wallet className="h-6 w-6" />
                        <span className="text-3xl font-bold">Rp {student?.balance.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top-up section */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Top Up</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {/* Custom amount */}
                      <div>
                        <p className="mb-3 font-medium text-lg">Custom Amount</p>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          className="h-12 text-lg"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          disabled={isProcessing}
                        />
                      </div>

                      {/* Quick amounts */}
                      <div>
                        <p className="mb-3 font-medium text-lg">Quick Amounts</p>
                        <RadioGroup
                          value={selectedAmount}
                          onValueChange={handleAmountSelect}
                          className="grid grid-cols-2 md:grid-cols-3 gap-4"
                          disabled={isProcessing}
                        >
                          {quickAmounts.map((amount) => (
                            <div key={amount.value} className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={amount.value}
                                id={`amount-${amount.value}`}
                                className="h-5 w-5"
                                disabled={isProcessing}
                              />
                              <Label
                                htmlFor={`amount-${amount.value}`}
                                className={`flex-1 cursor-pointer rounded-md border p-3 text-center hover:bg-accent text-base ${
                                  isProcessing ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                {amount.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Submit button */}
                      <Button
                        className="w-full h-12 text-base"
                        size="lg"
                        onClick={handleTopUp}
                        disabled={(!selectedAmount && !customAmount) || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing Top-up...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-5 w-5" />
                            Process Top-up
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction history for this specific student */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Transaction History</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative w-[250px]">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search transactions" className="pl-9" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="font-medium">{transaction.date}</div>
                            <div className="text-sm text-muted-foreground">{transaction.time}</div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                transaction.type === "top-up"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {transaction.type === "top-up" ? "Top-up" : "Purchase"}
                            </span>
                          </TableCell>
                          <TableCell className={transaction.type === "top-up" ? "text-green-600" : "text-blue-600"}>
                            {transaction.type === "top-up" ? "+" : "-"} Rp {transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{transaction.note}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </SidebarInset>

      {/* Success Alert Dialog */}
      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <AlertDialogTitle className="text-green-800">Top-up Successful!</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessAlertClose} className="bg-green-600 hover:bg-green-700">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Failure Alert Dialog */}
      <AlertDialog open={showFailureAlert} onOpenChange={setShowFailureAlert}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <AlertDialogTitle className="text-red-800">Top-up Failed</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleFailureAlertClose} className="bg-red-600 hover:bg-red-700">
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}

// Types
interface Student {
  id: number
  nis: string
  nisn: string
  name: string
  balance: number
  avatar: string
}
