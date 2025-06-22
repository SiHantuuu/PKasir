"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Waves } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const handleKasirClick = () => {
    router.push("/Kasir")
  }

  const handleTicketingClick = () => {
    router.push("/Ticketing")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistem Manajemen Pondok</h1>
          <p className="text-lg text-gray-600">Pilih sistem yang ingin Anda akses</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Kasir Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Sistem Kasir</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">Sistem pembayaran dan manajemen produk untuk kantin sekolah</p>
              <Button
                onClick={handleKasirClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                size="lg"
              >
                Akses Kasir
              </Button>
            </CardContent>
          </Card>

          {/* Ticketing Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Waves className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Sistem Ticketing</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">Sistem tiket untuk kolam renang pondok</p>
              <Button
                onClick={handleTicketingClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                size="lg"
              >
                Akses Ticketing
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">© 2024 Sistem Manajemen Pondok. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
