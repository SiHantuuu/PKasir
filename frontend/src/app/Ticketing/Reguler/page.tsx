"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, CreditCard, Clock, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegulerPage() {
  const router = useRouter()
  const [ticketCount, setTicketCount] = useState(1)
  const ticketPrice = 25000
  const [visitorName, setVisitorName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")

  const handleBackClick = () => {
    router.push("/Ticketing")
  }

  const handleIncrement = () => {
    setTicketCount((prev) => prev + 1)
  }

  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount((prev) => prev - 1)
    }
  }

  const validatePhoneNumber = (phone: string) => {
    // Indonesian phone number validation
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  const handlePurchase = () => {
    if (!visitorName.trim()) {
      alert("Nama pengunjung harus diisi!")
      return
    }
    if (!phoneNumber.trim()) {
      alert("Nomor telepon harus diisi!")
      return
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError("Nomor telepon tidak valid")
      return
    }

    // Navigate to receipt page with ticket data
    const ticketData = {
      visitorName,
      phoneNumber,
      ticketCount,
      ticketPrice,
      total: ticketPrice * ticketCount,
      purchaseDate: new Date().toISOString(),
    }

    router.push(`/Ticketing/Receipt?data=${encodeURIComponent(JSON.stringify(ticketData))}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackClick} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tiket Reguler</h1>
                <p className="text-sm text-gray-600">Pembelian tiket untuk pengunjung umum</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ticket Info */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Tiket Reguler</CardTitle>
                  <CardDescription>Akses penuh ke kolam renang</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">Rp {ticketPrice.toLocaleString("id-ID")}</p>
                <p className="text-sm text-gray-500">Per orang</p>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Fasilitas Termasuk:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Akses kolam renang dewasa</li>
                    <li>• Akses kolam renang anak</li>
                    <li>• Kamar mandi & bilas</li>
                    <li>• Area parkir</li>
                    <li>• Gazebo istirahat</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Jam Operasional</h4>
                  </div>
                  <p className="text-sm text-yellow-700">06:00 - 18:00 WIB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pembelian Tiket
              </CardTitle>
              <CardDescription>Pilih jumlah tiket yang ingin dibeli</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visitor Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visitorName" className="text-sm font-medium text-gray-700">
                    Nama Pengunjung *
                  </Label>
                  <Input
                    id="visitorName"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                    Nomor Telepon *
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value
                      setPhoneNumber(value)
                      if (value && !validatePhoneNumber(value)) {
                        setPhoneError("Nomor telepon tidak valid")
                      } else {
                        setPhoneError("")
                      }
                    }}
                    className="w-full"
                  />
                  {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                </div>
              </div>

              {/* Ticket Counter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Jumlah Tiket *</Label>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecrement}
                    disabled={ticketCount <= 1}
                    className="w-10 h-10 rounded-full"
                  >
                    -
                  </Button>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{ticketCount}</div>
                    <div className="text-xs text-gray-500">tiket</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleIncrement} className="w-10 h-10 rounded-full">
                    +
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {ticketCount === 1 ? "1 orang" : `${ticketCount} orang`}
                </p>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Harga per tiket</span>
                  <span>Rp {ticketPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Jumlah tiket</span>
                  <span>{ticketCount}x</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">Rp {(ticketPrice * ticketCount).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <Button
                onClick={handlePurchase}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                size="lg"
                disabled={!visitorName.trim() || !phoneNumber.trim() || phoneError !== ""}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Beli Tiket Sekarang
              </Button>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>* Wajib diisi</p>
                <p>Tiket berlaku untuk hari ini</p>
                <p>Tidak dapat dikembalikan setelah pembelian</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules and Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Aturan dan Informasi Penting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Aturan Kolam Renang:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Wajib mandi sebelum masuk kolam</li>
                  <li>• Tidak boleh membawa makanan ke area kolam</li>
                  <li>• Anak di bawah 12 tahun harus didampingi orang dewasa</li>
                  <li>• Dilarang berlari di area kolam</li>
                  <li>• Gunakan pakaian renang yang sesuai</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Fasilitas Tambahan:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Kantin dan warung makan tersedia</li>
                  <li>• Toilet dan kamar ganti terpisah</li>
                  <li>• Area parkir motor dan mobil</li>
                  <li>• Gazebo untuk istirahat</li>
                  <li>• Penyewaan ban renang (opsional)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
