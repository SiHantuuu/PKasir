'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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

interface TransactionSummaryTabProps {
  data: TransactionSummaryData | null;
  loading: boolean;
}

export function TransactionSummaryTab({
  data,
  loading,
}: TransactionSummaryTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-100 text-blue-800';
      case 'topup':
        return 'bg-green-100 text-green-800';
      case 'penalty':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overall_summary.total_transactions.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              All transaction types
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.overall_summary.total_amount)}
            </div>
            <p className="text-xs text-muted-foreground">Combined value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.overall_summary.average_per_transaction)}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Types</CardTitle>
          <CardDescription>Breakdown by transaction type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.by_transaction_type).map(([type, details]) => (
              <div key={type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getTransactionTypeColor(type)}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                  <span className="text-sm font-medium">
                    {details.count} txns
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {formatCurrency(details.total_amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(details.average_amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Transaction Trend</CardTitle>
          <CardDescription>
            Transaction count and amount over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.daily_breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString('id-ID', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                labelFormatter={(date) =>
                  new Date(date).toLocaleDateString('id-ID')
                }
                formatter={(value, name) => [
                  name === 'transaction_count'
                    ? value
                    : formatCurrency(Number(value)),
                  name === 'transaction_count' ? 'Transactions' : 'Amount',
                ]}
              />
              <Bar
                yAxisId="left"
                dataKey="transaction_count"
                fill="#8884d8"
                name="transaction_count"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="total_amount"
                stroke="#82ca9d"
                name="total_amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
