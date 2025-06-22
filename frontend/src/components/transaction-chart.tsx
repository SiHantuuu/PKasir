import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface TransactionSummaryData {
  by_transaction_type: {
    [key: string]: {
      count: number;
      total_amount: number;
      average_amount: number;
    };
  };
  daily_breakdown?: Array<{
    date: string;
    transaction_count: number;
    total_amount: number;
  }>;
}

interface TransactionChartProps {
  data: TransactionSummaryData | null;
}

export function TransactionChart({ data }: TransactionChartProps) {
  if (!data || !data.by_transaction_type) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No transaction data available
      </div>
    );
  }

  // Transform the API data into chart format
  const chartData = Object.entries(data.by_transaction_type).map(
    ([type, stats]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
      count: stats.count,
      amount: stats.total_amount,
      averageAmount: stats.average_amount,
    })
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-sm">
            <span className="text-blue-600">Count: </span>
            {payload[0].value} transactions
          </p>
          <p className="text-sm">
            <span className="text-green-600">Total: </span>
            {formatCurrency(payload[1].value)}
          </p>
          <p className="text-sm">
            <span className="text-orange-600">Average: </span>
            {formatCurrency(payload[0].payload.averageAmount)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="count"
          fill="#3b82f6"
          name="Transaction Count"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="right"
          dataKey="amount"
          fill="#10b981"
          name="Total Amount (IDR)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
