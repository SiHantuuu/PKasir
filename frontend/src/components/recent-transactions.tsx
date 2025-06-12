import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'topup':
        return 'bg-green-100 text-green-800';
      case 'purchase':
        return 'bg-blue-100 text-blue-800';
      case 'penalty':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent transactions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center space-x-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {transaction.customer?.Nama?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.customer?.Nama || 'Unknown User'}
            </p>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={`text-xs ${getTransactionTypeColor(
                  transaction.Transaction_type
                )}`}
              >
                {transaction.Transaction_type}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {formatCurrency(transaction.total_amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {transaction.customer?.NIS || 'No NIS'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
