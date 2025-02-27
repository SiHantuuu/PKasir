"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <div className="h-screen w-screen bg-white p-4 flex items-center justify-center overflow-hidden">
      <motion.div
        className="w-full h-full max-w-7xl max-h-[800px] border rounded-3xl p-8 shadow-lg flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="text-3xl font-bold mb-6" variants={itemVariants}>
          Add New Product
        </motion.h1>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
          <div className="flex-grow grid grid-cols-5 gap-8">
            {/* Left Column - Image Upload */}
            <motion.div className="col-span-2 flex flex-col" variants={itemVariants}>
              <Label htmlFor="image" className="text-lg font-medium mb-2 block">
                Product Image
              </Label>
              <motion.div
                className="flex-grow relative bg-gray-100 rounded-2xl overflow-hidden"
                whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                transition={{ duration: 0.2 }}
              >
                <Image src={image || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
              </motion.div>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 w-full bg-white border-2 rounded-xl py-3 text-lg font-semibold text-center hover:bg-gray-50 transition-colors"
                >
                  Choose Image
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Column - Form Fields */}
            <div className="col-span-3 flex flex-col justify-center space-y-6">
              <motion.div variants={itemVariants}>
                <Label htmlFor="name" className="text-lg font-medium mb-2 block">
                  Product Name
                </Label>
                <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter product name"
                    className="w-full border-2 rounded-xl px-4 py-3 text-lg"
                    required
                  />
                </motion.div>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Label htmlFor="price" className="text-lg font-medium mb-2 block">
                  Price
                </Label>
                <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter product price"
                    step="0.01"
                    className="w-full border-2 rounded-xl px-4 py-3 text-lg"
                    required
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <motion.div className="flex justify-between pt-6 mt-6 border-t-2" variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/Product")}
                className="px-6 py-3 border-2 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
              <Button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Add Product
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}

