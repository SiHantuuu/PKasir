"use client"

import { useState, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Download, Eye, Search, ShoppingCart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Transaction {
  id: number
  student_name: string
  student_nis: string
  type: string
  amount: number
  date: string
  time: string
  note: string
}

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filterType, setFilterType] = useState<string>("all")

  // Mock data for transactions
  const transactions = [
    {
      id: 1,
      student_name: "Ahmad Rizky",
      student_nis: "2023001",
      type: "purchase",
      amount: 25000,
      date: "2023-05-15",
      time: "10:15:23",
      note: "Canteen purchase",
    },
    {
      id: 2,
      student_name: "Siti Nuraini",
      student_nis: "2023002",
      type: "topup",
      amount: 50000,
      date: "2023-05-15",
      time: "09:45:12",
      note: "Monthly allowance",
    },
    {
      id: 3,
      student_name: "Budi Santoso",
      student_nis: "2023003",
      type: "purchase",
      amount: 15000,
      date: "2023-05-15",
      time: "09:30:45",
      note: "Stationery purchase",
    },
    {
      id: 4,
      student_name: "Dewi Lestari",
      student_nis: "2023004",
      type: "topup",
      amount: 100000,
      date: "2023-05-15",
      time: "09:15:33",
      note: "Monthly allowance",
    },
    {
      id: 5,
      student_name: "Eko Prasetyo",
      student_nis: "2023005",
      type: "purchase",
      amount: 10000,
      date: "2023-05-15",
      time: "08:55:21",
      note: "Canteen purchase",
    },
    {
      id: 6,
      student_name: "Fitri Handayani",
      student_nis: "2023006",
      type: "purchase",
      amount: 8000,
      date: "2023-05-15",
      time: "08:45:17",
      note: "Canteen purchase",
    },
    {
      id: 7,
      student_name: "Gunawan Wibowo",
      student_nis: "2023007",
      type: "topup",
      amount: 75000,
      date: "2023-05-15",
      time: "08:30:09",
      note: "Monthly allowance",
    },
    {
      id: 8,
      student_name: "Hani Susanti",
      student_nis: "2023008",
      type: "purchase",
      amount: 12000,
      date: "2023-05-15",
      time: "08:15:42",
      note: "Stationery purchase",
    },
    {
      id: 9,
      student_name: "Irfan Hakim",
      student_nis: "2023009",
      type: "purchase",
      amount: 5000,
      date: "2023-05-15",
      time: "08:05:31",
      note: "Canteen purchase",
    },
    {
      id: 10,
      student_name: "Juwita Sari",
      student_nis: "2023010",
      type: "topup",
      amount: 50000,
      date: "2023-05-15",
      time: "07:55:19",
      note: "Monthly allowance",
    },
  ]

  // Filtered transactions based on search query and filter type
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Filter by type if not "all"
    if (filterType !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === filterType)
    }

    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (transaction) =>
          transaction.student_name.toLowerCase().includes(query) ||
          transaction.student_nis.toLowerCase().includes(query) ||
          transaction.note.toLowerCase().includes(query) ||
          transaction.id.toString().includes(query) ||
          transaction.amount.toString().includes(query) ||
          transaction.date.includes(query) ||
          transaction.time.includes(query),
      )
    }

    return filtered
  }, [transactions, searchQuery, filterType])

  const handleExport = () => {
    // Create CSV content from filtered transactions
    const headers = ["ID", "Student Name", "Student NIS", "Type", "Amount", "Date", "Time", "Note"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((transaction) =>
        [
          transaction.id,
          `"${transaction.student_name}"`,
          transaction.student_nis,
          transaction.type,
          transaction.amount,
          transaction.date,
          transaction.time,
          `"${transaction.note}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsViewDetailsOpen(true)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }


  return (
    <SidebarProvider>
      <AppSidebar isLoggedIn={true} isAdmin={true} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-6" />
            <h1 className="text-lg font-semibold">Transaction History</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-full md:w-64 lg:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="w-full rounded-lg bg-background pl-8 md:w-64 lg:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Clear
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Export</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="purchase">Purchases Only</SelectItem>
                  <SelectItem value="topup">Top-ups Only</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || filterType !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterType("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                View and manage all transactions
                {filteredTransactions.length !== transactions.length && (
                  <span className="ml-2 text-sm">
                    (Filtered: {filteredTransactions.length} of {transactions.length})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No transactions found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {searchQuery || filterType !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "No transactions have been recorded yet"}
                  </p>
                  {(searchQuery || filterType !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("")
                        setFilterType("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.student_name}</div>
                          <div className="text-sm text-muted-foreground">{transaction.student_nis}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {transaction.type === "purchase" ? (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4 text-red-500" />
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                  Purchase
                                </span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                  Top Up
                                </span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={transaction.type === "purchase" ? "text-red-500" : "text-green-500"}>
                          {transaction.type === "purchase" ? "-" : "+"} Rp {transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div>{transaction.date}</div>
                          <div className="text-sm text-muted-foreground">{transaction.time}</div>
                        </TableCell>
                        <TableCell>{transaction.note}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(transaction)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {filteredTransactions.length > 0 && (
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="px-4">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      {/* Transaction Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Detailed information about transaction #{selectedTransaction?.id}</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="text-base">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <div className="flex items-center mt-1">
                    {selectedTransaction.type === "purchase" ? (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4 text-red-500" />
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Purchase
                        </span>
                      </>
                    ) : (
                      <>
                      
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                  <p className="text-base">{selectedTransaction.student_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student NIS</p>
                  <p className="text-base">{selectedTransaction.student_nis}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-base">{selectedTransaction.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="text-base">{selectedTransaction.time}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p
                  className={`text-xl font-bold ${
                    selectedTransaction.type === "purchase" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {selectedTransaction.type === "purchase" ? "-" : "+"} Rp {selectedTransaction.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Note</p>
                <p className="text-base">{selectedTransaction.note}</p>
              </div>

              {/* Additional details could be added here */}
              <div className="border-t pt-4 mt-2">
                <p className="text-sm text-muted-foreground">
                  This transaction was processed on {selectedTransaction.date} at {selectedTransaction.time}.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
