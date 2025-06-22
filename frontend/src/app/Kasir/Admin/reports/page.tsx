'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { TransactionSummaryTab } from '@/components/reports/transaction-summary-tab';
import { StudentBalancesTab } from '@/components/reports/student-balances-tab';
import { ProductAnalyticsTab } from '@/components/reports/product-analytics-tab';
import { DashboardOverview } from '@/components/reports/dashboard-overview';
import { Calendar, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Types
interface DashboardData {
  overview: {
    total_transactions: number;
    total_amount: number;
    average_transaction: number;
  };
  transactions: {
    summary: Record<string, { count: number; total_amount: number }>;
    recent_activity: Array<{
      id: number;
      type: string;
      customer_name: string;
      amount: number;
      time_ago: string;
    }>;
    hourly_pattern: Array<{ hour: number; transactions: number }>;
  };
  students: {
    total_students: number;
    total_balance: number;
    average_balance: number;
    students_with_balance: number;
    balance_distribution: Array<{ label: string; value: number }>;
  };
  products: {
    top_selling: Array<{
      product_name: string;
      total_sold: number;
    }>;
  };
  quick_stats: Array<{
    label: string;
    value: string | number;
    icon: string;
    color: string;
  }>;
}

interface TransactionSummaryData {
  overall_summary: {
    total_transactions: number;
    total_amount: number;
    average_per_transaction: number;
  };
  by_transaction_type: Record<
    string,
    {
      count: number;
      total_amount: number;
      average_amount: number;
    }
  >;
  daily_breakdown: Array<{
    date: string;
    transaction_count: number;
    total_amount: number;
  }>;
}

interface Student {
  id: number;
  NIS: string;
  NISN: string;
  Nama: string;
  username: string;
  Balance: number;
  is_active: boolean;
}

interface StudentBalancesData {
  students: Student[];
  statistics: {
    total_students: number;
    total_balance: number;
    average_balance: number;
    min_balance: number;
    max_balance: number;
  };
  balance_distribution: Array<{
    range: string;
    count: number;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface BestSellingProduct {
  product_id: number;
  product_name: string;
  category: string;
  current_price: number;
  current_stock: number;
  total_sold: number;
  transaction_count: number;
  total_revenue: number;
  average_per_transaction: number;
}

interface PopularCategory {
  category_id: number;
  category_name: string;
  total_items_sold: number;
  total_transactions: number;
  unique_products: number;
  total_revenue: number;
  average_per_transaction: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
  }>;
}

interface ProductAnalyticsData {
  bestSellingProducts: BestSellingProduct[];
  popularCategories: PopularCategory[];
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [transactionData, setTransactionData] =
    useState<TransactionSummaryData | null>(null);
  const [studentData, setStudentData] = useState<StudentBalancesData | null>(
    null
  );
  const [productData, setProductData] = useState<ProductAnalyticsData | null>(
    null
  );

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    fetchAllData();
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        dashboardRes,
        transactionRes,
        studentRes,
        productsRes,
        categoriesRes,
      ] = await Promise.all([
        fetchDashboardData(),
        fetchTransactionSummary(),
        fetchStudentBalances(),
        fetchBestSellingProducts(),
        fetchPopularCategories(),
      ]);

      setDashboardData(dashboardRes);
      setTransactionData(transactionRes);
      setStudentData(studentRes);
      setProductData({
        bestSellingProducts: productsRes,
        popularCategories: categoriesRes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // API Functions - Replace these URLs with your actual backend endpoints
  const fetchDashboardData = async (): Promise<DashboardData> => {
    const response = await fetch(
      `http://localhost:3001/report/dashboard?period=${period}`
    );
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  };

  const fetchTransactionSummary = async (): Promise<TransactionSummaryData> => {
    const response = await fetch(
      `http://localhost:3001/report/transaction-summary?period=${period}`
    );
    if (!response.ok) throw new Error('Failed to fetch transaction summary');
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  };

  const fetchStudentBalances = async (): Promise<StudentBalancesData> => {
    const response = await fetch(
      `http://localhost:3001/report/student-balances?sortBy=Balance&sortOrder=DESC&page=1&limit=50`
    );
    if (!response.ok) throw new Error('Failed to fetch student balances');
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  };

  const fetchBestSellingProducts = async (): Promise<BestSellingProduct[]> => {
    const params = new URLSearchParams({ limit: '20' });
    if (period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'today':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate', now.toISOString().split('T')[0]);
    }

    const response = await fetch(
      `http://localhost:3001/report/best-selling-products?${params}`
    );
    if (!response.ok) throw new Error('Failed to fetch best selling products');
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data.best_selling_products;
  };

  const fetchPopularCategories = async (): Promise<PopularCategory[]> => {
    const params = new URLSearchParams();
    if (period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'today':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate', now.toISOString().split('T')[0]);
    }

    const response = await fetch(
      `http://localhost:3001/report/popular-categories?${params}`
    );
    if (!response.ok) throw new Error('Failed to fetch popular categories');
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data.popular_categories;
  };

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar isLoggedIn={true} isAdmin={true} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-6"
              />
              <h1 className="text-lg font-semibold">Reports & Analytics</h1>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <p className="text-destructive mb-2">
                    Error loading reports data
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button onClick={fetchAllData} className="mt-4">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar isLoggedIn={true} isAdmin={true} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-6"
            />
            <h1 className="text-lg font-semibold">Reports & Analytics</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] h-8">
                <Calendar className="h-3.5 w-3.5 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline-block">Refresh</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleString('id-ID')}
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <DashboardOverview data={dashboardData} loading={loading} />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionSummaryTab data={transactionData} loading={loading} />
            </TabsContent>

            <TabsContent value="products">
              <ProductAnalyticsTab data={productData} loading={loading} />
            </TabsContent>

            <TabsContent value="students">
              <StudentBalancesTab
                data={studentData}
                loading={loading}
                onRefresh={fetchStudentBalances}
              />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
