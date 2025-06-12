'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpRight,
  DollarSign,
  Download,
  Package,
  Search,
  Users,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RecentTransactions } from '@/components/recent-transactions';
import { TopProducts } from '@/components/top-products';
import { RecentStudents } from '@/components/recent-students';
import { TransactionChart } from '@/components/transaction-chart';
import { StudentsTable } from '@/components/students-table';
import { ProductsTable } from '@/components/products-table';
import { TransactionsTable } from '@/components/transactions-table';

// Types
interface DashboardData {
  total_students: number;
  total_balance: number;
  total_transactions: number;
  today_transactions: number;
  total_revenue: number;
}

interface Transaction {
  id: number;
  Transaction_type: string;
  total_amount: number;
  createdAt: string;
  status: string;
  customer: {
    Nama: string;
    NIS: string;
  };
}

interface Student {
  id: number;
  NIS: string;
  NISN: string;
  Nama: string;
  username: string;
  Balance: number;
  is_active: boolean;
  createdAt: string;
}

interface Product {
  id: number;
  Nama: string;
  Harga: number;
  Stok: number;
  category?: {
    Nama: string;
  };
}

interface BestSellingProduct {
  product_id: number;
  product_name: string;
  category: string;
  total_sold: number;
  total_revenue: number;
}

// Add new interface for transaction summary
interface TransactionSummary {
  by_transaction_type: {
    [key: string]: {
      count: number;
      total_amount: number;
      average_amount: number;
    };
  };
  daily_breakdown: Array<{
    date: string;
    transaction_count: number;
    total_amount: number;
  }>;
}

export default function AdminDashboard() {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [topProducts, setTopProducts] = useState<BestSellingProduct[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Add new state for transaction summary
  const [transactionSummary, setTransactionSummary] =
    useState<TransactionSummary | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);

  // API Base URL - adjust according to your backend
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch dashboard analytics
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/report/dashboard?period=today`
      );
      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const result = await response.json();
      if (result.success) {
        const data = result.data;
        setDashboardData({
          total_students: data.students.total_students,
          total_balance: data.students.total_balance,
          total_transactions: data.overview.total_transactions,
          today_transactions: data.transactions.summary.purchase?.count || 0,
          total_revenue: data.transactions.summary.purchase?.total_amount || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  };

  // Add new function to fetch transaction summary
  const fetchTransactionSummary = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/report/transaction-summary?period=all`
      );
      if (!response.ok) throw new Error('Failed to fetch transaction summary');

      const result = await response.json();
      if (result.success) {
        setTransactionSummary(result.data);
      }
    } catch (err) {
      console.error('Error fetching transaction summary:', err);
    }
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/transactions?limit=10&sortOrder=DESC`
      );
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const result = await response.json();
      if (result.success) {
        setRecentTransactions(result.data.transactions);
      }
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
    }
  };

  // Fetch recent students
  const fetchRecentStudents = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/siswa?limit=10&sortBy=createdAt&sortOrder=DESC`
      );
      if (!response.ok) throw new Error('Failed to fetch students');

      const result = await response.json();
      if (result.success) {
        setRecentStudents(result.data.siswa);
      }
    } catch (err) {
      console.error('Error fetching recent students:', err);
    }
  };

  // Fetch top products
  const fetchTopProducts = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reports/best-selling-products?limit=5`
      );
      if (!response.ok) throw new Error('Failed to fetch top products');

      const result = await response.json();
      if (result.success) {
        setTopProducts(result.data.best_selling_products);
      }
    } catch (err) {
      console.error('Error fetching top products:', err);
    }
  };

  // Fetch all students for students tab
  const fetchAllStudents = async () => {
    setStudentsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/siswa?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch all students');

      const result = await response.json();
      if (result.success) {
        setAllStudents(result.data.siswa);
      }
    } catch (err) {
      console.error('Error fetching all students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch all products for products tab
  const fetchAllProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch all products');

      const result = await response.json();
      if (result.success) {
        setAllProducts(result.data.products);
      }
    } catch (err) {
      console.error('Error fetching all products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch all transactions for transactions tab
  const fetchAllTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transactions?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch all transactions');

      const result = await response.json();
      if (result.success) {
        setAllTransactions(result.data.transactions);
      }
    } catch (err) {
      console.error('Error fetching all transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchRecentTransactions(),
        fetchRecentStudents(),
        fetchTopProducts(),
        fetchTransactionSummary(), // Add this line
      ]);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Handle tab changes to load data on demand
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'students':
        if (allStudents.length === 0) {
          fetchAllStudents();
        }
        break;
      case 'products':
        if (allProducts.length === 0) {
          fetchAllProducts();
        }
        break;
      case 'transactions':
        if (allTransactions.length === 0) {
          fetchAllTransactions();
        }
        break;
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar isLoggedIn={true} isAdmin={true} />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading dashboard...</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar isLoggedIn={true} isAdmin={true} />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
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
            <h1 className="text-lg font-semibold">PKasir Admin Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-full md:w-64 lg:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-64 lg:w-80"
              />
            </div>
            <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Export</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Tabs
            defaultValue="overview"
            className="space-y-4"
            onValueChange={handleTabChange}
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Balance
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      Rp{' '}
                      {dashboardData?.total_balance?.toLocaleString('id-ID') ||
                        '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total saldo semua siswa
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Students
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData?.total_students || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Siswa terdaftar
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Products
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allProducts.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Produk tersedia
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Today's Transactions
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData?.today_transactions || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Transaksi hari ini
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Transaction Overview</CardTitle>
                    <CardDescription>
                      Transaction summary by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {/* Pass the transaction summary data instead of recent transactions */}
                    <TransactionChart data={transactionSummary} />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                      Latest student transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentTransactions transactions={recentTransactions} />
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Students</CardTitle>
                    <CardDescription>
                      Recently registered students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentStudents students={recentStudents} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>
                      Most popular products by sales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TopProducts products={topProducts} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>
                    Manage student accounts, balances, and NFC cards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading students...
                    </div>
                  ) : (
                    <StudentsTable students={allStudents} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>
                    Manage products, categories, and inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading products...
                    </div>
                  ) : (
                    <ProductsTable products={allProducts} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    View and manage all transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading transactions...
                    </div>
                  ) : (
                    <TransactionsTable transactions={allTransactions} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
