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

// Mock student data for demonstration
const mockStudents = [
  {
    NIS: '12345',
    NFC_id: 'NFC001',
    PIN: '1234',
    Nama: 'John Doe',
    Balance: 150000,
  },
  {
    NIS: '67890',
    NFC_id: 'NFC002',
    PIN: '5678',
    Nama: 'Jane Smith',
    Balance: 75000,
  },
];

// Mock transaction data
const mockTransactions = [
  {
    id: 1,
    date: '2023-05-12T08:30:00',
    type: 'purchase',
    amount: 15000,
    note: 'Snack Potato Chips (2), Mineral Water (1)',
    details: [
      {
        product_id: 1,
        product_name: 'Snack Potato Chips',
        amount: 2,
        price: 8000,
      },
      { product_id: 3, product_name: 'Mineral Water', amount: 1, price: 5000 },
    ],
  },
  {
    id: 2,
    date: '2023-05-11T12:45:00',
    type: 'topup',
    amount: 50000,
    note: 'Top up via Admin',
    details: [],
  },
  {
    id: 3,
    date: '2023-05-10T10:15:00',
    type: 'purchase',
    amount: 12000,
    note: 'Chocolate Bar (1)',
    details: [
      { product_id: 2, product_name: 'Chocolate Bar', amount: 1, price: 12000 },
    ],
  },
  {
    id: 4,
    date: '2023-05-09T14:20:00',
    type: 'topup',
    amount: 100000,
    note: 'Initial balance',
    details: [],
  },
];

interface Student {
  NIS: string;
  NFC_id: string;
  PIN: string;
  Nama: string;
  Balance: number;
}

export default function Dompetku() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<Student | null>(null);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(
    null
  );

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = sessionStorage.getItem('dompetku_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }

    // Filter transactions based on active tab
    if (activeTab === 'all') {
      setTransactions(mockTransactions);
    } else {
      setTransactions(mockTransactions.filter((t) => t.type === activeTab));
    }
  }, [activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if fields are empty
    if (!identifier || !pin) {
      setError('Please fill in all fields');
      return;
    }

    // Find student based on either NIS or NFC_id
    const student = mockStudents.find(
      (s) => (s.NIS === identifier || s.NFC_id === identifier) && s.PIN === pin
    );

    if (student) {
      // Store user info and set logged in state
      sessionStorage.setItem('dompetku_user', JSON.stringify(student));
      setUser(student);
      setIsLoggedIn(true);
      // Reset form fields
      setIdentifier('');
      setPin('');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dompetku_user');
    setUser(null);
    setIsLoggedIn(false);
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
              <Label htmlFor="identifier">Student ID (NIS) or NFC ID</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  placeholder="Enter your Student ID or NFC ID"
                  className="pl-10"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
                  placeholder="Enter your PIN"
                  className="pl-10"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Login
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
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
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
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-3xl font-bold">
                      Rp {user.Balance.toLocaleString()}
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
                  </TabsList>

                  <TabsContent value="all" className="mt-0">
                    <TransactionList
                      transactions={transactions}
                      expandedTransaction={expandedTransaction}
                      toggleTransaction={toggleTransaction}
                    />
                  </TabsContent>
                  <TabsContent value="purchase" className="mt-0">
                    <TransactionList
                      transactions={transactions.filter(
                        (t) => t.type === 'purchase'
                      )}
                      expandedTransaction={expandedTransaction}
                      toggleTransaction={toggleTransaction}
                    />
                  </TabsContent>
                  <TabsContent value="topup" className="mt-0">
                    <TransactionList
                      transactions={transactions.filter(
                        (t) => t.type === 'topup'
                      )}
                      expandedTransaction={expandedTransaction}
                      toggleTransaction={toggleTransaction}
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
  transactions: typeof mockTransactions;
  expandedTransaction: number | null;
  toggleTransaction: (id: number) => void;
}

function TransactionList({
  transactions,
  expandedTransaction,
  toggleTransaction,
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
              {transaction.type === 'purchase' ? (
                <ArrowUpRight className="h-6 w-6 text-red-500" />
              ) : (
                <ArrowDownLeft className="h-6 w-6 text-green-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <Badge
                  variant={
                    transaction.type === 'purchase' ? 'destructive' : 'default'
                  }
                  className="mr-2"
                >
                  {transaction.type === 'purchase' ? 'Purchase' : 'Top-up'}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatDate(transaction.date)}
                </p>
              </div>
              <p className="truncate mt-1">{transaction.note}</p>
            </div>
            <div className="text-right">
              <p
                className={`font-bold ${
                  transaction.type === 'purchase'
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}
              >
                {transaction.type === 'purchase' ? '-' : '+'} Rp{' '}
                {transaction.amount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Transaction details */}
          {expandedTransaction === transaction.id &&
            transaction.details.length > 0 && (
              <div className="bg-muted/30 p-4 border-t">
                <p className="font-medium mb-2">Transaction Details</p>
                <div className="space-y-3">
                  {transaction.details.map((detail, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center mr-3">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt={detail.product_name}
                          width={40}
                          height={40}
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{detail.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {detail.amount} x Rp {detail.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-medium">
                        Rp {(detail.amount * detail.price).toLocaleString()}
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
