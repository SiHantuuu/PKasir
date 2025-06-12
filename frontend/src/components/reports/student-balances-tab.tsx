'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface Student {
  id: number;
  NIS: string;
  NISN: string;
  Nama: string;
  username: string;
  Balance: number;
  is_active: boolean;
}

interface StudentBalancesData {
  students: Student[];
  statistics: {
    total_students: number;
    total_balance: number;
    average_balance: number;
    min_balance: number;
    max_balance: number;
  };
  balance_distribution: Array<{
    range: string;
    count: number;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface StudentBalancesTabProps {
  data: StudentBalancesData | null;
  loading: boolean;
  onRefresh: () => void;
}

export function StudentBalancesTab({
  data,
  loading,
  onRefresh,
}: StudentBalancesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Balance');
  const [sortOrder, setSortOrder] = useState('DESC');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredStudents =
    data?.students.filter(
      (student) =>
        student.Nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.NIS?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
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
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.total_students.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.statistics.total_balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.statistics.average_balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Highest Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.statistics.max_balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Lowest Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.statistics.min_balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Distribution</CardTitle>
          <CardDescription>
            Distribution of student balances across ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.balance_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Students']} />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Balances</CardTitle>
          <CardDescription>
            Detailed list of all student balances
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Balance">Balance</SelectItem>
                <SelectItem value="Nama">Name</SelectItem>
                <SelectItem value="NIS">NIS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">High to Low</SelectItem>
                <SelectItem value="ASC">Low to High</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onRefresh} variant="outline">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{student.Nama}</span>
                    {!student.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    NIS: {student.NIS || 'N/A'} • Username: {student.username}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(student.Balance)}
                  </div>
                  <div
                    className={`text-xs ${
                      student.Balance > 0
                        ? 'text-green-600'
                        : student.Balance < 0
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {student.Balance > 0
                      ? 'Active'
                      : student.Balance < 0
                      ? 'Negative'
                      : 'Zero'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
