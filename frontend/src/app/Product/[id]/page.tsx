"use client"

import type React from "react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

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

  const categories = ["Electronics", "Clothing", "Home"]

  useEffect(() => {
    // Fetch product data (replace with API call in real application)
    const products: Product[] = [
      { id: 1, name: "Product 1", price: 19.99, image: "/placeholder.svg", category: "Electronics" },
      { id: 2, name: "Product 2", price: 29.99, image: "/placeholder.svg", category: "Clothing" },
      { id: 3, name: "Product 3", price: 39.99, image: "/placeholder.svg", category: "Home" },
      { id: 4, name: "Product 4", price: 49.99, image: "/placeholder.svg", category: "Electronics" },
      { id: 5, name: "Product 5", price: 59.99, image: "/placeholder.svg", category: "Clothing" },
      { id: 6, name: "Product 6", price: 69.99, image: "/placeholder.svg", category: "Home" },
      { id: 7, name: "Product 5", price: 79.99, image: "/placeholder.svg", category: "Electronics" },
      { id: 8, name: "Product 6", price: 89.99, image: "/placeholder.svg", category: "Clothing" },
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
    return <p>Loading...</p>
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit {product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama produk" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Harga produk"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="image">Gambar Produk</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                Pilih Gambar
              </Button>
            </div>
            <div className="pt-4">
              {image && (
                <Image
                  src={image || "/placeholder.svg"}
                  alt={name}
                  width={200}
                  height={200}
                  className="rounded-lg object-cover"
                />
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/Product")}>Kembali</Button>
          <Button type="submit" onClick={handleSubmit}>Simpan Perubahan</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
