"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { motion } from "framer-motion"

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("/placeholder.svg")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("New Item:", { name, price: Number.parseFloat(price), image })
    router.push("/Product")
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
    <motion.div
      className="h-screen w-screen bg-white p-4 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full h-full max-w-7xl max-h-[800px] border rounded-3xl p-8 shadow-lg flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Tambah Produk Baru</h1>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
          <div className="flex-grow grid grid-cols-5 gap-8">
            {/* Left Column - Image Upload */}
            <div className="col-span-2 flex flex-col">
              <Label htmlFor="image" className="text-lg font-medium mb-2 block">
                Gambar Produk
              </Label>
              <div className="flex-grow relative bg-gray-100 rounded-2xl overflow-hidden">
                <Image src={image || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
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
                className="mt-4 w-full bg-white border-2 rounded-xl py-3 text-lg font-semibold text-center hover:bg-gray-50 transition-colors"
              >
                Pilih Gambar
              </Button>
            </div>

            {/* Right Column - Form Fields */}
            <div className="col-span-3 flex flex-col justify-center space-y-6">
              <div>
                <Label htmlFor="name" className="text-lg font-medium mb-2 block">
                  Nama Produk
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama produk"
                  className="w-full border-2 rounded-xl px-4 py-3 text-lg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-lg font-medium mb-2 block">
                  Harga
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Harga produk"
                  step="0.01"
                  className="w-full border-2 rounded-xl px-4 py-3 text-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-between pt-6 mt-6 border-t-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/Product")}
              className="px-6 py-3 border-2 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Tambah Produk
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

