'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Wallet,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  overview: {
    total_transactions: number;
    total_amount: number;
    average_transaction: number;
  };
  transactions: {
    summary: Record<string, { count: number; total_amount: number }>;
    recent_activity: Array<{
      id: number;
      type: string;
      customer_name: string;
      amount: number;
      time_ago: string;
    }>;
    hourly_pattern: Array<{ hour: number; transactions: number }>;
  };
  students: {
    total_students: number;
    total_balance: number;
    average_balance: number;
    students_with_balance: number;
    balance_distribution: Array<{ label: string; value: number }>;
  };
  products: {
    top_selling: Array<{
      product_name: string;
      total_sold: number;
    }>;
  };
  quick_stats: Array<{
    label: string;
    value: string | number;
    icon: string;
    color: string;
  }>;
}

interface DashboardOverviewProps {
  data: DashboardData | null;
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function DashboardOverview({ data, loading }: DashboardOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'wallet':
        return <Wallet className="h-4 w-4" />;
      case 'shopping-cart':
        return <ShoppingCart className="h-4 w-4" />;
      case 'trending-up':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.quick_stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              {getIconComponent(stat.icon)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof stat.value === 'number'
                  ? stat.value.toLocaleString('id-ID')
                  : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Hourly Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Pattern</CardTitle>
            <CardDescription>Hourly transaction distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.transactions.hourly_pattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                <YAxis />
                <Tooltip
                  labelFormatter={(hour) => `${hour}:00`}
                  formatter={(value) => [value, 'Transactions']}
                />
                <Bar dataKey="transactions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Balance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Student Balance Distribution</CardTitle>
            <CardDescription>Distribution of student balances</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.students.balance_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) =>
                    `${label} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.students.balance_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Products */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.transactions.recent_activity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {activity.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.type} • {activity.time_ago}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(activity.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.products.top_selling.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {product.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.total_sold} sold
                    </p>
                  </div>
                  <div className="text-sm font-medium">#{index + 1}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
