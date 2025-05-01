/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import type React from 'react';

import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  Wallet,
  ArrowRight,
  X,
  Check,
  Search,
  Calendar,
  Nfc,
  User,
  History,
  Info,
  ShoppingBag,
} from 'lucide-react';
import { format } from 'date-fns';

import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { topupService } from '@/services/topupService';
import { historyService } from '@/services/historyService';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const ProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
      style={{ scaleX }}
    />
  );
};

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  status: 'success' | 'error';
}

function NotificationDialog({
  isOpen,
  onClose,
  title,
  description,
  status,
}: NotificationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
            <DialogHeader>
              <motion.div
                className="flex flex-col items-center gap-4 py-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
              >
                <motion.div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    status === 'success'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-destructive/10 text-destructive'
                  )}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                >
                  {status === 'success' ? (
                    <Check className="w-8 h-8" />
                  ) : (
                    <X className="w-8 h-8" />
                  )}
                </motion.div>
                <motion.div
                  className="text-center space-y-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {title}
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
                    {description}
                  </DialogDescription>
                </motion.div>
              </motion.div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

// Helper function to safely format dates
const safeFormatDate = (dateValue: any, formatStr: string = 'dd MMM yyyy, HH:mm') => {
  try {
    // Ensure we have a valid date
    const date = dateValue ? new Date(dateValue) : new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error, dateValue);
    return 'Invalid date';
  }
};

interface HistoryItemProps {
  history: any;
  formatCurrency: (amount: number) => string;
}

const HistoryItem = ({ history, formatCurrency }: HistoryItemProps) => {
  const productName = history.productName || history.description || "Purchase";
  const amount = history.totalPrice || history.amount || 0;

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 50,
        mass: 1,
      }}
    >
      <motion.div
        className={cn(
          'flex items-center justify-between p-4 rounded-lg',
          'bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md'
        )}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500"
            whileHover={{ rotate: 15 }}
          >
            <ShoppingBag className="w-5 h-5" />
          </motion.div>
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-200">
              {productName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {safeFormatDate(history.createdAt || history.date)}
            </div>
          </div>
        </div>
        <motion.div
          className="text-lg font-medium text-destructive"
          whileHover={{ scale: 1.1 }}
        >
          -{formatCurrency(Math.abs(amount))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const AnimatedButton = motion(Button);

// Animation variants for items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Page() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [nfcId, setNfcId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('topup');

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    status: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    description: '',
    status: 'success',
  });

  const presetAmounts = [10000, 20000, 50000, 100000, 200000, 500000];
  const months = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Load transaction history when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTransactionHistory(user.id);
      fetchPurchaseHistory(user.id);
    }
  }, [isAuthenticated, user]);

  const fetchTransactionHistory = async (userId: string) => {
    setIsLoading(true);
    try {
      const history = await topupService.getUserTransactionHistory(userId);
      setTransactions(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      showNotification('Error', 'Failed to load transaction history.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPurchaseHistory = async (userId: string) => {
    setIsLoading(true);
    try {
      const history = await historyService.getHistoryByUser(userId);
      console.log(`Data History ${userId} adalah ini ${JSON.stringify(history)}`)
      
      if (!history) {
        throw new Error('No history data received');
      }
      
      setPurchaseHistory(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error('Failed to fetch purchase history:', error);
      const errorMessage = error.message || 'Failed to load purchase history';
      showNotification('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (!transaction || !transaction.date) return false;
    
    try {
      const transactionDate = new Date(transaction.date);
      if (isNaN(transactionDate.getTime())) return false;
      
      const matchesMonth =
        selectedMonth === 'all' ||
        (transactionDate.getMonth() + 1).toString() === selectedMonth;

      const query = searchQuery.trim().toLowerCase();

      // If search query is empty, don't filter by search
      if (!query) {
        return matchesMonth;
      }

      // Filter by username and transaction type
      const userName = (transaction.userName || '').toLowerCase();
      const transactionType = (transaction.type || '').toLowerCase();
      const matchesSearch =
        userName.includes(query) || transactionType.includes(query);

      return matchesMonth && matchesSearch;
    } catch (error) {
      console.error('Error filtering transaction:', error, transaction);
      return false;
    }
  });

  const filteredPurchaseHistory = purchaseHistory.filter((history) => {
    if (!history) return false;
    
    try {
      const historyDate = new Date(history.createdAt || history.date);
      if (isNaN(historyDate.getTime())) return false;
      
      const matchesMonth =
        selectedMonth === 'all' ||
        (historyDate.getMonth() + 1).toString() === selectedMonth;
    
      const query = searchQuery.trim().toLowerCase();
    
      if (!query) {
        return matchesMonth;
      }
    
      // Filter by product name or description
      const productName = (history.productName || history.description || '').toLowerCase();
      const matchesSearch = productName.includes(query);
    
      return matchesMonth && matchesSearch;
    } catch (error) {
      console.error('Error filtering history:', error, history);
      return false;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    const numValue = Number.parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue);
    } else {
      setSelectedAmount(null);
    }
  };

  const handlePresetAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const showNotification = (
    title: string,
    description: string,
    status: 'success' | 'error'
  ) => {
    setNotification({
      isOpen: true,
      title,
      description,
      status,
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const userData = await topupService.verifyUserByNFC(nfcId);

      if (userData) {
        // Normalize the user data to ensure consistent property names
        const normalizedUserData = {
          id: userData.id || userData.Id,
          username: userData.Nama || userData.nama || userData.username,
          balance: userData.Balance || userData.balance || 0,
          role: userData.role || userData.Role || 'user',
          nfcId: userData.NFCId || userData.nfcId || nfcId,
        };

        setUser(normalizedUserData);
        setIsAuthenticated(true);

        // Fetch additional user info including balance if it wasn't provided
        if (
          userData.id &&
          (userData.balance === undefined || userData.balance === null)
        ) {
          try {
            const fullUserInfo = await topupService.getUserInfo(userData.id);
            if (fullUserInfo) {
              setUser((prevUser) => ({
                ...prevUser,
                balance:
                  fullUserInfo.Balance ||
                  fullUserInfo.balance ||
                  prevUser.balance ||
                  0,
              }));
            }
          } catch (infoError) {
            console.error('Error fetching complete user info:', infoError);
            // Already authenticated with default balance, so continue
          }
        }

        showNotification(
          'Authentication Successful',
          'You have been successfully authenticated.',
          'success'
        );
      } else {
        showNotification(
          'Authentication Failed',
          'Unable to verify your NFC ID. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showNotification(
        'Authentication Failed',
        'Unable to verify your credentials. Please try again.',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTopUp = async () => {
    if (selectedAmount && selectedAmount >= 10000 && user) {
      setIsProcessing(true);
      try {
        // Use topupService to process top up
        const topupData = {
          userId: user.id,
          amount: selectedAmount,
          method: 'manual', // You can change this as needed
        };

        const result = await topupService.topUpBalance(topupData);

        // Update local user data with new balance
        setUser({
          ...user,
          balance: result.newBalance,
        });

        // Refresh transaction history
        await fetchTransactionHistory(user.id);

        showNotification(
          'Top Up Successful',
          `Amount ${formatCurrency(
            selectedAmount
          )} has been successfully added to your balance.`,
          'success'
        );

        // Reset form after successful top-up
        setTimeout(() => {
          setSelectedAmount(null);
          setCustomAmount('');
        }, 3000);
      } catch (error) {
        console.error('Top up error:', error);
        showNotification(
          'Top Up Failed',
          'There was an error processing your top up. Please try again.',
          'error'
        );
      } finally {
        setIsProcessing(false);
      }
    } else {
      showNotification(
        'Invalid Amount',
        'Please enter a valid amount (minimum Rp 10,000).',
        'error'
      );
    }
  };

  const handleClearAuth = () => {
    setIsAuthenticated(false);
    setUser(null);
    setNfcId('');
    setSelectedAmount(null);
    setCustomAmount('');
    setTransactions([]);
    setPurchaseHistory([]);
  };

  const isValidAmount = selectedAmount && selectedAmount >= 10000;

  if (!isAuthenticated) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <ProgressBar />
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
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
                Top Up
              </motion.h1>
            </div>
          </motion.header>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="w-full max-w-md p-8"
            >
              <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                <form onSubmit={handleAuthSubmit} className="space-y-8 p-8">
                  <motion.div
                    className="space-y-4 text-center"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'reverse',
                      }}
                    >
                      <Nfc className="w-20 h-20 mx-auto text-primary" />
                    </motion.div>
                    <motion.h2
                      className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Authenticate to Top Up
                    </motion.h2>
                    <motion.p
                      className="text-sm text-gray-500 dark:text-gray-400"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Please enter your NFC ID to continue
                    </motion.p>
                  </motion.div>
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="nfcId"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        NFC ID
                      </Label>
                      <Input
                        id="nfcId"
                        name="nfcId"
                        value={nfcId}
                        onChange={(e) => setNfcId(e.target.value)}
                        placeholder="Enter your NFC ID"
                        className="h-12 text-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-inner"
                        required
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Hint: Use "NFC12345" for demo
                      </p>
                    </div>
                  </motion.div>
                  <AnimatedButton
                    type="submit"
                    className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                    disabled={isProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'linear',
                        }}
                      >
                        <Nfc className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      'Authenticate'
                    )}
                  </AnimatedButton>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProgressBar />
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
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
              Top Up
            </motion.h1>
          </div>
        </motion.header>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container max-w-6xl p-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <Alert className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                  <User className="h-7 w-4 text-primary" />
                  <AlertDescription className="flex items-center text-gray-700 dark:text-gray-300">
                    User: {user?.username}
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={handleClearAuth}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-4 h-4 mr-1" /> Clear Authentication
                    </AnimatedButton>
                  </AlertDescription>
                </Alert>
              </motion.div>
  
              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                    <CardContent className="p-6 space-y-6">
                      <motion.div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          Profile
                        </h2>
                        <div className="text-lg text-gray-600 dark:text-gray-400">
                          @{user?.username}
                        </div>
                      </motion.div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Current Balance
                        </div>
                        <motion.div
                          className="flex items-center gap-3"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <motion.div
                            animate={{
                              rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: 'reverse',
                            }}
                          >
                            <Wallet className="w-8 h-8 text-primary" />
                          </motion.div>
                          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {formatCurrency(user?.balance || 0)}
                          </span>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
  
                {/* Top Up Card */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                    <CardContent className="p-6 space-y-6">
                      <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Top Up
                      </h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="custom-amount"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Custom Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                              Rp
                            </span>
                            <Input
                              id="custom-amount"
                              type="text"
                              placeholder="Enter amount"
                              value={customAmount}
                              onChange={handleCustomAmountChange}
                              className="pl-9 h-12 text-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-inner"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-gray-700 dark:text-gray-300">
                            Quick Amounts
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <AnimatePresence>
                              {presetAmounts.map((amount, index) => (
                                <motion.div
                                  key={amount}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <AnimatedButton
                                    variant="outline"
                                    className={cn(
                                      'w-full h-16 text-lg transition-all bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md',
                                      selectedAmount === amount &&
                                        'border-primary border-2 bg-primary/5'
                                    )}
                                    onClick={() => handlePresetAmount(amount)}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {formatCurrency(amount)}
                                  </AnimatedButton>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                      <AnimatedButton
                        className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                        disabled={!isValidAmount || isProcessing}
                        onClick={handleTopUp}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isProcessing ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: 'linear',
                            }}
                          >
                            <ArrowRight className="w-6 h-6" />
                          </motion.div>
                        ) : isValidAmount ? (
                          <span className="flex items-center gap-2">
                            Top Up {formatCurrency(selectedAmount)}{' '}
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        ) : (
                          'Enter Valid Amount'
                        )}
                      </AnimatedButton>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
  
              {/* Transaction History with Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <motion.h2
                        className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        Transaction History
                      </motion.h2>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <motion.div
                          className="relative"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                          <Select
                            value={selectedMonth}
                            onValueChange={setSelectedMonth}
                          >
                            <SelectTrigger className="w-full sm:w-[200px] pl-10">
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>
                        <motion.div
                          className="relative"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Search transactions"
                            className="pl-10 w-full sm:w-64 bg-white/50 dark:bg-gray-700/50 border-0 shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </motion.div>
                      </div>
                    </div>
  
                    <Tabs defaultValue="all">
                      <TabsList className=" mb-4">
                        <TabsTrigger value="all">All Transactions</TabsTrigger>
                      </TabsList>
  
                      <TabsContent value="all">
                        <motion.div layout className="space-y-4">
                          <AnimatePresence mode="popLayout">
                            {[...filteredTransactions, ...filteredPurchaseHistory].length > 0 ? (
                              [...filteredTransactions, ...filteredPurchaseHistory]
                                .sort((a, b) => {
                                  const dateA = new Date(a.date || a.TransactionDate || a.createdAt);
                                  const dateB = new Date(b.date || b.TransactionDate || b.createdAt);
                                  return dateB.getTime() - dateA.getTime();
                                })
                                .map((item) => {
                                  // Determine if this is a top-up or purchase
                                  const isTopUp = 
                                    item.type === 'top-up' || 
                                    item.TransactionType === 'TOP_UP' || 
                                    item.TransactionType === 'topup';
                                  
                                  // Get the appropriate amount
                                  const amount = item.amount || item.Amount || 0;
                                  
                                  // Get product/description info
                                  const description = 
                                    (item.product?.ProductName) || 
                                    item.Description || 
                                    item.description || 
                                    (isTopUp ? 'Top Up' : 'Purchase');
                                  
                                  // Get date
                                  const date = item.date || item.TransactionDate || item.createdAt;
                                  
                                  return (
                                    <motion.div
                                      key={item.id}
                                      layout
                                      variants={itemVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 50,
                                        mass: 1,
                                      }}
                                    >
                                      <motion.div
                                        className={cn(
                                          'flex items-center justify-between p-4 rounded-lg',
                                          'bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md'
                                        )}
                                        whileHover={{
                                          scale: 1.02,
                                          transition: { duration: 0.2 },
                                        }}
                                      >
                                        <div className="flex items-center gap-4">
                                          <motion.div
                                            className={cn(
                                              'w-10 h-10 rounded-full flex items-center justify-center',
                                              isTopUp
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-destructive/10 text-destructive'
                                            )}
                                            whileHover={{
                                              rotate: isTopUp ? 90 : -90,
                                            }}
                                          >
                                            {isTopUp ? (
                                              <ArrowRight className="w-5 h-5" />
                                            ) : (
                                              <ShoppingBag className="w-5 h-5" />
                                            )}
                                          </motion.div>
                                          <div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                              {description}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                              {safeFormatDate(date)}
                                            </div>
                                          </div>
                                        </div>
                                        <motion.div
                                          className={cn(
                                            'text-lg font-medium',
                                            isTopUp
                                              ? 'text-primary'
                                              : 'text-destructive'
                                          )}
                                          whileHover={{ scale: 1.1 }}
                                        >
                                          {isTopUp ? '+' : '-'}
                                          {formatCurrency(Math.abs(amount))}
                                        </motion.div>
                                      </motion.div>
                                    </motion.div>
                                  );
                                })
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-8 text-gray-500 dark:text-gray-400"
                              >
                                No transactions found
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </TabsContent>
  
                      <TabsContent value="topup">
                        <motion.div layout className="space-y-4">
                          <AnimatePresence mode="popLayout">
                            {filteredTransactions.length > 0 ? (
                              filteredTransactions.map((transaction) => (
                                <motion.div
                                  key={transaction.id}
                                  layout
                                  variants={itemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 50,
                                    mass: 1,
                                  }}
                                >
                                  <motion.div
                                    className={cn(
                                      'flex items-center justify-between p-4 rounded-lg',
                                      'bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md'
                                    )}
                                    whileHover={{
                                      scale: 1.02,
                                      transition: { duration: 0.2 },
                                    }}
                                  >
                                    <div className="flex items-center gap-4">
                                      <motion.div
                                        className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary"
                                        whileHover={{ rotate: 90 }}
                                      >
                                        <ArrowRight className="w-5 h-5" />
                                      </motion.div>
                                      <div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                          Top Up
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          {safeFormatDate(transaction.date)}
                                        </div>
                                      </div>
                                    </div>
                                    <motion.div
                                      className="text-lg font-medium text-primary"
                                      whileHover={{ scale: 1.1 }}
                                    >
                                      +{formatCurrency(Math.abs(transaction.amount))}
                                    </motion.div>
                                  </motion.div>
                                </motion.div>
                              ))
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-8 text-gray-500 dark:text-gray-400"
                              >
                                No top-ups found
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </TabsContent>
  
                      <TabsContent value="purchase">
                        <motion.div layout className="space-y-4">
                          <AnimatePresence mode="popLayout">
                            {filteredPurchaseHistory.length > 0 ? (
                              filteredPurchaseHistory
                                .filter((item) => {
                                  const type = item.TransactionType || '';
                                  return type.toLowerCase() === 'purchase';
                                })
                                .map((purchase) => (
                                  <HistoryItem 
                                    key={purchase.id} 
                                    history={purchase} 
                                    formatCurrency={formatCurrency} 
                                  />
                                ))
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-8 text-gray-500 dark:text-gray-400"
                              >
                                No purchases found
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
  
        <NotificationDialog
          isOpen={notification.isOpen}
          onClose={() =>
            setNotification((prev) => ({ ...prev, isOpen: false }))
          }
          title={notification.title}
          description={notification.description}
          status={notification.status}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}