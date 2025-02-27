"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    image: string
    category: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.03, // Added scale for zoom effect
      }}
      transition={{
        type: "tween",
        ease: "easeInOut",
        duration: 0.3,
      }}
    >
      <Card className="overflow-hidden cursor-pointer">
        <CardContent className="p-0">
          <div className="relative h-48">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white font-semibold text-sm">View Details</p>
            </motion.div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
            <p className="mt-2 font-bold">${product.price.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

