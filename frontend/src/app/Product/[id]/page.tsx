"use client"

import type React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { X, Upload, Save } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
}

export default function ProductEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [category, setCategory] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const categories = ["Electronics", "Clothing", "Home"]

  useEffect(() => {
    setIsVisible(true)
    // Fetch product data (replace with API call in real application)
    const products: Product[] = [
      { id: 1, name: "Product 1", price: 19.99, image: "/placeholder.svg", category: "Electronics" },
      { id: 2, name: "Product 2", price: 29.99, image: "/placeholder.svg", category: "Clothing" },
      { id: 3, name: "Product 3", price: 39.99, image: "/placeholder.svg", category: "Home" },
      { id: 4, name: "Product 4", price: 49.99, image: "/placeholder.svg", category: "Electronics" },
      { id: 5, name: "Product 5", price: 59.99, image: "/placeholder.svg", category: "Clothing" },
      { id: 6, name: "Product 6", price: 69.99, image: "/placeholder.svg", category: "Home" },
      { id: 7, name: "Product 7", price: 79.99, image: "/placeholder.svg", category: "Electronics" },
      { id: 8, name: "Product 8", price: 89.99, image: "/placeholder.svg", category: "Clothing" },
    ]
    const foundProduct = products.find((p) => p.id === Number(id))
    if (foundProduct) {
      setProduct(foundProduct)
      setName(foundProduct.name)
      setPrice(foundProduct.price.toString())
      setImage(foundProduct.image)
      setCategory(foundProduct.category)
    }
  }, [id])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the updated product data to your API
    console.log("Updated product:", { ...product, name, price: Number.parseFloat(price), image, category })
    // After successful update, navigate back to the product list
    router.push("/Product")
  }

  if (!product) {
    return (
      <motion.div
        className="flex items-center justify-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <p className="text-2xl font-semibold">Loading...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-4xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 rounded-2xl p-8 shadow-lg"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.h1
          className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Edit {product.name}
        </motion.h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image Upload */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Label htmlFor="image" className="text-lg font-medium block">
                Gambar Produk
              </Label>
              <div className="aspect-square w-full relative bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden">
                <Image src={image || "/placeholder.svg"} alt={name} fill className="object-contain" />
              </div>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white dark:bg-gray-700 border-2 rounded-xl py-3 text-lg font-semibold text-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Pilih Gambar
              </Button>
            </motion.div>

            {/* Right Column - Form Fields */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div>
                <Label htmlFor="name" className="text-lg font-medium block mb-2">
                  Nama Produk
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama produk"
                  className="w-full border-2 rounded-xl px-4 py-3 text-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-lg font-medium block mb-2">
                  Harga
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Harga produk"
                  step="0.01"
                  className="w-full border-2 rounded-xl px-4 py-3 text-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-lg font-medium block mb-2">
                  Kategori
                </Label>
                <Select onValueChange={setCategory} value={category}>
                  <SelectTrigger className="w-full border-2 rounded-xl px-4 py-3 text-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </div>

          {/* Bottom Buttons */}
          <motion.div
            className="flex justify-between pt-8 mt-8 border-t-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/Product")}
              className="px-6 py-3 border-2 rounded-xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 mr-2" />
              Kembali
            </Button>
            <Button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-xl text-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              Simpan Perubahan
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  )
}

