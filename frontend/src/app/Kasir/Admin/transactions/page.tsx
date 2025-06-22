'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  Search,
  Calendar,
  Filter,
  User,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TransactionsTable } from '@/components/transactions-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Transaction {
  id: number;
  Transaction_type: string;
  total_amount: number;
  Note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: number;
    Nama: string;
    NIS: string;
    NISN?: string;
    Balance: number;
  };
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

interface Student {
  id: number;
  nama: string;
  nis: string;
  nisn?: string;
  balance: number;
}

interface UserTransactionData {
  student: Student;
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

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // User-specific transaction states
  const [userSearchDialog, setUserSearchDialog] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userTransactionData, setUserTransactionData] =
    useState<UserTransactionData | null>(null);
  const [userTransactionLoading, setUserTransactionLoading] = useState(false);
  const [userTransactionError, setUserTransactionError] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchQuery, selectedDate, selectedType]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }

      if (selectedDate) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        params.append('startDate', startDate.toISOString());
        params.append('endDate', endDate.toISOString());
      }

      const response = await fetch(`${API_BASE_URL}/transactions?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        let filteredTransactions = data.data.transactions;

        // Client-side filtering for search query (name, NIS, NISN)
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredTransactions = filteredTransactions.filter(
            (transaction: Transaction) => {
              const customerName =
                transaction.customer?.Nama?.toLowerCase() || '';
              const customerNIS =
                transaction.customer?.NIS?.toLowerCase() || '';
              const customerNISN =
                transaction.customer?.NISN?.toLowerCase() || '';

              return (
                customerName.includes(query) ||
                customerNIS.includes(query) ||
                customerNISN.includes(query)
              );
            }
          );
        }

        setTransactions(filteredTransactions);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.totalItems);
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch transactions'
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUserTransactions = async (identifier: string) => {
    try {
      setUserTransactionLoading(true);
      setUserTransactionError(null);

      const response = await fetch(
        `${API_BASE_URL}/transactions/siswa/${identifier}?limit=20`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Student not found or user is not a student');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUserTransactionData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch user transactions');
      }
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      setUserTransactionError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch user transactions'
      );
      setUserTransactionData(null);
    } finally {
      setUserTransactionLoading(false);
    }
  };

  const handleUserSearch = () => {
    if (userSearchQuery.trim()) {
      searchUserTransactions(userSearchQuery.trim());
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate('');
    setSelectedType('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery || selectedDate || selectedType !== 'all';

  // Filter transactions based on current filters
  const filteredTransactions = transactions;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar isAdmin={true} isLoggedIn={true} />
        <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
          {/* Header */}
          <header className="border-b bg-white shadow-sm">
            <div className="flex h-16 items-center px-8 justify-between">
              <h1 className="text-2xl font-semibold">Transaction Management</h1>
              <div className="flex items-center gap-4">
                {/* User Transaction Search Dialog */}
                <Dialog
                  open={userSearchDialog}
                  onOpenChange={setUserSearchDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      View User Transactions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>User Transaction History</DialogTitle>
                      <DialogDescription>
                        Search for a specific student's transaction history by
                        entering their Student ID
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter Student ID..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === 'Enter' && handleUserSearch()
                          }
                        />
                        <Button
                          onClick={handleUserSearch}
                          disabled={
                            userTransactionLoading || !userSearchQuery.trim()
                          }
                        >
                          {userTransactionLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Error Display */}
                      {userTransactionError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {userTransactionError}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* User Transaction Results */}
                      {userTransactionData && (
                        <div className="space-y-4">
                          {/* Student Info */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <span>Student Information</span>
                                <Badge variant="secondary">
                                  Balance:{' '}
                                  {formatCurrency(
                                    userTransactionData.student.balance
                                  )}
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Name
                                  </p>
                                  <p className="font-medium">
                                    {userTransactionData.student.nama}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    NIS
                                  </p>
                                  <p className="font-medium">
                                    {userTransactionData.student.nis}
                                  </p>
                                </div>
                                {userTransactionData.student.nisn && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      NISN
                                    </p>
                                    <p className="font-medium">
                                      {userTransactionData.student.nisn}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Total Transactions
                                  </p>
                                  <p className="font-medium">
                                    {userTransactionData.pagination.totalItems}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Transactions List */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Recent Transactions</CardTitle>
                              <CardDescription>
                                Showing{' '}
                                {userTransactionData.transactions.length} of{' '}
                                {userTransactionData.pagination.totalItems}{' '}
                                transactions
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {userTransactionData.transactions.length > 0 ? (
                                <div className="space-y-2">
                                  {userTransactionData.transactions.map(
                                    (transaction) => (
                                      <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant={
                                                transaction.Transaction_type ===
                                                'topup'
                                                  ? 'default'
                                                  : transaction.Transaction_type ===
                                                    'purchase'
                                                  ? 'secondary'
                                                  : 'destructive'
                                              }
                                            >
                                              {transaction.Transaction_type}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                              {formatDate(
                                                transaction.createdAt
                                              )}
                                            </span>
                                          </div>
                                          <p className="text-sm mt-1">
                                            {transaction.Note}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p
                                            className={`font-medium ${
                                              transaction.Transaction_type ===
                                              'topup'
                                                ? 'text-green-600'
                                                : transaction.Transaction_type ===
                                                  'penalty'
                                                ? 'text-red-600'
                                                : 'text-blue-600'
                                            }`}
                                          >
                                            {transaction.Transaction_type ===
                                            'topup'
                                              ? '+'
                                              : '-'}
                                            {formatCurrency(
                                              transaction.total_amount
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                  <p className="text-muted-foreground">
                                    No transactions found for this student
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* No Data State */}
                      {!userTransactionData &&
                        !userTransactionError &&
                        !userTransactionLoading &&
                        userSearchQuery && (
                          <div className="text-center py-8">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              Enter a Student ID and click search to view their
                              transactions
                            </p>
                          </div>
                        )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTransactions}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Search and Filter Section */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, NIS, or NISN..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Date Picker */}
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        className="pl-10"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        placeholder="Select date"
                      />
                    </div>

                    {/* Transaction Type Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={selectedType}
                        onValueChange={setSelectedType}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="purchase">Purchase</SelectItem>
                          <SelectItem value="topup">Top-up</SelectItem>
                          <SelectItem value="penalty">Penalty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Filters and Results Count */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <>
                          <span className="text-sm text-muted-foreground">
                            Active filters:
                          </span>
                          {searchQuery && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                              Search: {searchQuery}
                            </span>
                          )}
                          {selectedDate && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                              Date:{' '}
                              {new Date(selectedDate).toLocaleDateString(
                                'id-ID'
                              )}
                            </span>
                          )}
                          {selectedType !== 'all' && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs">
                              Type: {selectedType}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-xs ml-2"
                          >
                            Clear all
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredTransactions.length} of {totalItems}{' '}
                      transactions
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}. Please check your connection and try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Transactions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Transactions</CardTitle>
                  <CardDescription>
                    View and manage all transactions in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="purchase">Purchases</TabsTrigger>
                      <TabsTrigger value="topup">Top-ups</TabsTrigger>
                      <TabsTrigger value="penalty">Penalties</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                      <TransactionsTable
                        transactions={filteredTransactions}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </TabsContent>

                    <TabsContent value="purchase" className="mt-0">
                      <TransactionsTable
                        transactions={filteredTransactions.filter(
                          (t) => t.Transaction_type === 'purchase'
                        )}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </TabsContent>

                    <TabsContent value="topup" className="mt-0">
                      <TransactionsTable
                        transactions={filteredTransactions.filter(
                          (t) => t.Transaction_type === 'topup'
                        )}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </TabsContent>

                    <TabsContent value="penalty" className="mt-0">
                      <TransactionsTable
                        transactions={filteredTransactions.filter(
                          (t) => t.Transaction_type === 'penalty'
                        )}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
