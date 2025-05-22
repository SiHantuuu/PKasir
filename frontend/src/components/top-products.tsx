import { Package, Coffee, Book, Apple, Utensils } from "lucide-react"

export function TopProducts() {
  // Mock data for top products
  const products = [
    {
      id: 1,
      name: "Nasi Goreng",
      category: "Makanan",
      sales: 95,
      icon: Utensils,
    },
    {
      id: 2,
      name: "Es Teh",
      category: "Minuman",
      sales: 87,
      icon: Coffee,
    },
    {
      id: 3,
      name: "Buku Tulis",
      category: "Alat Tulis",
      sales: 76,
      icon: Book,
    },
    {
      id: 4,
      name: "Roti",
      category: "Makanan",
      sales: 68,
      icon: Apple,
    },
    {
      id: 5,
      name: "Pensil 2B",
      category: "Alat Tulis",
      sales: 52,
      icon: Package,
    },
  ]

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
            <product.icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          <div className="ml-auto font-medium">{product.sales} sales</div>
        </div>
      ))}
    </div>
  )
}
