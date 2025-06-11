'use client';

import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
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

import {
  Grid,
  List,
  Plus,
  Search,
  Tag,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
// Remove this line:
// import { toast } from "@/hooks/use-toast"

interface Product {
  id: number;
  Nama: string;
  Harga: number;
  Stok: number;
  Category_id?: number;
  category?: {
    id: number;
    Nama: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: number;
  Nama: string;
  productCount?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface CategoriesResponse {
  categories: Category[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Form states
  const [productForm, setProductForm] = useState({
    Nama: '',
    Harga: '',
    Stok: '',
    Category_id: '',
  });
  const [categoryForm, setCategoryForm] = useState({
    Nama: '',
  });

  // Enhanced error handling
  const handleApiError = (error: any, defaultMessage: string) => {
    console.error('API Error:', error);
    let errorMessage = defaultMessage;

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    setError(errorMessage);
    toast.error(errorMessage);
  };

  // Product API functions with enhanced error handling
  const fetchProducts = async (page = 1, search = '', categoryId = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        includeCategory: 'true',
        ...(search && { search }),
        ...(categoryId && categoryId !== 'all' && { category_id: categoryId }),
      });

      const response = await fetch(`${API_BASE_URL}/products?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: ApiResponse<ProductsResponse> = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      handleApiError(err, 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Nama: productData.Nama,
          Harga: productData.Harga,
          Stok: productData.Stok,
          Category_id: productData.Category_id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      if (data.success) {
        await fetchProducts(currentPage, searchQuery, selectedCategoryFilter);
        toast.success('Product created successfully');
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      handleApiError(err, 'Failed to create product');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Nama: productData.Nama,
          Harga: productData.Harga,
          Stok: productData.Stok,
          Category_id: productData.Category_id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      if (data.success) {
        await fetchProducts(currentPage, searchQuery, selectedCategoryFilter);
        toast.success('Product updated successfully');
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      handleApiError(err, 'Failed to update product');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (id: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      if (data.success) {
        await fetchProducts(currentPage, searchQuery, selectedCategoryFilter);
        toast.success('Product deleted successfully');
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      handleApiError(err, 'Failed to delete product');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category API functions
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories?limit=100`);
      if (response.ok) {
        const data: ApiResponse<CategoriesResponse> = await response.json();
        if (data.success) {
          setCategories(data.data.categories);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const createCategory = async (categoryData: { Nama: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create category');
      }

      if (data.success) {
        await fetchCategories();
        toast.success('Category created successfully');
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      handleApiError(err, 'Failed to create category');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCategory = async (id: number, categoryData: { Nama: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update category');
      }

      if (data.success) {
        await fetchCategories();
        toast.success('Category updated successfully');
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      handleApiError(err, 'Failed to update category');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (id: number, force = false) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/categories/${id}?force=${force}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      if (data.success) {
        await fetchCategories();
        await fetchProducts(currentPage, searchQuery, selectedCategoryFilter);
        toast.success('Category deleted successfully');
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      handleApiError(err, 'Failed to delete category');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchProducts(1, '', 'all');
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, searchQuery, selectedCategoryFilter);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedCategoryFilter]);

  // Form validation
  const validateProductForm = () => {
    if (!productForm.Nama.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!productForm.Harga || Number.parseFloat(productForm.Harga) <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (!productForm.Stok || Number.parseInt(productForm.Stok) < 0) {
      toast.error('Valid stock quantity is required');
      return false;
    }
    return true;
  };

  // Handler functions for products
  const handleAddProduct = async () => {
    if (!validateProductForm()) return;

    const success = await createProduct({
      Nama: productForm.Nama.trim(),
      Harga: Number.parseFloat(productForm.Harga),
      Stok: Number.parseInt(productForm.Stok),
      Category_id:
        productForm.Category_id === 'none' || !productForm.Category_id
          ? undefined
          : Number.parseInt(productForm.Category_id),
    });

    if (success) {
      setProductForm({ Nama: '', Harga: '', Stok: '', Category_id: '' });
      setIsAddProductOpen(false);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct || !validateProductForm()) return;

    const success = await updateProduct(selectedProduct.id, {
      Nama: productForm.Nama.trim(),
      Harga: Number.parseFloat(productForm.Harga),
      Stok: Number.parseInt(productForm.Stok),
      Category_id:
        productForm.Category_id === 'none' || !productForm.Category_id
          ? undefined
          : Number.parseInt(productForm.Category_id),
    });

    if (success) {
      setProductForm({ Nama: '', Harga: '', Stok: '', Category_id: '' });
      setSelectedProduct(null);
      setIsEditProductOpen(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        setProductToDelete(null);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  // Handler functions for categories
  const handleAddCategory = async () => {
    if (!categoryForm.Nama.trim()) {
      toast.error('Category name is required');
      return;
    }

    const success = await createCategory({
      Nama: categoryForm.Nama.trim(),
    });

    if (success) {
      setCategoryForm({ Nama: '' });
      setIsAddCategoryOpen(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !categoryForm.Nama.trim()) {
      toast.error('Category name is required');
      return;
    }

    const success = await updateCategory(selectedCategory.id, {
      Nama: categoryForm.Nama.trim(),
    });

    if (success) {
      setCategoryForm({ Nama: '' });
      setSelectedCategory(null);
      setIsEditCategoryOpen(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      const success = await deleteCategory(categoryToDelete.id, true);
      if (success) {
        setCategoryToDelete(null);
        setIsDeleteCategoryDialogOpen(false);
      }
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      Nama: product.Nama,
      Harga: product.Harga.toString(),
      Stok: product.Stok.toString(),
      Category_id: product.Category_id?.toString() || '',
    });
    setIsEditProductOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const openEditCategoryDialog = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      Nama: category.Nama,
    });
    setIsEditCategoryOpen(true);
  };

  const openDeleteCategoryDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryDialogOpen(true);
  };

  const resetProductForm = () => {
    setProductForm({ Nama: '', Harga: '', Stok: '', Category_id: '' });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ Nama: '' });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryFilter(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('all');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, searchQuery, selectedCategoryFilter);
  };

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="h-9"
                onClick={() => setIsAddProductOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setIsAddCategoryOpen(true)}
              >
                <Tag className="mr-2 h-4 w-4" />
                Add Category
              </Button>
              {(searchQuery || selectedCategoryFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedCategoryFilter}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.Nama}
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

          {/* Categories Management Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage product categories ({categories.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 rounded-lg border p-2"
                  >
                    <Badge variant="outline">{category.Nama}</Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditCategoryDialog(category)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteCategoryDialog(category)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage products, categories, and inventory
                <span className="ml-2 text-sm">
                  (Showing {products.length} of {pagination.totalItems}{' '}
                  products)
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Loading products...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No products found
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {searchQuery || selectedCategoryFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Start by adding your first product'}
                  </p>
                  {(searchQuery || selectedCategoryFilter !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : viewMode === 'list' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
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
                        <TableCell className="font-medium">
                          {product.Nama}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800"
                          >
                            {product.category?.Nama || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          Rp {product.Harga.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              product.Stok > 50
                                ? 'bg-green-100 text-green-800'
                                : product.Stok > 20
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.Stok}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(product)}
                          >
                            <Trash2 className="h-4 w-4" />
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
                      <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                        <div className="text-4xl font-bold text-gray-400">
                          {product.Nama.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">
                            {product.Nama}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800"
                          >
                            {product.category?.Nama || 'Uncategorized'}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1 text-lg font-semibold">
                          Rp {product.Harga.toLocaleString('id-ID')}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between border-t p-4 pt-2">
                        <div>
                          <Badge
                            variant="outline"
                            className={`${
                              product.Stok > 50
                                ? 'bg-green-100 text-green-800'
                                : product.Stok > 20
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            Stock: {product.Stok}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {products.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage +
                        1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        pagination.totalItems
                      )}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalItems}</span>{' '}
                    results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === 1}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                    >
                      Previous
                    </Button>
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={
                              pagination.currentPage === page
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            className="px-4"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Add Product Dialog */}
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details for the new product
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="product-name"
                  className="col-span-3"
                  value={productForm.Nama}
                  onChange={(e) =>
                    setProductForm({ ...productForm, Nama: e.target.value })
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-price" className="text-right">
                  Price (Rp)
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  className="col-span-3"
                  value={productForm.Harga}
                  onChange={(e) =>
                    setProductForm({ ...productForm, Harga: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="product-stock"
                  type="number"
                  className="col-span-3"
                  value={productForm.Stok}
                  onChange={(e) =>
                    setProductForm({ ...productForm, Stok: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={productForm.Category_id}
                  onValueChange={(value) =>
                    setProductForm({ ...productForm, Category_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.Nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddProductOpen(false);
                  resetProductForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddProduct} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update the product details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-product-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-product-name"
                  className="col-span-3"
                  value={productForm.Nama}
                  onChange={(e) =>
                    setProductForm({ ...productForm, Nama: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-product-price" className="text-right">
                  Price (Rp)
                </Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  className="col-span-3"
                  value={productForm.Harga}
                  onChange={(e) =>
                    setProductForm({ ...productForm, Harga: e.target.value })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-product-stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="edit-product-stock"
                  type="number"
                  className="col-span-3"
                  value={productForm.Stok}
                  onChange={(e) =>
                    setProductForm({ ...productForm, Stok: e.target.value })
                  }
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-product-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={productForm.Category_id}
                  onValueChange={(value) =>
                    setProductForm({ ...productForm, Category_id: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.Nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditProductOpen(false);
                  setSelectedProduct(null);
                  resetProductForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditProduct} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Category Dialog */}
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Enter the name for the new category
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="category-name"
                  className="col-span-3"
                  value={categoryForm.Nama}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, Nama: e.target.value })
                  }
                  placeholder="Enter category name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddCategoryOpen(false);
                  resetCategoryForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddCategory} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update the category name</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-category-name"
                  className="col-span-3"
                  value={categoryForm.Nama}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, Nama: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditCategoryOpen(false);
                  setSelectedCategory(null);
                  resetCategoryForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditCategory} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Product Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                product "{productToDelete?.Nama}" from the inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setProductToDelete(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Category Confirmation Dialog */}
        <AlertDialog
          open={isDeleteCategoryDialogOpen}
          onOpenChange={setIsDeleteCategoryDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                category "{categoryToDelete?.Nama}" and all products in this
                category will become uncategorized.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteCategoryDialogOpen(false);
                  setCategoryToDelete(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCategory}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Category'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
