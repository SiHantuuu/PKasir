"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

const ITEMS_PER_PAGE = 8 // Changed back to 8 products per page

export default function Page() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [newCategory, setNewCategory] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pageDirection, setPageDirection] = useState(0)

  // Sample product data
  const products = [
    { id: 1, name: "Product 1", price: 19.99, image: "/placeholder.svg", category: "Electronics" },
    { id: 2, name: "Product 2", price: 29.99, image: "/placeholder.svg", category: "Clothing" },
    { id: 3, name: "Product 3", price: 39.99, image: "/placeholder.svg", category: "Home" },
    { id: 4, name: "Product 4", price: 49.99, image: "/placeholder.svg", category: "Electronics" },
    { id: 5, name: "Product 5", price: 59.99, image: "/placeholder.svg", category: "Clothing" },
    { id: 6, name: "Product 6", price: 69.99, image: "/placeholder.svg", category: "Home" },
    { id: 7, name: "Product 7", price: 79.99, image: "/placeholder.svg", category: "Electronics" },
    { id: 8, name: "Product 8", price: 89.99, image: "/placeholder.svg", category: "Clothing" },
    { id: 9, name: "Product 9", price: 99.99, image: "/placeholder.svg", category: "Home" },
    { id: 10, name: "Product 10", price: 109.99, image: "/placeholder.svg", category: "Electronics" },
    { id: 11, name: "Product 11", price: 119.99, image: "/placeholder.svg", category: "Clothing" },
    { id: 12, name: "Product 12", price: 129.99, image: "/placeholder.svg", category: "Home" },
    { id: 13, name: "Product 13", price: 139.99, image: "/placeholder.svg", category: "Electronics" },
    { id: 14, name: "Product 14", price: 149.99, image: "/placeholder.svg", category: "Clothing" },
    { id: 15, name: "Product 15", price: 159.99, image: "/placeholder.svg", category: "Home" },
    { id: 16, name: "Product 16", price: 169.99, image: "/placeholder.svg", category: "Electronics" },
    { id: 17, name: "Product 17", price: 179.99, image: "/placeholder.svg", category: "Clothing" },
    { id: 18, name: "Product 18", price: 189.99, image: "/placeholder.svg", category: "Home" },
  ]

  // Sample categories
  const categories = ["All", "Electronics", "Clothing", "Home"]

  const handleCreateCategory = () => {
    console.log("New category created:", newCategory)
    setNewCategory("")
    setIsDialogOpen(false)
  }

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesCategory =
        selectedCategory === undefined || selectedCategory === "All" || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setPageDirection(page > currentPage ? 1 : -1)
    setCurrentPage(page)
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleDeleteProduct = (productId: number) => {
    console.log(`Delete product ${productId}`)
    setIsEditDialogOpen(false)
    // Here you would typically delete the product from your data source
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedProduct) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedProduct({
          ...selectedProduct,
          image: event.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <Button key={i} variant={currentPage === i ? "default" : "outline"} onClick={() => handlePageChange(i)}>
            {i}
          </Button>,
        )
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      if (startPage > 1) {
        pageNumbers.push(
          <Button key={1} variant="outline" onClick={() => handlePageChange(1)}>
            1
          </Button>,
        )
        if (startPage > 2) {
          pageNumbers.push(<span key="ellipsis1">...</span>)
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <Button key={i} variant={currentPage === i ? "default" : "outline"} onClick={() => handlePageChange(i)}>
            {i}
          </Button>,
        )
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push(<span key="ellipsis2">...</span>)
        }
        pageNumbers.push(
          <Button key={totalPages} variant="outline" onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </Button>,
        )
      }
    }

    return pageNumbers
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="flex h-16 shrink-0 items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg w-full sticky top-0 z-40"
          >
            <div className="flex items-center px-6">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mx-4 h-4" />
              <motion.h1
                className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Products
              </motion.h1>
            </div>
            <div className="flex-1 flex justify-end items-center space-x-4 px-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-[200px] bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2"
              >
                <Select onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px] bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md"
                    >
                      New Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateCategory}>Create Category</Button>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => router.push("/Product/new")} className="bg-primary text-primary-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> New Item
                </Button>
              </motion.div>
            </div>
          </motion.header>

          {/* Main content */}
          <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: pageDirection * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: pageDirection * -50 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              >
                {paginatedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 p-2 flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {renderPageNumbers()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarInset>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4 py-4"
            >
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  value={selectedProduct.price}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number.parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  value={selectedProduct.category}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image
                </Label>
                <div className="col-span-3">
                  <Image
                    src={selectedProduct.image || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    width={100}
                    height={100}
                    className="mb-2 rounded-md"
                  />
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="mr-2 h-4 w-4" /> Change Image
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex justify-between"
          >
            <Button onClick={() => setIsEditDialogOpen(false)}>Save Changes</Button>
            <Button variant="destructive" onClick={() => handleDeleteProduct(selectedProduct.id)}>
              Delete Product
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

