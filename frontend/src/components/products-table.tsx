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
import { Eye, Edit, Trash2, Package } from 'lucide-react';

interface Product {
  id: number;
  Nama: string;
  Harga: number;
  Stok: number;
  category?: {
    Nama: string;
  };
}

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock <= 10)
      return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No products found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product.Stok);
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{product.Nama}</span>
                  </div>
                </TableCell>
                <TableCell>{product.category?.Nama || 'No Category'}</TableCell>
                <TableCell>{formatCurrency(product.Harga)}</TableCell>
                <TableCell>{product.Stok}</TableCell>
                <TableCell>
                  <Badge variant={stockStatus.variant}>
                    {stockStatus.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
