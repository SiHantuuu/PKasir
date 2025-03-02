"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, TrendingDown, BarChartIcon, PieChartIcon, LineChartIcon } from "lucide-react"

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
  { name: "Litos", sales: 120, revenue: 2398000 },
  { name: "Floridina", sales: 98, revenue: 1960000 },
  { name: "Cimory UHT Fresh Milk", sales: 86, revenue: 1720000 },
  { name: "Gopek", sales: 65, revenue: 1300000 },
  { name: "Product 5", sales: 45, revenue: 900000 },
  { name: "Product 6", sales: 38, revenue: 760000 },
  { name: "Product 7", sales: 30, revenue: 600000 },
  { name: "Product 8", sales: 25, revenue: 500000 },
]

const categorySalesData = [
  { name: "Electronics", value: 45 },
  { name: "Clothing", value: 30 },
  { name: "Home", value: 25 },
]

const monthlySalesData = [
  { name: "Jan", sales: 65 },
  { name: "Feb", sales: 78 },
  { name: "Mar", sales: 90 },
  { name: "Apr", sales: 81 },
  { name: "May", sales: 95 },
  { name: "Jun", sales: 110 },
  { name: "Jul", sales: 120 },
  { name: "Aug", sales: 105 },
  { name: "Sep", sales: 90 },
  { name: "Oct", sales: 115 },
  { name: "Nov", sales: 125 },
  { name: "Dec", sales: 140 },
]

// Colors for the pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ProductAnalytics({ products }: ProductAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("best-sellers")
  const [timeRange, setTimeRange] = useState("month")
  const [animateCharts, setAnimateCharts] = useState(false)

  // Trigger animation when component mounts
  useEffect(() => {
    setAnimateCharts(true)
  }, [])

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Product Analytics
        </h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-md">
            <TabsTrigger
              value="best-sellers"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChartIcon className="w-4 h-4 mr-2" />
              Best Sellers
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LineChartIcon className="w-4 h-4 mr-2" />
              Sales Trends
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="best-sellers" className="mt-0">
              <motion.div
                key="best-sellers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center">
                      <BarChartIcon className="w-5 h-5 mr-2 text-primary" />
                      Top Selling Products
                    </CardTitle>
                    <CardDescription>Products with the highest sales volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={productSalesData.slice(0, 6)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="sales"
                            fill="var(--color-primary)"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                            animationBegin={animateCharts ? 0 : 9999}
                          >
                            {productSalesData.slice(0, 6).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center">
                      <PieChartIcon className="w-5 h-5 mr-2 text-primary" />
                      Sales by Category
                    </CardTitle>
                    <CardDescription>Distribution of sales across product categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySalesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            animationDuration={1500}
                            animationBegin={animateCharts ? 300 : 9999}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {categorySalesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="trends" className="mt-0">
              <motion.div
                key="trends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center">
                      <LineChartIcon className="w-5 h-5 mr-2 text-primary" />
                      Monthly Sales Trends
                    </CardTitle>
                    <CardDescription>Sales performance over the past year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySalesData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "white" }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            animationDuration={2000}
                            animationBegin={animateCharts ? 900 : 9999}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <TrendingUp className="w-10 h-10 text-green-500 mr-4" />
                        <div>
                          <h3 className="font-medium text-green-700 dark:text-green-400">Top Growth</h3>
                          <p className="text-green-600 dark:text-green-300 text-sm">Dec: +12% from previous month</p>
                        </div>
                      </div>

                      <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <TrendingDown className="w-10 h-10 text-red-500 mr-4" />
                        <div>
                          <h3 className="font-medium text-red-700 dark:text-red-400">Lowest Performance</h3>
                          <p className="text-red-600 dark:text-red-300 text-sm">Jan: -10% from previous month</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

