import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreditCard, Download, Eye, Search, ShoppingCart } from 'lucide-react';

export default function TransactionsPage() {
  // Mock data for transactions
  const transactions = [
    {
      id: 1,
      student_name: 'Ahmad Rizky',
      student_nis: '2023001',
      type: 'purchase',
      amount: 25000,
      date: '2023-05-15',
      time: '10:15:23',
      note: 'Canteen purchase',
    },
    {
      id: 2,
      student_name: 'Siti Nuraini',
      student_nis: '2023002',
      type: 'topup',
      amount: 50000,
      date: '2023-05-15',
      time: '09:45:12',
      note: 'Monthly allowance',
    },
    {
      id: 3,
      student_name: 'Budi Santoso',
      student_nis: '2023003',
      type: 'purchase',
      amount: 15000,
      date: '2023-05-15',
      time: '09:30:45',
      note: 'Stationery purchase',
    },
    {
      id: 4,
      student_name: 'Dewi Lestari',
      student_nis: '2023004',
      type: 'topup',
      amount: 100000,
      date: '2023-05-15',
      time: '09:15:33',
      note: 'Monthly allowance',
    },
    {
      id: 5,
      student_name: 'Eko Prasetyo',
      student_nis: '2023005',
      type: 'purchase',
      amount: 10000,
      date: '2023-05-15',
      time: '08:55:21',
      note: 'Canteen purchase',
    },
    {
      id: 6,
      student_name: 'Fitri Handayani',
      student_nis: '2023006',
      type: 'purchase',
      amount: 8000,
      date: '2023-05-15',
      time: '08:45:17',
      note: 'Canteen purchase',
    },
    {
      id: 7,
      student_name: 'Gunawan Wibowo',
      student_nis: '2023007',
      type: 'topup',
      amount: 75000,
      date: '2023-05-15',
      time: '08:30:09',
      note: 'Monthly allowance',
    },
    {
      id: 8,
      student_name: 'Hani Susanti',
      student_nis: '2023008',
      type: 'purchase',
      amount: 12000,
      date: '2023-05-15',
      time: '08:15:42',
      note: 'Stationery purchase',
    },
    {
      id: 9,
      student_name: 'Irfan Hakim',
      student_nis: '2023009',
      type: 'purchase',
      amount: 5000,
      date: '2023-05-15',
      time: '08:05:31',
      note: 'Canteen purchase',
    },
    {
      id: 10,
      student_name: 'Juwita Sari',
      student_nis: '2023010',
      type: 'topup',
      amount: 50000,
      date: '2023-05-15',
      time: '07:55:19',
      note: 'Monthly allowance',
    },
  ];

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
            <h1 className="text-lg font-semibold">Transaction History</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-full md:w-64 lg:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="w-full rounded-lg bg-background pl-8 md:w-64 lg:w-80"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Export</span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Top Up</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                View and manage all transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {transaction.student_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.student_nis}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {transaction.type === 'purchase' ? (
                            <>
                              <ShoppingCart className="mr-2 h-4 w-4 text-red-500" />
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                Purchase
                              </span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Top Up
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className={
                          transaction.type === 'purchase'
                            ? 'text-red-500'
                            : 'text-green-500'
                        }
                      >
                        {transaction.type === 'purchase' ? '-' : '+'} Rp{' '}
                        {transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>{transaction.date}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.time}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.note}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
