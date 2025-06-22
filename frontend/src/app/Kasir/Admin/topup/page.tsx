'use client';

import type React from 'react';
import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Wallet,
  CreditCard,
  ArrowRight,
  CreditCardIcon,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Types
interface Student {
  id: number;
  NIS: string;
  NISN: string | null;
  Nama: string;
  Balance: number;
  username: string;
  email: string | null;
  Gen: string | null;
  NFC_id: string | null;
  is_active: boolean;
}

interface Transaction {
  id: number;
  Transaction_type: 'topup' | 'purchase' | 'penalty';
  total_amount: number;
  Note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  details?: TransactionDetail[];
}

interface TransactionDetail {
  id: number;
  Product_id: number;
  amount: number;
  product?: {
    id: number;
    Nama: string;
    Harga: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface TransactionResponse {
  student: {
    id: number;
    nama: string;
    nis: string;
    nisn: string | null;
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

interface SearchResponse {
  siswa: Student[];
  searchQuery: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function TopUpPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idInput, setIdInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Student state after authentication
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState('');

  // Transaction history state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailureAlert, setShowFailureAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // API Base URL - adjust according to your backend
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Quick amount options
  const quickAmounts = [
    { value: '10000', label: 'Rp 10.000' },
    { value: '20000', label: 'Rp 20.000' },
    { value: '50000', label: 'Rp 50.000' },
    { value: '100000', label: 'Rp 100.000' },
    { value: '200000', label: 'Rp 200.000' },
    { value: '500000', label: 'Rp 500.000' },
  ];

  // Helper function to check if input is numeric
  const isNumeric = (str: string): boolean => {
    return !isNaN(Number(str)) && !isNaN(Number.parseFloat(str));
  };

  // API Functions - Updated to handle both ID and NIS search
  const searchStudentByIdOrNis = async (
    identifier: string
  ): Promise<Student | null> => {
    try {
      // Coba cari berdasarkan ID jika identifier adalah angka
      if (isNumeric(identifier)) {
        try {
          const response = await fetch(`${API_BASE_URL}/siswa/${identifier}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const result: ApiResponse<Student> = await response.json();

          if (result.success && result.data) {
            return result.data;
          }
        } catch (error) {
          console.log('ID search failed, trying NIS search...');
        }
      }

      // Cari berdasarkan NIS yang tepat (exact match)
      // Gunakan endpoint auth/login/siswa yang menerima identifier (NIS/NISN/username)
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login/siswa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier,
          // Tidak perlu password/PIN karena kita hanya ingin mendapatkan data siswa
          // Server akan mengembalikan error 401 yang bisa kita tangkap
        }),
      });

      const loginResult = await loginResponse.json();

      // Jika login berhasil (tidak mungkin karena tidak ada password), gunakan data user
      if (loginResult.success && loginResult.data?.user) {
        return loginResult.data.user;
      }

      // Jika login gagal karena kredensial (yang memang kita harapkan),
      // coba cari dengan endpoint search dengan filter yang lebih ketat
      const searchResponse = await fetch(
        `${API_BASE_URL}/siswa/search?query=${encodeURIComponent(identifier)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const searchResult: ApiResponse<SearchResponse> =
        await searchResponse.json();

      if (
        searchResult.success &&
        searchResult.data &&
        searchResult.data.siswa.length > 0
      ) {
        // Filter hasil untuk mendapatkan exact match pada NIS
        const exactMatch = searchResult.data.siswa.find(
          (student) =>
            student.NIS === identifier ||
            student.NISN === identifier ||
            student.username === identifier
        );

        // Jika ada exact match, gunakan itu
        if (exactMatch) {
          return exactMatch;
        }

        // Jika tidak ada exact match, gunakan hasil pertama
        return searchResult.data.siswa[0];
      }

      throw new Error('Student not found');
    } catch (error) {
      console.error('Error searching student:', error);
      throw error;
    }
  };

  const getStudentTransactions = async (
    studentId: number
  ): Promise<Transaction[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/transactions/siswa/${studentId}?limit=10&sortOrder=DESC`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result: ApiResponse<TransactionResponse> = await response.json();

      if (result.success && result.data) {
        return result.data.transactions;
      } else {
        throw new Error(result.message || 'Failed to load transactions');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  };

  const processTopUp = async (
    studentId: number,
    amount: number,
    note?: string
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: studentId,
          amount: amount,
          note: note || 'Top-up via admin panel',
        }),
      });

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Top-up failed');
      }
    } catch (error) {
      console.error('Error processing top-up:', error);
      throw error;
    }
  };

  // Handle authentication - Updated to use new search function
  const handleAuthenticate = async () => {
    if (!idInput.trim()) {
      setAlertMessage('Please enter a student ID or NIS');
      setShowFailureAlert(true);
      return;
    }

    setIsSearching(true);

    try {
      const foundStudent = await searchStudentByIdOrNis(idInput.trim());

      if (foundStudent) {
        if (!foundStudent.is_active) {
          setAlertMessage(
            'Student account is inactive. Please contact administrator.'
          );
          setShowFailureAlert(true);
          return;
        }

        setStudent(foundStudent);
        setIsAuthenticated(true);

        // Load transaction history
        setIsLoadingTransactions(true);
        const studentTransactions = await getStudentTransactions(
          foundStudent.id
        );
        setTransactions(studentTransactions);
        setIsLoadingTransactions(false);
      } else {
        setAlertMessage(
          'Student not found. Please check the ID/NIS and try again.'
        );
        setShowFailureAlert(true);
      }
    } catch (error) {
      setAlertMessage(
        error instanceof Error
          ? error.message
          : 'Failed to find student. Please try again.'
      );
      setShowFailureAlert(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle logout/reset
  const handleLogout = () => {
    setIsAuthenticated(false);
    setStudent(null);
    setIdInput('');
    setSelectedAmount('');
    setCustomAmount('');
    setTransactions([]);
  };

  // Handle amount selection
  const handleAmountSelect = (value: string) => {
    setSelectedAmount(value);
    setCustomAmount('');
  };

  // Handle custom amount change
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('');
  };

  // Handle top-up submission
  const handleTopUp = async () => {
    const amount = selectedAmount || customAmount;
    if (!student || !amount) {
      setAlertMessage('Please select an amount to top up.');
      setShowFailureAlert(true);
      return;
    }

    const numericAmount = Number.parseInt(amount);

    // Validate amount
    if (numericAmount <= 0) {
      setAlertMessage('Please enter a valid amount greater than 0.');
      setShowFailureAlert(true);
      return;
    }

    if (numericAmount > 1000000) {
      setAlertMessage('Maximum top-up amount is Rp 1.000.000 per transaction.');
      setShowFailureAlert(true);
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processTopUp(
        student.id,
        numericAmount,
        `Top-up for ${student.Nama}`
      );

      // Update student balance with new balance from API response
      const updatedStudent = { ...student, Balance: result.new_balance };
      setStudent(updatedStudent);

      setAlertMessage(
        `Top-up successful! Rp ${numericAmount.toLocaleString()} has been added to ${
          student.Nama
        }'s account. New balance: Rp ${result.new_balance.toLocaleString()}`
      );
      setShowSuccessAlert(true);

      // Reset form
      setSelectedAmount('');
      setCustomAmount('');

      // Reload transaction history
      const updatedTransactions = await getStudentTransactions(student.id);
      setTransactions(updatedTransactions);
    } catch (error) {
      setAlertMessage(
        `Top-up failed for ${student.Nama}. ${
          error instanceof Error
            ? error.message
            : 'Please try again or contact support.'
        }`
      );
      setShowFailureAlert(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessAlertClose = () => {
    setShowSuccessAlert(false);
    setAlertMessage('');
  };

  const handleFailureAlertClose = () => {
    setShowFailureAlert(false);
    setAlertMessage('');
  };

  // Format transaction type for display
  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'topup':
        return 'Top-up';
      case 'purchase':
        return 'Purchase';
      case 'penalty':
        return 'Penalty';
      default:
        return type;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID'),
      time: date.toLocaleTimeString('id-ID'),
    };
  };

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
            <h1 className="text-lg font-semibold">Top Up</h1>
          </div>
          {isAuthenticated && student && (
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src="/placeholder.svg?height=40&width=40"
                    alt={student.Nama}
                  />
                  <AvatarFallback>{student.Nama.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{student.Nama}</span>
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
                  <CardTitle className="text-center text-2xl">
                    Student Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="student-id" className="text-base">
                      Student ID or NIS
                    </Label>
                    <div className="relative">
                      <CreditCardIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="student-id"
                        placeholder="Enter Student ID, NIS, NISN, or Username"
                        className="h-12 pl-10 text-lg"
                        value={idInput}
                        onChange={(e) => setIdInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          !isSearching &&
                          handleAuthenticate()
                        }
                        autoFocus
                        disabled={isSearching}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Enter Student ID, NIS, NISN, or Username to search. You
                      can also scan NFC card to automatically input ID.
                    </p>
                  </div>
                  <Button
                    className="w-full h-12 text-base"
                    onClick={handleAuthenticate}
                    disabled={!idInput.trim() || isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Searching Student...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-5 w-5" />
                        Continue to Top Up
                      </>
                    )}
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
                        <AvatarImage
                          src="/placeholder.svg?height=96&width=96"
                          alt={student.Nama}
                        />
                        <AvatarFallback className="text-2xl">
                          {student.Nama.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-medium">{student.Nama}</h3>
                      <p className="text-sm text-muted-foreground">
                        NIS: {student.NIS}
                      </p>
                      {student.NISN && (
                        <p className="text-sm text-muted-foreground">
                          NISN: {student.NISN}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Username: {student.username}
                      </p>
                      {student.Gen && (
                        <p className="text-sm text-muted-foreground">
                          Generation: {student.Gen}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-muted-foreground">
                        Current Balance
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Wallet className="h-6 w-6" />
                        <span className="text-3xl font-bold">
                          Rp {student.Balance.toLocaleString()}
                        </span>
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
                        <p className="mb-3 font-medium text-lg">
                          Custom Amount
                        </p>
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
                        <p className="mb-3 font-medium text-lg">
                          Quick Amounts
                        </p>
                        <RadioGroup
                          value={selectedAmount}
                          onValueChange={handleAmountSelect}
                          className="grid grid-cols-2 md:grid-cols-3 gap-4"
                          disabled={isProcessing}
                        >
                          {quickAmounts.map((amount) => (
                            <div
                              key={amount.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={amount.value}
                                id={`amount-${amount.value}`}
                                className="h-5 w-5"
                                disabled={isProcessing}
                              />
                              <Label
                                htmlFor={`amount-${amount.value}`}
                                className={`flex-1 cursor-pointer rounded-md border p-3 text-center hover:bg-accent text-base ${
                                  isProcessing
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
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
                        disabled={
                          (!selectedAmount && !customAmount) || isProcessing
                        }
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
                    {isLoadingTransactions && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTransactions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading transactions...</span>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions found for this student.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => {
                          const { date, time } = formatDate(
                            transaction.createdAt
                          );
                          return (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                <div className="font-medium">{date}</div>
                                <div className="text-sm text-muted-foreground">
                                  {time}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    transaction.Transaction_type === 'topup'
                                      ? 'bg-green-100 text-green-800'
                                      : transaction.Transaction_type ===
                                        'purchase'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {formatTransactionType(
                                    transaction.Transaction_type
                                  )}
                                </span>
                              </TableCell>
                              <TableCell
                                className={
                                  transaction.Transaction_type === 'topup'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {transaction.Transaction_type === 'topup'
                                  ? '+'
                                  : '-'}{' '}
                                Rp {transaction.total_amount.toLocaleString()}
                              </TableCell>
                              <TableCell>{transaction.Note}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    transaction.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {transaction.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
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
              <AlertDialogTitle className="text-green-800">
                Top-up Successful!
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSuccessAlertClose}
              className="bg-green-600 hover:bg-green-700"
            >
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
              <AlertDialogTitle className="text-red-800">
                Error
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleFailureAlertClose}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
