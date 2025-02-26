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
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}>
      <Card className="overflow-hidden cursor-pointer">
        <CardContent className="p-0">
          <div className="relative h-48">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} layout="fill" objectFit="cover" />
          </div>
          <motion.div
            className="p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
            <motion.p
              className="mt-2 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ${product.price.toFixed(2)}
            </motion.p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

