"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation";


export default function Page() {
  // Sample product data
  const router = useRouter();

  const products = [
    { id: 1, name: "Product 1", price: 19.99, image: "/placeholder.svg" },
    { id: 2, name: "Product 2", price: 29.99, image: "/placeholder.svg" },
    { id: 3, name: "Product 3", price: 39.99, image: "/placeholder.svg" },
    { id: 4, name: "Product 4", price: 49.99, image: "/placeholder.svg" },
    { id: 5, name: "Product 5", price: 59.99, image: "/placeholder.svg" },
    { id: 6, name: "Product 6", price: 69.99, image: "/placeholder.svg" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Products</h1>
            <SidebarTrigger />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Item
          </Button>
        </header>
        <main className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => router.push(`/Product/${product.id}`)}
                onDelete={() => console.log(`Delete product ${product.id}`)}
              />
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

