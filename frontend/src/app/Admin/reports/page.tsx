"use client"

import type React from "react"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Upload } from "lucide-react"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react" // Import Loader2

// Mock data for charts with better formatting
const salesTrendData = [
  { date: "01", sales: 2400000, day: "Day 1" },
  { date: "02", sales: 1398000, day: "Day 2" },
  { date: "03", sales: 9800000, day: "Day 3" },
  { date: "04", sales: 3908000, day: "Day 4" },
  { date: "05", sales: 4800000, day: "Day 5" },
  { date: "06", sales: 3800000, day: "Day 6" },
  { date: "07", sales: 4300000, day: "Day 7" },
  { date: "08", sales: 5200000, day: "Day 8" },
  { date: "09", sales: 4100000, day: "Day 9" },
  { date: "10", sales: 6200000, day: "Day 10" },
  { date: "11", sales: 5800000, day: "Day 11" },
  { date: "12", sales: 7200000, day: "Day 12" },
  { date: "13", sales: 6800000, day: "Day 13" },
  { date: "14", sales: 5900000, day: "Day 14" },
  { date: "15", sales: 8100000, day: "Day 15" },
]

const salesByCategoryData = [
  { category: "Makanan", sales: 45231890, percentage: 45, fill: "#3b82f6" },
  { category: "Minuman", sales: 28456123, percentage: 28, fill: "#10b981" },
  { category: "Alat Tulis", sales: 15789456, percentage: 16, fill: "#f59e0b" },
  { category: "Snack", sales: 12345678, percentage: 11, fill: "#ef4444" },
]

const topupAnalyticsData = [
  { month: "Jan", amount: 125000000, transactions: 450 },
  { month: "Feb", amount: 98000000, transactions: 380 },
  { month: "Mar", amount: 156000000, transactions: 520 },
  { month: "Apr", amount: 142000000, transactions: 490 },
  { month: "May", amount: 178000000, transactions: 580 },
  { month: "Jun", amount: 165000000, transactions: 550 },
]

const productAnalyticsData = [
  { product: "Nasi Goreng", sold: 245, revenue: 3675000 },
  { product: "Es Teh", sold: 189, revenue: 945000 },
  { product: "Buku Tulis", sold: 156, revenue: 1092000 },
  { product: "Roti", sold: 134, revenue: 1072000 },
  { product: "Pensil 2B", sold: 98, revenue: 294000 },
  { product: "Air Mineral", sold: 87, revenue: 348000 },
]

const studentAnalyticsData = [
  { generation: "2024", students: 320, avgBalance: 185000, totalSpent: 45000000 },
  { generation: "2023", students: 298, avgBalance: 165000, totalSpent: 52000000 },
  { generation: "2022", students: 275, avgBalance: 145000, totalSpent: 48000000 },
  { generation: "2021", students: 245, avgBalance: 125000, totalSpent: 38000000 },
]

const chartConfig = {
  sales: {
    label: "Sales",
    color: "#3b82f6",
  },
  amount: {
    label: "Amount",
    color: "#10b981",
  },
  transactions: {
    label: "Transactions",
    color: "#8b5cf6",
  },
  revenue: {
    label: "Revenue",
    color: "#f59e0b",
  },
  students: {
    label: "Students",
    color: "#06b6d4",
  },
  totalSpent: {
    label: "Total Spent",
    color: "#ef4444",
  },
} satisfies ChartConfig

// Custom tooltip formatter
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()

  const generateReportData = () => {
    const currentDate = new Date().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Calculate summary statistics
    const totalSales = salesTrendData.reduce((sum, item) => sum + item.sales, 0)
    const totalTopups = topupAnalyticsData.reduce((sum, item) => sum + item.amount, 0)
    const totalTransactions = topupAnalyticsData.reduce((sum, item) => sum + item.transactions, 0)
    const totalStudents = studentAnalyticsData.reduce((sum, item) => sum + item.students, 0)
    const totalProductRevenue = productAnalyticsData.reduce((sum, item) => sum + item.revenue, 0)

    return {
      metadata: {
        title: "PKasir Analytics Report",
        generatedDate: currentDate,
        reportPeriod: "Current Month",
        generatedBy: "Admin",
      },
      summary: {
        totalSales: formatCurrency(totalSales),
        totalTopups: formatCurrency(totalTopups),
        totalTransactions,
        totalStudents,
        totalProductRevenue: formatCurrency(totalProductRevenue),
        averageSalePerDay: formatCurrency(totalSales / salesTrendData.length),
        averageTopupPerTransaction: formatCurrency(totalTopups / totalTransactions),
      },
      salesTrend: salesTrendData,
      salesByCategory: salesByCategoryData,
      topupAnalytics: topupAnalyticsData,
      productAnalytics: productAnalyticsData,
      studentAnalytics: studentAnalyticsData,
    }
  }

  const exportToCSV = (data: any) => {
    let csvContent = ""

    // Add metadata
    csvContent += `PKasir Analytics Report\n`
    csvContent += `Generated: ${data.metadata.generatedDate}\n`
    csvContent += `Period: ${data.metadata.reportPeriod}\n`
    csvContent += `Generated By: ${data.metadata.generatedBy}\n\n`

    // Add summary section
    csvContent += `EXECUTIVE SUMMARY\n`
    csvContent += `Metric,Value\n`
    csvContent += `Total Sales,${data.summary.totalSales}\n`
    csvContent += `Total Top-ups,${data.summary.totalTopups}\n`
    csvContent += `Total Transactions,${data.summary.totalTransactions}\n`
    csvContent += `Total Students,${data.summary.totalStudents}\n`
    csvContent += `Total Product Revenue,${data.summary.totalProductRevenue}\n`
    csvContent += `Average Sale Per Day,${data.summary.averageSalePerDay}\n`
    csvContent += `Average Top-up Per Transaction,${data.summary.averageTopupPerTransaction}\n\n`

    // Add sales trend data
    csvContent += `DAILY SALES TREND\n`
    csvContent += `Day,Sales Amount\n`
    data.salesTrend.forEach((item: any) => {
      csvContent += `${item.day},${formatCurrency(item.sales)}\n`
    })
    csvContent += `\n`

    // Add sales by category
    csvContent += `SALES BY CATEGORY\n`
    csvContent += `Category,Sales Amount,Percentage\n`
    data.salesByCategory.forEach((item: any) => {
      csvContent += `${item.category},${formatCurrency(item.sales)},${item.percentage}%\n`
    })
    csvContent += `\n`

    // Add top-up analytics
    csvContent += `TOP-UP ANALYTICS\n`
    csvContent += `Month,Amount,Transactions\n`
    data.topupAnalytics.forEach((item: any) => {
      csvContent += `${item.month},${formatCurrency(item.amount)},${item.transactions}\n`
    })
    csvContent += `\n`

    // Add product analytics
    csvContent += `PRODUCT PERFORMANCE\n`
    csvContent += `Product,Units Sold,Revenue\n`
    data.productAnalytics.forEach((item: any) => {
      csvContent += `${item.product},${item.sold},${formatCurrency(item.revenue)}\n`
    })
    csvContent += `\n`

    // Add student analytics
    csvContent += `STUDENT ANALYTICS BY GENERATION\n`
    csvContent += `Generation,Students,Average Balance,Total Spent\n`
    data.studentAnalytics.forEach((item: any) => {
      csvContent += `${item.generation},${item.students},${formatCurrency(item.avgBalance)},${formatCurrency(item.totalSpent)}\n`
    })

    return csvContent
  }

  const exportToJSON = (data: any) => {
    return JSON.stringify(data, null, 2)
  }

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (fileExtension !== "csv" && fileExtension !== "json") {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a CSV or JSON file.",
      })
      return
    }

    handleImport(file, fileExtension as "csv" | "json")
  }

  const handleImport = async (file: File, format: "csv" | "json") => {
    setIsImporting(true)

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const fileContent = await file.text()

      if (format === "json") {
        // Validate JSON format
        try {
          const jsonData = JSON.parse(fileContent)
          console.log("Imported JSON data:", jsonData)
        } catch (error) {
          throw new Error("Invalid JSON format")
        }
      } else {
        // Basic CSV validation
        if (!fileContent.includes("PKasir Analytics Report")) {
          throw new Error("Invalid CSV format - not a PKasir report")
        }
        console.log("Imported CSV data:", fileContent)
      }

      // Show success toast
      toast({
        variant: "success",
        title: "Import Successful",
        description: `Report imported successfully from ${format.toUpperCase()}! Data has been processed.`,
      })

      // Reset file input
      const fileInput = document.getElementById("file-import") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Import failed:", error)
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import report. Please check the file format.",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async (format: "csv" | "json" = "csv") => {
    setIsExporting(true)

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const reportData = generateReportData()
      const timestamp = new Date().toISOString().split("T")[0]

      if (format === "csv") {
        const csvContent = exportToCSV(reportData)
        downloadFile(csvContent, `pkasir-report-${timestamp}.csv`, "text/csv;charset=utf-8;")
      } else {
        const jsonContent = exportToJSON(reportData)
        downloadFile(jsonContent, `pkasir-report-${timestamp}.json`, "application/json;charset=utf-8;")
      }

      // Show success toast
      toast({
        variant: "success",
        title: "Export Successful",
        description: `Report exported successfully as ${format.toUpperCase()}!`,
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar isLoggedIn={true} isAdmin={true} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-6" />
            <h1 className="text-lg font-semibold">Reports & Analytics</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input id="file-import" type="file" accept=".csv,.json" onChange={handleFileImport} className="hidden" />
            <Button
              variant="secondary"
              size="sm"
              className="h-8 gap-1"
              onClick={() => document.getElementById("file-import")?.click()}
              disabled={isImporting}
            >
              {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline-block">{isImporting ? "Importing..." : "Import"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => handleExport("json")}
              disabled={isExporting || isImporting}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Export JSON</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-1"
              onClick={() => handleExport("csv")}
              disabled={isExporting || isImporting}
            >
              {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline-block">{isExporting ? "Exporting..." : "Export CSV"}</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="sales" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="topup">Top-up</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp 12,345,678</div>
                    <p className="text-xs text-green-600">+20.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-green-600">+15% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Average Sale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp 10,005</div>
                    <p className="text-xs text-green-600">+5% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">987</div>
                    <p className="text-xs text-blue-600">78% of total students</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sales Trend</CardTitle>
                    <CardDescription>Daily sales performance over the last 15 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <LineChart data={salesTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          tickFormatter={formatNumber}
                        />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-3 shadow-md">
                                  <p className="font-medium">{`Day ${label}`}</p>
                                  <p className="text-blue-600">Sales: {formatCurrency(payload[0].value as number)}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Line
                          dataKey="sales"
                          type="monotone"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sales by Category</CardTitle>
                    <CardDescription>Revenue distribution across product categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <Pie
                          data={salesByCategoryData}
                          dataKey="sales"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          paddingAngle={2}
                        >
                          {salesByCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="rounded-lg border bg-background p-3 shadow-md">
                                  <p className="font-medium">{data.category}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatCurrency(data.sales)} ({data.percentage}%)
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ChartContainer>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {salesByCategoryData.map((item) => (
                        <div key={item.category} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="text-sm text-muted-foreground">{item.category}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="topup" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Top-ups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp 864,000,000</div>
                    <p className="text-xs text-green-600">+12.5% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2,970</div>
                    <p className="text-xs text-green-600">+8.2% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Average Top-up</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp 290,909</div>
                    <p className="text-xs text-green-600">+3.8% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,138</div>
                    <p className="text-xs text-blue-600">91% of total students</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top-up Analytics</CardTitle>
                  <CardDescription>Monthly top-up trends and transaction volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <BarChart data={topupAnalyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickFormatter={formatNumber}
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-3 shadow-md">
                                <p className="font-medium">{label}</p>
                                <p className="text-green-600">Amount: {formatCurrency(payload[0].value as number)}</p>
                                <p className="text-purple-600">Transactions: {payload[0].payload.transactions}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">245</div>
                    <p className="text-xs text-green-600">+12 new products added</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Best Seller</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Nasi Goreng</div>
                    <p className="text-xs text-blue-600">245 units sold this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp 7,426,000</div>
                    <p className="text-xs text-green-600">From top 6 products</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-orange-600">Items need restocking</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Performance</CardTitle>
                  <CardDescription>Revenue generated by top-selling products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <BarChart
                      data={productAnalyticsData}
                      layout="horizontal"
                      margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                    >
                      <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickFormatter={formatNumber}
                      />
                      <YAxis
                        dataKey="product"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        width={90}
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="rounded-lg border bg-background p-3 shadow-md">
                                <p className="font-medium">{label}</p>
                                <p className="text-amber-600">Revenue: {formatCurrency(data.revenue)}</p>
                                <p className="text-blue-600">Units Sold: {data.sold}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={40} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,138</div>
                    <p className="text-xs text-blue-600">Across all generations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Average Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp 155,000</div>
                    <p className="text-xs text-green-600">Per student account</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp 183,000,000</div>
                    <p className="text-xs text-red-600">This month across all students</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">87%</div>
                    <p className="text-xs text-green-600">Students with recent activity</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Student Spending by Generation</CardTitle>
                  <CardDescription>Total spending patterns across different student generations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <AreaChart data={studentAnalyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <XAxis
                        dataKey="generation"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickFormatter={formatNumber}
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="rounded-lg border bg-background p-3 shadow-md">
                                <p className="font-medium">Generation {label}</p>
                                <p className="text-cyan-600">Students: {data.students}</p>
                                <p className="text-red-600">Total Spent: {formatCurrency(data.totalSpent)}</p>
                                <p className="text-green-600">Avg Balance: {formatCurrency(data.avgBalance)}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Area
                        dataKey="totalSpent"
                        type="monotone"
                        fill="#ef4444"
                        fillOpacity={0.2}
                        stroke="#ef4444"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
