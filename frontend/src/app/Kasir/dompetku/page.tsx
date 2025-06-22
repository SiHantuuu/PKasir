'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CreditCard,
  KeyRound,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Badge } from '@/components/ui/badge';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Student {
  id: number;
  NIS: string;
  NISN?: string;
  username: string;
  Nama: string;
  Gen?: number;
  Balance: number;
  email?: string;
  NFC_id?: string;
  role?: {
    name: string;
  };
}

interface TransactionDetail {
  product_id: number;
  product_name: string;
  amount: number;
  price: number;
}

interface Transaction {
  id: number;
  Transaction_type: string;
  total_amount: number;
  Note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  details?: {
    Product_id: number;
    amount: number;
    product: {
      id: number;
      Nama: string;
      Harga: number;
    };
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface LoginResponse {
  user: Student;
  token: string;
}

interface TransactionsResponse {
  student: {
    id: number;
    nama: string;
    nis: string;
    nisn: string;
    balance: number;
  };
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function Dompetku() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<Student | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(
    null
  );
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = sessionStorage.getItem('dompetku_user');
    const storedToken = sessionStorage.getItem('dompetku_token');

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setToken(storedToken);
      setIsLoggedIn(true);
      fetchTransactions(userData.id, storedToken);
    }
  }, []);

  useEffect(() => {
    // Filter transactions based on active tab
    if (activeTab === 'all') {
      setFilteredTransactions(transactions);
    } else {
      const filterType =
        activeTab === 'topup'
          ? 'topup'
          : activeTab === 'purchase'
          ? 'purchase'
          : activeTab === 'penalty'
          ? 'penalty'
          : activeTab;
      setFilteredTransactions(
        transactions.filter((t) => t.Transaction_type === filterType)
      );
    }
  }, [activeTab, transactions]);

  ; // Update fungsi fetchTransactions dengan logging yang lebih detail
  const fetchTransactions = async (studentId, authToken) => {
    try {
      setLoading(true);
      console.log(`Fetching transactions for student ID: ${studentId}`);
      console.log(`Using token: ${authToken ? 'Token present' : 'No token'}`);

      const url = `${API_BASE_URL}/transactions/siswa/${studentId}?limit=50`;
      console.log(`Request URL: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Response status: ${response.status}`);
      console.log(`Response ok: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
        throw new Error(
          `Failed to fetch transactions: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log(`API Response:`, result);

      if (result.success) {
        console.log(
          `Transactions received: ${result.data.transactions.length}`
        );
        console.log(`Student data:`, result.data.student);

        setTransactions(result.data.transactions);

        // Update user balance from transaction response
        if (user) {
          console.log(
            `Updating user balance from ${user.Balance} to ${result.data.student.balance}`
          );
          setUser((prev) =>
            prev ? { ...prev, Balance: result.data.student.balance } : null
          );
        }
      } else {
        console.error(`API returned success: false`, result);
        setError('Failed to load transactions: ' + result.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      console.error('Error message:', error.message);
      setError('Failed to load transactions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if fields are empty
    if (!identifier || !pin) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/siswa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier,
          PIN: pin,
        }),
      });

      const result: ApiResponse<LoginResponse> = await response.json();

      if (response.ok && result.success) {
        // Store user info and token
        sessionStorage.setItem(
          'dompetku_user',
          JSON.stringify(result.data.user)
        );
        sessionStorage.setItem('dompetku_token', result.data.token);

        setUser(result.data.user);
        setToken(result.data.token);
        setIsLoggedIn(true);

        // Reset form fields
        setIdentifier('');
        setPin('');

        // Fetch transactions
        await fetchTransactions(result.data.user.id, result.data.token);
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dompetku_user');
    sessionStorage.removeItem('dompetku_token');
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setTransactions([]);
    setFilteredTransactions([]);
  };

  const toggleTransaction = (id: number) => {
    if (expandedTransaction === id) {
      setExpandedTransaction(null);
    } else {
      setExpandedTransaction(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const refreshTransactions = async () => {
    if (user && token) {
      await fetchTransactions(user.id, token);
    }
  };

  // Login Form View
  const renderLoginForm = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6 text-red-500" />
            Dompetku
          </CardTitle>
          <CardDescription>
            Access your digital wallet with your student ID or NFC card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">
                Student ID (NIS/NISN) or Username
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  placeholder="Enter your Student ID, NISN, or Username"
                  className="pl-10"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your 6-digit PIN"
                  className="pl-10"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  disabled={loading}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Contact your administrator if you need help accessing your account
          </p>
        </CardFooter>
      </Card>
    </div>
  );

  // Dashboard View
  const renderDashboard = () => {
    if (!user) return null;

    return (
      <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
        {/* Header */}
        <header className="border-b bg-white shadow-sm">
          <div className="flex h-16 items-center px-8 justify-between">
            <h1 className="text-2xl font-semibold">Dompetku</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshTransactions}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* User info and balance card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <Wallet className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{user.Nama}</h2>
                    <p className="text-muted-foreground">NIS: {user.NIS}</p>
                    {user.NISN && (
                      <p className="text-muted-foreground">NISN: {user.NISN}</p>
                    )}
                    {user.Gen && (
                      <p className="text-muted-foreground">
                        Generation: {user.Gen}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-3xl font-bold">
                      Rp {user.Balance.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction history */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="purchase">Purchases</TabsTrigger>
                    <TabsTrigger value="topup">Top-ups</TabsTrigger>
                    <TabsTrigger value="penalty">Penalties</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-0">
                    <TransactionList
                      transactions={filteredTransactions}
                      expandedTransaction={expandedTransaction}
                      toggleTransaction={toggleTransaction}
                      loading={loading}
                    />
                  </TabsContent>
                  <TabsContent value="purchase" className="mt-0">
                    <TransactionList
                      transactions={filteredTransactions}
                      expandedTransaction={expandedTransaction}
                      toggleTransaction={toggleTransaction}
                      loading={loading}
                    />
                  </TabsContent>
                  <TabsContent value="topup" className="mt-0">
                    <TransactionList
                      transactions={filteredTransactions}
                      expandedTransaction={expandedTransaction}
                      toggleTransaction={toggleTransaction}
                      loading={loading}
                    />
                  </TabsContent>
                  <TabsContent value="penalty" className="mt-0">
                    <TransactionList
                      transactions={filteredTransactions}
                      expandedTransaction={expandedTransaction}
                      toggleTransaction={toggleTransaction}
                      loading={loading}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        {isLoggedIn ? renderDashboard() : renderLoginForm()}
      </div>
    </SidebarProvider>
  );
}

interface TransactionListProps {
  transactions: Transaction[];
  expandedTransaction: number | null;
  toggleTransaction: (id: number) => void;
  loading: boolean;
}

function TransactionList({
  transactions,
  expandedTransaction,
  toggleTransaction,
  loading,
}: TransactionListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Purchase';
      case 'topup':
        return 'Top-up';
      case 'penalty':
        return 'Penalty';
      default:
        return type;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'penalty':
        return <ArrowUpRight className="h-6 w-6 text-red-500" />;
      case 'topup':
        return <ArrowDownLeft className="h-6 w-6 text-green-500" />;
      default:
        return <ArrowUpRight className="h-6 w-6 text-gray-500" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'penalty':
        return 'text-red-500';
      case 'topup':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'penalty':
        return '-';
      case 'topup':
        return '+';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <p className="mt-4 text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="border rounded-lg overflow-hidden">
          <div
            className="p-4 flex items-center cursor-pointer hover:bg-muted/50"
            onClick={() => toggleTransaction(transaction.id)}
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
              {getTransactionIcon(transaction.Transaction_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <Badge
                  variant={
                    transaction.Transaction_type === 'purchase' ||
                    transaction.Transaction_type === 'penalty'
                      ? 'destructive'
                      : transaction.Transaction_type === 'topup'
                      ? 'default'
                      : 'secondary'
                  }
                  className="mr-2"
                >
                  {getTransactionTypeLabel(transaction.Transaction_type)}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
              <p className="truncate mt-1">{transaction.Note}</p>
              <p className="text-xs text-muted-foreground">
                Status: {transaction.status}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-bold ${getAmountColor(
                  transaction.Transaction_type
                )}`}
              >
                {getAmountPrefix(transaction.Transaction_type)} Rp{' '}
                {transaction.total_amount.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Transaction details */}
          {expandedTransaction === transaction.id &&
            transaction.details &&
            transaction.details.length > 0 && (
              <div className="bg-muted/30 p-4 border-t">
                <p className="font-medium mb-2">Transaction Details</p>
                <div className="space-y-3">
                  {transaction.details.map((detail, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center mr-3">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt={detail.product?.Nama || 'Product'}
                          width={40}
                          height={40}
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {detail.product?.Nama || 'Unknown Product'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {detail.amount} x Rp{' '}
                          {detail.product?.Harga?.toLocaleString('id-ID') ||
                            '0'}
                        </p>
                      </div>
                      <p className="font-medium">
                        Rp{' '}
                        {(
                          (detail.product?.Harga || 0) * detail.amount
                        ).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
