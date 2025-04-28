"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence, LayoutGroup, useScroll, useSpring } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  DollarSign, Calendar, User, Search, ArrowRight, FileSpreadsheet, Loader2,
  Filter, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
// Import the history service
import historyService from "@/services/historyService"
import { toast } from "@/components/ui/use-toast"

// Define TypeScript interfaces for our transaction data
interface Customer {
  Nama: string;
  NFCId: string;
}

interface Product {
  ProductName: string;
  CategoryId: string;
}

interface Transaction {
  id: string;
  TransactionDate: string;
  customer: Customer;
  product: Product;
  TransactionType: string;
  Amount: number;
  Description: string;
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

const AnimatedButton = motion(Button)

function TransactionDetailsDialog({
  transaction,
  isOpen,
  onClose,
}: {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}) {
  // Format currency to IDR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
        <DialogHeader>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {transaction.TransactionType === 'purchase' ? 'Purchase Details' : 'Top-up Details'}
            </DialogTitle>
          </motion.div>
        </DialogHeader>
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
            <span className="text-gray-600 dark:text-gray-400">{transaction.id}</span>
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
              {format(new Date(transaction.TransactionDate), "dd MMM yyyy, HH:mm")}
            </span>
          </motion.div>
          <motion.div
            className="flex items-center space-x-2 text-sm"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <User className="h-5 w-5 text-primary" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Customer:</span>
            <span className="text-gray-600 dark:text-gray-400">{transaction.customer.Nama}</span>
          </motion.div>
          <motion.div
            className="flex items-center space-x-2 text-sm"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">NFC ID:</span>
            <span className="text-gray-600 dark:text-gray-400">{transaction.customer.NFCId}</span>
          </motion.div>
          <motion.div
            className="mt-6 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02, x: 10 }}
              className="flex justify-between text-sm bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm p-3 rounded-lg shadow-sm"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {transaction.product.ProductName}
              </span>
              <span className="text-gray-600 dark:text-gray-400">Category: {transaction.product.CategoryId}</span>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex items-center space-x-2 text-sm mt-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
            <span className="text-gray-600 dark:text-gray-400">{transaction.Description}</span>
          </motion.div>
          <motion.div
            className="mt-6 flex justify-between items-center p-4 bg-primary/10 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <span className="font-medium text-gray-700 dark:text-gray-300">Amount</span>
            <motion.span
              className={`text-xl font-bold ${transaction.TransactionType === 'purchase' ? 'text-red-600' : 'text-green-600'}`}
              whileHover={{ scale: 1.1 }}
            >
              {transaction.TransactionType === 'purchase' ? '-' : '+'}{formatCurrency(transaction.Amount)}
            </motion.span>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'TransactionDate',
    direction: 'desc'
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy, HH:mm");
  };

  // Format currency to IDR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Fetch transaction history data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await historyService.getAllHistory();
        if (!response) {
          throw new Error('Failed to fetch transaction history');
        }
        setTransactions(response);
        setFilteredTransactions(response);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load transaction history. Please try again later.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle search, filter and sort
  useEffect(() => {
    let result = [...transactions];
    
    // Filter by transaction type
    if (filterType !== 'all') {
      result = result.filter(item => item.TransactionType === filterType);
    }
    
    // Filter by month if selected
    if (selectedMonth !== null) {
      result = result.filter(item => {
        const transactionDate = new Date(item.TransactionDate);
        return transactionDate.getMonth() === selectedMonth;
      });
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.customer.Nama.toLowerCase().includes(query)) ||
        (item.product.ProductName.toLowerCase().includes(query)) ||
        (item.Description.toLowerCase().includes(query)) ||
        (item.TransactionType.toLowerCase().includes(query)) ||
        (item.id.toString().includes(query))
      );
    }

    // Sort the results
    if (sortConfig.key) {
      result.sort((a: any, b: any) => {
        // Handle nested properties
        let aValue, bValue;
        
        if (sortConfig.key.includes('.')) {
          const [parent, child] = sortConfig.key.split('.');
          aValue = a[parent][child];
          bValue = b[parent][child];
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }
        
        // Handle date comparison
        if (sortConfig.key === 'TransactionDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredTransactions(result);
  }, [searchQuery, filterType, selectedMonth, transactions, sortConfig]);

  // Request sort
  const requestSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="inline w-4 h-4 ml-1" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="inline w-4 h-4 ml-1" /> : 
      <ArrowDown className="inline w-4 h-4 ml-1" />;
  };

  // For toggle dropdown
  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  // For handling filter change
  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setShowFilterDropdown(false);
  };

  // For handling month filter change
  const handleMonthSelect = (month: number | null) => {
    setSelectedMonth(month === selectedMonth ? null : month);
  };

  // Export to Excel function
  const exportToExcel = () => {
    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredTransactions.map((transaction) => ({
          ID: transaction.id,
          Date: formatDate(transaction.TransactionDate),
          Customer: transaction.customer.Nama,
          NFC_ID: transaction.customer.NFCId,
          Product: transaction.product.ProductName,
          Category: transaction.product.CategoryId,
          Type: transaction.TransactionType === 'purchase' ? 'Purchase' : 'Top-up',
          Amount: `${transaction.TransactionType === 'purchase' ? '-' : '+'}${formatCurrency(transaction.Amount)}`,
          Description: transaction.Description
        })),
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

      // Convert the workbook to a binary string
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      // Create a Blob from the buffer
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "transaction_history.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Delete transaction handler
  const handleDeleteTransaction = async (id: string) => {
    try {
      await historyService.deleteHistory(id);
      setTransactions(transactions.filter(transaction => transaction.id !== id));
      toast({
        title: "Success",
        description: "Transaction record deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction record",
        variant: "destructive"
      });
    }
  };

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
              Transaction History
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
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <motion.div
                  className="relative flex-grow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary dark:text-primary" />
                  <Input
                    type="text"
                    placeholder="Search by customer, product, description or type..."
                    className="pl-10 w-full bg-white/50 dark:bg-gray-700/50 border-0 shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </motion.div>
                
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="flex items-center justify-between px-4 py-2 bg-white/50 dark:bg-gray-700/50 border-0 shadow-md w-full md:w-48"
                    onClick={toggleFilterDropdown}
                  >
                    <span className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      {filterType === 'all' ? 'All Transactions' :
                        filterType === 'purchase' ? 'Purchases Only' : 'Top-ups Only'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {showFilterDropdown && (
                    <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border rounded-lg mt-1 shadow-lg">
                      <ul>
                        <li
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${filterType === 'all' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}`}
                          onClick={() => handleFilterChange('all')}
                        >
                          All Transactions
                        </li>
                        <li
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${filterType === 'purchase' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}`}
                          onClick={() => handleFilterChange('purchase')}
                        >
                          Purchases Only
                        </li>
                        <li
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${filterType === 'topup' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}`}
                          onClick={() => handleFilterChange('topup')}
                        >
                          Top-ups Only
                        </li>
                      </ul>
                    </div>
                  )}
                </motion.div>
              </div>

              <motion.div
                className="flex justify-between items-center flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex flex-wrap gap-2">
                  <AnimatedButton
                    variant="outline"
                    onClick={() => handleMonthSelect(null)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border-2",
                      selectedMonth === null
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-primary/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm shadow-md",
                    )}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    All Months
                  </AnimatedButton>
                  {months.map((month, index) => (
                    <AnimatedButton
                      key={month}
                      variant={selectedMonth === index ? "default" : "outline"}
                      onClick={() => handleMonthSelect(index)}
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
                </div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <AnimatedButton
                    onClick={exportToExcel}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading || filteredTransactions.length === 0}
                  >
                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                    Export to Excel
                  </AnimatedButton>
                </motion.div>
              </motion.div>

              {/* Results count */}
              <motion.div 
                className="mb-4 text-sm text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </motion.div>
            </motion.div>

            {/* Transactions Table */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading transaction history...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 p-8">Error: {error}</div>
            ) : (
              <motion.div
                className="overflow-x-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-100 dark:bg-gray-700/70">
                    <tr>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer" 
                        onClick={() => requestSort('id')}
                      >
                        ID {getSortDirectionIndicator('id')}
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer" 
                        onClick={() => requestSort('TransactionDate')}
                      >
                        Date {getSortDirectionIndicator('TransactionDate')}
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer" 
                        onClick={() => requestSort('customer.Nama')}
                      >
                        Customer {getSortDirectionIndicator('customer.Nama')}
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer" 
                        onClick={() => requestSort('product.ProductName')}
                      >
                        Product {getSortDirectionIndicator('product.ProductName')}
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer" 
                        onClick={() => requestSort('TransactionType')}
                      >
                        Type {getSortDirectionIndicator('TransactionType')}
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer" 
                        onClick={() => requestSort('Amount')}
                      >
                        Amount {getSortDirectionIndicator('Amount')}
                      </th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600 dark:text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction, index) => (
                          <motion.tr 
                            key={transaction.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                            onClick={() => setSelectedTransaction(transaction)}
                            whileHover={{ y: -2, scale: 1.01 }}
                          >
                            <td className="py-3 px-4">{transaction.id}</td>
                            <td className="py-3 px-4">{formatDate(transaction.TransactionDate)}</td>
                            <td className="py-3 px-4">
                              <div>{transaction.customer.Nama}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.customer.NFCId}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div>{transaction.product.ProductName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Cat: {transaction.product.CategoryId}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.TransactionType === 'purchase' 
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {transaction.TransactionType === 'purchase' ? 'Purchase' : 'Top-up'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={transaction.TransactionType === 'purchase' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                                {transaction.TransactionType === 'purchase' ? '-' : '+'}{formatCurrency(transaction.Amount)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <ArrowRight className="w-5 h-5 text-primary" />
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-gray-500 dark:text-gray-400">
                            No transactions found matching your search criteria
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
        </div>
      </SidebarInset>
      {selectedTransaction && (
        <TransactionDetailsDialog
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </SidebarProvider>
  );
}