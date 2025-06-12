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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BestSellingProduct {
  product_id: number;
  product_name: string;
  category: string;
  current_price: number;
  current_stock: number;
  total_sold: number;
  transaction_count: number;
  total_revenue: number;
  average_per_transaction: number;
}

interface PopularCategory {
  category_id: number;
  category_name: string;
  total_items_sold: number;
  total_transactions: number;
  unique_products: number;
  total_revenue: number;
  average_per_transaction: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
  }>;
}

interface ProductAnalyticsData {
  bestSellingProducts: BestSellingProduct[];
  popularCategories: PopularCategory[];
}

interface ProductAnalyticsTabProps {
  data: ProductAnalyticsData | null;
  loading: boolean;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

export function ProductAnalyticsTab({
  data,
  loading,
}: ProductAnalyticsTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
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
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Best Selling Products</TabsTrigger>
          <TabsTrigger value="categories">Popular Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Best Selling Products Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Best Selling Products</CardTitle>
              <CardDescription>
                Top performing products by quantity sold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={data.bestSellingProducts.slice(0, 10)}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="product_name"
                    width={150}
                    tickFormatter={(name) =>
                      name.length > 20 ? name.substring(0, 20) + '...' : name
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'total_sold'
                        ? `${value} sold`
                        : formatCurrency(Number(value)),
                      name === 'total_sold' ? 'Quantity' : 'Revenue',
                    ]}
                  />
                  <Bar dataKey="total_sold" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Details</CardTitle>
              <CardDescription>
                Detailed breakdown of best selling products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.bestSellingProducts.slice(0, 10).map((product, index) => (
                  <div
                    key={product.product_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">
                          {product.product_name}
                        </span>
                        {product.category && (
                          <Badge variant="secondary">{product.category}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current Price: {formatCurrency(product.current_price)} •
                        Stock: {product.current_stock} •
                        {product.transaction_count} transactions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {product.total_sold} sold
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(product.total_revenue)} revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {/* Category Performance Chart */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Sales Distribution</CardTitle>
                <CardDescription>
                  Sales distribution by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.popularCategories.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category_name, percent }) =>
                        `${category_name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_items_sold"
                    >
                      {data.popularCategories
                        .slice(0, 6)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} items`, 'Sold']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Revenue</CardTitle>
                <CardDescription>Revenue by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.popularCategories.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category_name"
                      tickFormatter={(name) =>
                        name.length > 10 ? name.substring(0, 10) + '...' : name
                      }
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(1)}M`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        'Revenue',
                      ]}
                    />
                    <Bar dataKey="total_revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Details */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance Details</CardTitle>
              <CardDescription>
                Detailed breakdown of popular categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.popularCategories.slice(0, 5).map((category, index) => (
                  <div
                    key={category.category_id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-semibold text-lg">
                          {category.category_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {category.total_items_sold} items sold
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(category.total_revenue)} revenue
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Transactions:
                        </span>
                        <div className="font-medium">
                          {category.total_transactions}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Unique Products:
                        </span>
                        <div className="font-medium">
                          {category.unique_products}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Avg per Transaction:
                        </span>
                        <div className="font-medium">
                          {category.average_per_transaction.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {category.top_products &&
                      category.top_products.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Top Products:</h4>
                          <div className="flex flex-wrap gap-2">
                            {category.top_products.map((product) => (
                              <Badge
                                key={product.product_id}
                                variant="secondary"
                              >
                                {product.product_name} ({product.total_sold})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
