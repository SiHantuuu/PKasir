"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number') return 'Harga tidak tersedia';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg">
      <CardContent className="p-0">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{product.name || "Produk Tanpa Nama"}</h3>
          {product.category && (
            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="font-bold text-primary">{formatPrice(product.price)}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-medium"
            >
              Lihat Detail
            </motion.button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}