'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Grid, List, Plus, Search, Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for products with images
  const products = [
    {
      id: 1,
      name: 'Nasi Goreng',
      price: 15000,
      category: 'Makanan',
      stock: 50,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 2,
      name: 'Es Teh',
      price: 5000,
      category: 'Minuman',
      stock: 100,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 3,
      name: 'Buku Tulis',
      price: 7000,
      category: 'Alat Tulis',
      stock: 200,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 4,
      name: 'Pensil 2B',
      price: 3000,
      category: 'Alat Tulis',
      stock: 150,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 5,
      name: 'Roti',
      price: 8000,
      category: 'Makanan',
      stock: 75,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 6,
      name: 'Air Mineral',
      price: 4000,
      category: 'Minuman',
      stock: 200,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 7,
      name: 'Penghapus',
      price: 2000,
      category: 'Alat Tulis',
      stock: 100,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 8,
      name: 'Mie Goreng',
      price: 12000,
      category: 'Makanan',
      stock: 40,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 9,
      name: 'Jus Jeruk',
      price: 7000,
      category: 'Minuman',
      stock: 80,
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      id: 10,
      name: 'Penggaris',
      price: 5000,
      category: 'Alat Tulis',
      stock: 120,
      image: '/placeholder.svg?height=200&width=200',
    },
  ];

  // Extract unique categories for the filter
  const categories = [...new Set(products.map((product) => product.category))];

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
            <h1 className="text-lg font-semibold">Product Management</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-full md:w-64 lg:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full rounded-lg bg-background pl-8 md:w-64 lg:w-80"
              />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <Tag className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) =>
                  value && setViewMode(value as 'grid' | 'list')
                }
              >
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <Grid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage products, categories, and inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === 'list' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>
                          <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {product.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          Rp {product.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.stock > 50
                                ? 'bg-green-100 text-green-800'
                                : product.stock > 20
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square w-full">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">
                            {product.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800"
                          >
                            {product.category}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1 text-lg font-semibold">
                          Rp {product.price.toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between border-t p-4 pt-2">
                        <div>
                          <Badge
                            variant="outline"
                            className={`${
                              product.stock > 50
                                ? 'bg-green-100 text-green-800'
                                : product.stock > 20
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            Stock: {product.stock}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            Delete
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">20</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="px-4">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="px-4">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
