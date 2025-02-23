"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

// Definisi tipe produk
interface Product {
  id: number
  name: string
  price: number
  image: string
}

export default function ProductEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")

  useEffect(() => {
    // Contoh data produk (gantilah dengan API jika ada)
    const products: Product[] = [
      { id: 1, name: "Product 1", price: 19.99, image: "/placeholder.svg" },
      { id: 2, name: "Product 2", price: 29.99, image: "/placeholder.svg" },
      { id: 3, name: "Product 3", price: 39.99, image: "/placeholder.svg" },
      { id: 4, name: "Product 4", price: 49.99, image: "/placeholder.svg" },
      { id: 5, name: "Product 5", price: 59.99, image: "/placeholder.svg" },
      { id: 6, name: "Product 6", price: 69.99, image: "/placeholder.svg" },
    ]
    const foundProduct = products.find((p) => p.id === Number(id))
    if (foundProduct) {
      setProduct(foundProduct)
      setName(foundProduct.name)
      setPrice(foundProduct.price.toString())
      setImage(foundProduct.image)
    }
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the updated product data to your API
    console.log("Updated product:", { ...product, name, price: Number.parseFloat(price), image })
    // After successful update, navigate back to the product list
    router.push("/")
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
              <Label htmlFor="image">URL Gambar</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="URL gambar produk"
              />
            </div>
            <div className="pt-4">
              <Image
                src={image || "/placeholder.svg"}
                alt={name}
                width={200}
                height={200}
                className="rounded-lg object-cover"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Kembali
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Simpan Perubahan
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

