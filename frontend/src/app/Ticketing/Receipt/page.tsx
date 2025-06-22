"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, CheckCircle, Calendar, User, Phone, Ticket } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface TicketData {
  visitorName: string
  phoneNumber: string
  ticketCount: number
  ticketPrice: number
  total: number
  purchaseDate: string
}

export default function ReceiptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [ticketNumber, setTicketNumber] = useState("")

  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam))
        setTicketData(data)
        // Generate unique ticket number
        const ticketNum = `TKT-${Date.now().toString().slice(-8)}`
        setTicketNumber(ticketNum)
      } catch (error) {
        console.error("Error parsing ticket data:", error)
        router.push("/Ticketing/Reguler")
      }
    } else {
      router.push("/Ticketing/Reguler")
    }
  }, [searchParams, router])

  const handleBackToTicketing = () => {
    router.push("/Ticketing")
  }

  const handleDownloadReceipt = () => {
    if (!ticketData) return

    // Create receipt content
    const receiptContent = `
RECEIPT TIKET KOLAM RENANG PONDOK
=====================================

Nomor Tiket: ${ticketNumber}
Tanggal Pembelian: ${new Date(ticketData.purchaseDate).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
Waktu: ${new Date(ticketData.purchaseDate).toLocaleTimeString("id-ID")}

INFORMASI PENGUNJUNG:
-------------------------------------
Nama: ${ticketData.visitorName}
No. Telepon: ${ticketData.phoneNumber}

DETAIL TIKET:
-------------------------------------
Jenis Tiket: Reguler
Jumlah Tiket: ${ticketData.ticketCount}
Harga per Tiket: Rp ${ticketData.ticketPrice.toLocaleString("id-ID")}
Total Pembayaran: Rp ${ticketData.total.toLocaleString("id-ID")}

INFORMASI PENTING:
-------------------------------------
- Tiket berlaku untuk hari ini
- Jam operasional: 06:00 - 18:00 WIB
- Wajib mandi sebelum masuk kolam
- Anak di bawah 12 tahun harus didampingi
- Simpan tiket ini sebagai bukti pembayaran

Terima kasih atas kunjungan Anda!
Sistem Manajemen Pondok © 2024
    `

    // Create and download file
    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Receipt-${ticketNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat receipt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToTicketing} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Ticketing
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Pembelian Berhasil!</h1>
                  <p className="text-sm text-gray-600">Receipt tiket kolam renang</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrintReceipt} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={handleDownloadReceipt}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">RECEIPT TIKET</CardTitle>
            <p className="text-lg font-semibold text-green-600">Kolam Renang Pondok</p>
            <div className="bg-green-50 px-4 py-2 rounded-lg mt-4">
              <p className="text-sm text-gray-600">Nomor Tiket</p>
              <p className="text-xl font-bold text-green-700">{ticketNumber}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Purchase Info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal Pembelian</p>
                  <p className="font-semibold">
                    {new Date(ticketData.purchaseDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Waktu Pembelian</p>
                  <p className="font-semibold">{new Date(ticketData.purchaseDate).toLocaleTimeString("id-ID")}</p>
                </div>
              </div>
            </div>

            {/* Visitor Info */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-800 text-lg">Informasi Pengunjung</h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nama Pengunjung</p>
                    <p className="font-semibold text-lg">{ticketData.visitorName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nomor Telepon</p>
                    <p className="font-semibold">{ticketData.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-800 text-lg">Detail Tiket</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jenis Tiket</span>
                  <span className="font-semibold">Reguler</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah Tiket</span>
                  <span className="font-semibold">{ticketData.ticketCount} tiket</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Harga per Tiket</span>
                  <span className="font-semibold">Rp {ticketData.ticketPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-800">Total Pembayaran</span>
                    <span className="font-bold text-green-600 text-xl">
                      Rp {ticketData.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg">Informasi Penting</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li>• Tiket berlaku untuk hari ini</li>
                  <li>• Jam operasional: 06:00 - 18:00 WIB</li>
                  <li>• Wajib mandi sebelum masuk kolam</li>
                  <li>• Anak di bawah 12 tahun harus didampingi orang dewasa</li>
                  <li>• Simpan tiket ini sebagai bukti pembayaran</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500">Terima kasih atas kunjungan Anda!</p>
              <p className="text-xs text-gray-400 mt-2">Sistem Manajemen Pondok © 2024</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
