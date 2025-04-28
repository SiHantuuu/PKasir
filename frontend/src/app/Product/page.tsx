"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, ChevronLeft, ChevronRight, Upload, BarChart, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import ProductAnalytics from "@/components/product-analytics"
import { useScroll, useSpring } from "framer-motion"
import { categoryService } from "@/services/categoryService"

const ITEMS_PER_PAGE = 8

const ProgressBar = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left" style={{ scaleX }} />
}

function NewItemDialog({ isOpen, onClose, categories }: { isOpen: boolean; onClose: () => void; categories: string[] }) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState("/placeholder.svg")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setName("")
      setPrice("")
      setCategory("")
      setImage("/placeholder.svg")
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("New Item:", { name, price: Number.parseFloat(price), category, image })
    setName("")
    setPrice("")
    setCategory("")
    setImage("/placeholder.svg")
    onClose()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
          className="p-4"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Add New Product
            </DialogTitle>
          </DialogHeader>
          <Separator className="my-4" />
          <motion.div className="grid gap-4 py-4">
            <motion.div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Name
              </Label>
              <Input
                id="new-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
                className="col-span-3"
              />
            </motion.div>
            <motion.div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-price" className="text-right">
                Price
              </Label>
              <Input
                id="new-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter product price"
                step="0.01"
                required
                className="col-span-3"
              />
            </motion.div>
            <motion.div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
            <motion.div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-image" className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <Image
                  src={image || "/placeholder.svg"}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="mb-2 rounded-md"
                />
                <input
                  type="file"
                  id="new-image"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> Choose Image
                </Button>
              </div>
            </motion.div>
          </motion.div>
          <motion.div className="flex justify-end">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleSubmit}>Add Product</Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

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
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("products")
  const [categories, setCategories] = useState<string[]>(["All"])
  const [isLoading, setIsLoading] = useState(false)

  // Sample product data
  const products = [
    { id: 1, name: "Litos", price: 19.99, image: "/images/litos.png", category: "Electronics" },
    { id: 2, name: "Floridina", price: 19.99, image: "/images/floridina.png", category: "Clothing" },
    { id: 3, name: "Cimory UHT Fresh Milk", price: 19.99, image: "/images/cimory_milk.png", category: "Home" },
    { id: 4, name: "Gopek", price: 19.99, image: "/images/gopek.png", category: "Electronics" },
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

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const fetchedCategories = await categoryService.getAllCategories()
        setCategories(["All", ...fetchedCategories.map((cat: any) => cat.name)])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setIsLoading(false)
        setIsPageLoaded(true)
      }
    }

    fetchCategories()
  }, [])

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return
    
    try {
      setIsLoading(true)
      await categoryService.createCategory({ name: newCategory })
      // Refresh categories
      const fetchedCategories = await categoryService.getAllCategories()
      setCategories(["All", ...fetchedCategories.map((cat: any) => cat.name)])
      setNewCategory("")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to create category:", error)
    } finally {
      setIsLoading(false)
    }
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
  }, [selectedCategory, searchQuery, categories])

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
          <motion.div key={`page-${i}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={currentPage === i ? "default" : "outline"}
              onClick={() => handlePageChange(i)}
              className={`${
                currentPage === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-primary/10"
              }`}
            >
              {i}
            </Button>
          </motion.div>,
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
          <motion.div key="page-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={() => handlePageChange(1)}>
              1
            </Button>
          </motion.div>,
        )
        if (startPage > 2) {
          pageNumbers.push(<span key="ellipsis-start">...</span>)
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <motion.div key={`page-${i}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant={currentPage === i ? "default" : "outline"} onClick={() => handlePageChange(i)}>
              {i}
            </Button>
          </motion.div>,
        )
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push(<span key="ellipsis-end">...</span>)
        }
        pageNumbers.push(
          <motion.div key={`page-${totalPages}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={() => handlePageChange(totalPages)}>
              {totalPages}
            </Button>
          </motion.div>,
        )
      }
    }

    return pageNumbers
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProgressBar />
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
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
                {activeTab === "analytics" ? "Product Analytics" : "Products"}
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
                  className="pl-8 w-[200px] bg-white/50 dark:bg-gray-700/50 border-0 shadow-inner"
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
                <Select onValueChange={setSelectedCategory} disabled={isLoading}>
                  <SelectTrigger className="w-[180px] bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md">
                    <SelectValue placeholder={isLoading ? "Loading..." : "Select Category"} />
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
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md"
                        disabled={isLoading}
                      >
                        New Category
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="p-4"
                    >
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          Create New Category
                        </DialogTitle>
                      </DialogHeader>
                      <Separator className="my-4" />
                      <motion.div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="col-span-3"
                            disabled={isLoading}
                          />
                        </div>
                      </motion.div>
                      <motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={handleCreateCategory} 
                            className="w-full"
                            disabled={isLoading || !newCategory.trim()}
                          >
                            {isLoading ? "Creating..." : "Create Category"}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </DialogContent>
                </Dialog>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => setIsNewItemDialogOpen(true)} 
                    className="bg-primary text-primary-foreground"
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> New Item
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.header>

          {/* Main content with tabs */}
          <Tabs defaultValue="products" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="mx-6 mt-4 bg-transparent">
              <AnimatePresence mode="wait">
                {["products", "analytics"].map((tab) => (
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsTrigger
                      value={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`${
                        activeTab === tab
                          ? "bg-white/80 dark:bg-gray-800/80 text-primary"
                          : "bg-transparent text-foreground"
                      } transition-all duration-300 ease-in-out`}
                    >
                      {tab === "products" ? (
                        <ShoppingCart className="w-4 h-4 mr-2" />
                      ) : (
                        <BarChart className="w-4 h-4 mr-2" />
                      )}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabsTrigger>
                  </motion.div>
                ))}
              </AnimatePresence>
            </TabsList>

            <TabsContent value="products" className="flex-1 overflow-auto p-4 mt-2">
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
                      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleProductClick(product)}
                      className="shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 overflow-auto p-4 mt-2">
              <ProductAnalytics products={products} />
            </TabsContent>

            {/* Footer with pagination */}
            <AnimatePresence>
              {activeTab === "products" && totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.5 }}
                  className="p-4 flex justify-center items-center space-x-2 mt-auto"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  {renderPageNumbers()}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </SidebarInset>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="p-4"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Edit Product
              </DialogTitle>
            </DialogHeader>
            <Separator className="my-4" />
            {selectedProduct && (
              <motion.div className="grid gap-4 py-4">
                <motion.div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                    className="col-span-3"
                  />
                </motion.div>
                <motion.div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    value={selectedProduct.price}
                    onChange={(e) => {
                      const value = e.target.value
                      setSelectedProduct({
                        ...selectedProduct,
                        price: value === "" ? "" : Number.parseFloat(value) || 0,
                      })
                    }}
                    className="col-span-3"
                  />
                </motion.div>
                <motion.div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={selectedProduct.category}
                    onValueChange={(value) => setSelectedProduct({ ...selectedProduct, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
                <motion.div className="grid grid-cols-4 items-center gap-4">
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
                </motion.div>
              </motion.div>
            )}
            <motion.div className="flex justify-between">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="destructive" onClick={() => handleDeleteProduct(selectedProduct.id)}>
                  Delete Product
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => setIsEditDialogOpen(false)}>Save Changes</Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
      <NewItemDialog 
        isOpen={isNewItemDialogOpen} 
        onClose={() => setIsNewItemDialogOpen(false)} 
        categories={categories}
      />
    </SidebarProvider>
  )
}