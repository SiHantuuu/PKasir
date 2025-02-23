"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ITEMS_PER_PAGE = 8

export default function Page() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [newCategory, setNewCategory] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)

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
    // Here you would typically send the new category to your API
    console.log("New category created:", newCategory)
    setNewCategory("")
    setIsDialogOpen(false)
    // After creating the category, you might want to refresh the list of categories
  }

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesCategory =
        selectedCategory === undefined || selectedCategory === "All" || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    setFilteredProducts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [selectedCategory, searchQuery])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-3">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Products</h1>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
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
                <Button variant="outline">New Category</Button>
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
            <Button onClick={() => router.push("/Product/new")}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Item
            </Button>
          </div>
        </header>
        <main className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => router.push(`/Product/${product.id}`)}
                onDelete={() => console.log(`Delete product ${product.id}`)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {renderPageNumbers()}
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

