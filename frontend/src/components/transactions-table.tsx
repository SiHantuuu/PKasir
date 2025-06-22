import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';

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

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'topup':
        return 'default';
      case 'purchase':
        return 'secondary';
      case 'penalty':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-mono">#{transaction.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {transaction.customer?.Nama || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.customer?.NIS || 'No NIS'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    getTransactionTypeColor(transaction.Transaction_type) as any
                  }
                >
                  {transaction.Transaction_type}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(transaction.total_amount)}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(transaction.status) as any}>
                  {transaction.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(transaction.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
