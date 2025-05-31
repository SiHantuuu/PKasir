"use client"

import { useState, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Grid, List, Plus, Search, Tag, Trash2, Edit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
  image: string
}

interface Category {
  id: number
  name: string
}

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: null as File | null,
  })
  const [categoryForm, setCategoryForm] = useState({
    name: "",
  })

  // Mock data for products with images
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Nasi Goreng",
      price: 15000,
      category: "Makanan",
      stock: 50,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 2,
      name: "Es Teh",
      price: 5000,
      category: "Minuman",
      stock: 100,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 3,
      name: "Buku Tulis",
      price: 7000,
      category: "Alat Tulis",
      stock: 200,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 4,
      name: "Pensil 2B",
      price: 3000,
      category: "Alat Tulis",
      stock: 150,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 5,
      name: "Roti",
      price: 8000,
      category: "Makanan",
      stock: 75,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 6,
      name: "Air Mineral",
      price: 4000,
      category: "Minuman",
      stock: 200,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 7,
      name: "Penghapus",
      price: 2000,
      category: "Alat Tulis",
      stock: 100,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 8,
      name: "Mie Goreng",
      price: 12000,
      category: "Makanan",
      stock: 40,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 9,
      name: "Jus Jeruk",
      price: 7000,
      category: "Minuman",
      stock: 80,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 10,
      name: "Penggaris",
      price: 5000,
      category: "Alat Tulis",
      stock: 120,
      image: "/placeholder.svg?height=200&width=200",
    },
  ])

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Makanan" },
    { id: 2, name: "Minuman" },
    { id: 3, name: "Alat Tulis" },
  ])

  // Extract unique categories for the filter
  const uniqueCategories = [...new Set(products.map((product) => product.category))]

  // Filtered products based on search query and selected category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const handleAddProduct = () => {
    if (productForm.name && productForm.price && productForm.category && productForm.stock) {
      const newProduct: Product = {
        id: products.length + 1,
        name: productForm.name,
        price: Number.parseInt(productForm.price),
        category: productForm.category,
        stock: Number.parseInt(productForm.stock),
        image: productForm.image ? URL.createObjectURL(productForm.image) : "/placeholder.svg?height=200&width=200",
      }
      setProducts([...products, newProduct])
      setProductForm({ name: "", price: "", category: "", stock: "", image: null })
      setIsAddProductOpen(false)
    }
  }

  const handleEditProduct = () => {
    if (selectedProduct && productForm.name && productForm.price && productForm.category && productForm.stock) {
      const updatedProducts = products.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              name: productForm.name,
              price: Number.parseInt(productForm.price),
              category: productForm.category,
              stock: Number.parseInt(productForm.stock),
              image: productForm.image ? URL.createObjectURL(productForm.image) : product.image,
            }
          : product,
      )
      setProducts(updatedProducts)
      setProductForm({ name: "", price: "", category: "", stock: "", image: null })
      setSelectedProduct(null)
      setIsEditProductOpen(false)
    }
  }

  const handleDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter((product) => product.id !== productToDelete.id))
      setProductToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleAddCategory = () => {
    if (categoryForm.name) {
      const newCategory: Category = {
        id: categories.length + 1,
        name: categoryForm.name,
      }
      setCategories([...categories, newCategory])
      setCategoryForm({ name: "" })
      setIsAddCategoryOpen(false)
    }
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: null,
    })
    setIsEditProductOpen(true)
  }

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  const resetProductForm = () => {
    setProductForm({ name: "", price: "", category: "", stock: "", image: null })
  }

  const resetCategoryForm = () => {
    setCategoryForm({ name: "" })
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
  }

  return (
    <SidebarProvider>
      <AppSidebar isLoggedIn={true} isAdmin={true} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-6" />
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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" className="h-9" onClick={() => setIsAddProductOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <Button variant="outline" size="sm" className="h-9" onClick={() => setIsAddCategoryOpen(true)}>
                <Tag className="mr-2 h-4 w-4" />
                Add Category
              </Button>
              {(searchQuery || selectedCategory !== "all") && (
                <Button variant="outline" size="sm" className="h-9" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => value && setViewMode(value as "grid" | "list")}
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
                {filteredProducts.length !== products.length && (
                  <span className="ml-2 text-sm">
                    (Showing {filteredProducts.length} of {products.length} products)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No products found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Start by adding your first product"}
                  </p>
                  {(searchQuery || selectedCategory !== "all") && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : viewMode === "list" ? (
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
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {product.category}
                          </span>
                        </TableCell>
                        <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.stock > 50
                                ? "bg-green-100 text-green-800"
                                : product.stock > 20
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square w-full">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{product.name}</CardTitle>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
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
                                ? "bg-green-100 text-green-800"
                                : product.stock > 20
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            Stock: {product.stock}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {filteredProducts.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{Math.min(10, filteredProducts.length)}</span> of{" "}
                    <span className="font-medium">{filteredProducts.length}</span> results
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
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      {/* Add Product Dialog */}
      <Dialog
        open={isAddProductOpen}
        onOpenChange={(open) => {
          setIsAddProductOpen(open)
          if (!open) resetProductForm()
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-price">Price (Rp)</Label>
              <Input
                id="product-price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="Enter price"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-category">Category</Label>
              <Select
                value={productForm.category}
                onValueChange={(value) => setProductForm({ ...productForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                placeholder="Enter stock quantity"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-image">Product Image</Label>
              <Input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(e) => setProductForm({ ...productForm, image: e.target.files?.[0] || null })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={isEditProductOpen}
        onOpenChange={(open) => {
          setIsEditProductOpen(open)
          if (!open) {
            resetProductForm()
            setSelectedProduct(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product information. Fill in all the required fields.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-product-name">Product Name</Label>
              <Input
                id="edit-product-name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-product-price">Price (Rp)</Label>
              <Input
                id="edit-product-price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="Enter price"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-product-category">Category</Label>
              <Select
                value={productForm.category}
                onValueChange={(value) => setProductForm({ ...productForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-product-stock">Stock</Label>
              <Input
                id="edit-product-stock"
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                placeholder="Enter stock quantity"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-product-image">Product Image (optional)</Label>
              <Input
                id="edit-product-image"
                type="file"
                accept="image/*"
                onChange={(e) => setProductForm({ ...productForm, image: e.target.files?.[0] || null })}
              />
              <p className="text-xs text-muted-foreground">Leave empty to keep current image</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct}>Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog
        open={isAddCategoryOpen}
        onOpenChange={(open) => {
          setIsAddCategoryOpen(open)
          if (!open) resetCategoryForm()
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new product category for better organization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{productToDelete?.name}" from your
              inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
