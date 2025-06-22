import { Progress } from '@/components/ui/progress';

interface BestSellingProduct {
  product_id: number;
  product_name: string;
  category: string;
  total_sold: number;
  total_revenue: number;
}

interface TopProductsProps {
  products: BestSellingProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No product data available
      </div>
    );
  }

  const maxSold = Math.max(...products.map((p) => p.total_sold));

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.product_id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium leading-none">
                {product.product_name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {product.category || 'No Category'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{product.total_sold} sold</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(product.total_revenue)}
              </p>
            </div>
          </div>
          <Progress
            value={(product.total_sold / maxSold) * 100}
            className="h-2"
          />
        </div>
      ))}
    </div>
  );
}
