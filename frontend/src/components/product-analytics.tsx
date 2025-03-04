"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, ArrowUpDown, BarChart, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
}

interface ProductAnalyticsProps {
  products: Product[]
}

// Sample data for product analytics
const productSalesData = [
  { name: "Litos", monthlyData: generateMonthlyData() },
  { name: "Floridina", monthlyData: generateMonthlyData() },
  { name: "Cimory UHT Fresh Milk", monthlyData: generateMonthlyData() },
  { name: "Gopek", monthlyData: generateMonthlyData() },
  { name: "Product 5", monthlyData: generateMonthlyData() },
  { name: "Product 6", monthlyData: generateMonthlyData() },
  { name: "Product 7", monthlyData: generateMonthlyData() },
  { name: "Product 8", monthlyData: generateMonthlyData() },
  { name: "Product 9", monthlyData: generateMonthlyData() },
  { name: "Product 10", monthlyData: generateMonthlyData() },
]

function generateMonthlyData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months.map((month) => ({
    month,
    sales: Math.floor(Math.random() * 100) + 1,
    revenue: Math.floor(Math.random() * 2000000) + 100000,
  }))
}

export default function ProductAnalytics({ products }: ProductAnalyticsProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value)
  }

  const sortedProducts = useMemo(() => {
    const sortableProducts = productSalesData.map((product) => ({
      ...product,
      totalSales: product.monthlyData.reduce((sum, month) => sum + month.sales, 0),
      totalRevenue: product.monthlyData.reduce((sum, month) => sum + month.revenue, 0),
    }))

    if (!sortConfig) return sortableProducts

    return [...sortableProducts].sort((a, b) => {
      if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }, [sortConfig])

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
  }

  // Get top 3 products by sales
  const topProducts = useMemo(() => {
    return [...sortedProducts]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 3)
      .map((product, index) => ({
        ...product,
        color: index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-amber-700",
      }))
  }, [sortedProducts])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
      },
    }),
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* Top Products Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topProducts.map((product, index) => (
          <motion.div
            key={product.name}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => handleProductClick(product)}
            className="cursor-pointer"
          >
            <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", product.color)}
                  >
                    {index + 1}
                  </div>
                  <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}>
                    {index === 0 ? (
                      <TrendingUp className="h-5 w-5 text-amber-500" />
                    ) : (
                      <BarChart className="h-5 w-5 text-gray-500" />
                    )}
                  </motion.div>
                </div>
                <h3 className="font-medium text-lg mb-1 truncate">{product.name}</h3>
                <div className="mt-auto space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Sales</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {product.totalSales} units
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Revenue</div>
                  <div className="text-lg font-semibold">{formatCurrency(product.totalRevenue)}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Products Table */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
              Products Performance
            </CardTitle>
            <CardDescription>Complete list of products and their sales data</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort("name")} className="hover:bg-transparent">
                      Product Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => requestSort("totalSales")} className="hover:bg-transparent">
                      Quantity Sold
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("totalRevenue")}
                      className="hover:bg-transparent"
                    >
                      Total Revenue
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {sortedProducts.map((product, index) => (
                    <motion.tr
                      key={product.name}
                      custom={index}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 20 }}
                      onClick={() => handleProductClick(product)}
                      onMouseEnter={() => setHoveredRow(product.name)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={cn(
                        "cursor-pointer transition-colors duration-200",
                        hoveredRow === product.name ? "bg-gray-100 dark:bg-gray-700" : "",
                      )}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <motion.div
                            animate={hoveredRow === product.name ? { x: 5 } : { x: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            {product.name}
                          </motion.div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <motion.div
                          animate={hoveredRow === product.name ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          {product.totalSales} units
                        </motion.div>
                      </TableCell>
                      <TableCell className="text-center">
                        <motion.div
                          animate={hoveredRow === product.name ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                        >
                          {formatCurrency(product.totalRevenue)}
                        </motion.div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-[625px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-0 shadow-lg max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {selectedProduct?.name} - Performance Details
              </DialogTitle>
            </motion.div>
          </DialogHeader>
          <Separator className="my-4" />
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-6 overflow-y-auto pr-2 scroll-smooth" // Added scroll-smooth
              style={{ maxHeight: "calc(80vh - 120px)" }} // Adjust for header height
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    },
                  }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="grid grid-cols-2 gap-6"
                  >
                    <Card className="border-0 shadow-md bg-white/50 dark:bg-gray-700/50">
                      <CardContent className="p-6 flex flex-col items-center justify-center">
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2"
                        >
                          <ShoppingCart className="h-6 w-6 text-primary" />
                        </motion.div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                        <p className="text-3xl font-bold">{selectedProduct.totalSales}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">units</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-white/50 dark:bg-gray-700/50">
                      <CardContent className="p-6 flex flex-col items-center justify-center">
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2"
                        >
                          <DollarSign className="h-6 w-6 text-primary" />
                        </motion.div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          {formatCurrency(selectedProduct.totalRevenue)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-3">Monthly Performance</h3>
                    <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead className="text-center">Sales</TableHead>
                            <TableHead className="text-center">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProduct.monthlyData.map((data: any, index: number) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + index * 0.03 }}
                              whileHover={{
                                scale: 1.01,
                                backgroundColor: "rgba(var(--primary), 0.05)",
                                transition: { duration: 0.2 },
                              }}
                              className="hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                            >
                              <TableCell>
                                <motion.span
                                  whileHover={{ x: 5 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                  {data.month}
                                </motion.span>
                              </TableCell>
                              <TableCell className="text-center">
                                <motion.span
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                  {data.sales} units
                                </motion.span>
                              </TableCell>
                              <TableCell className="text-center">
                                <motion.span
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  className="font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                                >
                                  {formatCurrency(data.revenue)}
                                </motion.span>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
      <style jsx global>{`
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  .dark .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
  }
`}</style>
    </motion.div>
  )
}

