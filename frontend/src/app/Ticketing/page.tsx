"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, User, Waves, Clock, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function TicketingPage() {
  const router = useRouter()
  const [selectedTicketType, setSelectedTicketType] = useState<"member" | "umum" | null>(null)

  const handleBackClick = () => {
    router.push("/")
  }

  const handleMemberClick = () => {
    router.push("/Ticketing/Member")
  }

  const handleUmumClick = () => {
    router.push("/Ticketing/Reguler")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackClick} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Waves className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistem Ticketing Kolam Renang</h1>
                <p className="text-sm text-gray-600">Pondok Swimming Pool</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Pool Info Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Jam Operasional</p>
                  <p className="text-blue-100">06:00 - 18:00 WIB</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Lokasi</p>
                  <p className="text-blue-100">Kolam Renang Pondok</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Waves className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Status</p>
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    Buka
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Type Selection */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pilih Jenis Tiket</h2>
          <p className="text-lg text-gray-600">Silakan pilih kategori tiket sesuai dengan status Anda</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Member Card */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Tiket Member</CardTitle>
              <Badge variant="outline" className="w-fit mx-auto border-blue-500 text-blue-700">
                Harga Khusus
              </Badge>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-600">Rp 15.000</p>
                <p className="text-sm text-gray-500 line-through">Rp 25.000</p>
              </div>
              <div className="text-left space-y-2 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Fasilitas:</span>
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Akses kolam renang dewasa</li>
                  <li>• Akses kolam renang anak</li>
                  <li>• Handuk gratis</li>
                  <li>• Loker gratis</li>
                  <li>• Diskon 40% dari harga normal</li>
                </ul>
              </div>
              <Button
                onClick={handleMemberClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                size="lg"
              >
                Pilih Tiket Member
              </Button>
            </CardContent>
          </Card>

          {/* General/Umum Card */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-green-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <User className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Tiket Umum</CardTitle>
              <Badge variant="outline" className="w-fit mx-auto border-green-500 text-green-700">
                Harga Normal
              </Badge>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-green-600">Rp 25.000</p>
                <p className="text-sm text-gray-500">Per orang</p>
              </div>
              <div className="text-left space-y-2 bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Fasilitas:</span>
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Akses kolam renang dewasa</li>
                  <li>• Akses kolam renang anak</li>
                  <li>• Kamar mandi & bilas</li>
                  <li>• Area parkir</li>
                  <li>• Gazebo istirahat</li>
                </ul>
              </div>
              <Button
                onClick={handleUmumClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                size="lg"
              >
                Pilih Tiket Umum
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Informasi Penting</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-3">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Aturan Kolam:</p>
                  <ul className="space-y-1">
                    <li>• Wajib mandi sebelum berenang</li>
                    <li>• Tidak boleh membawa makanan ke area kolam</li>
                    <li>• Anak di bawah 12 tahun harus didampingi</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Fasilitas Tambahan:</p>
                  <ul className="space-y-1">
                    <li>• Kantin tersedia</li>
                    <li>• Toilet dan kamar ganti</li>
                    <li>• Area parkir luas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
