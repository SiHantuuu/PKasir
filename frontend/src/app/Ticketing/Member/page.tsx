"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MemberPage() {
  const router = useRouter()

  const handleSantriAccess = () => {
    router.push("/Ticketing/Member/Santri")
  }

  const handleNonSantriAccess = () => {
    router.push("/Ticketing/Member/Non-Santri")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Akses Member</h1>
          <p className="text-lg text-gray-600">Pilih kategori member untuk mengakses sistem dengan Face ID</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Santri Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSantriAccess}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Santri</CardTitle>
              <CardDescription className="text-gray-600">Akses khusus untuk santri pondok pesantren</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={handleSantriAccess}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Akses dengan Face ID
              </Button>
            </CardContent>
          </Card>

          {/* Non-Santri Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleNonSantriAccess}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Non-Santri</CardTitle>
              <CardDescription className="text-gray-600">Akses untuk member umum dan tamu</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={handleNonSantriAccess}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Akses dengan Face ID
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Pastikan kamera perangkat Anda berfungsi dengan baik untuk proses Face ID
          </p>
        </div>
      </div>
    </div>
  )
}
