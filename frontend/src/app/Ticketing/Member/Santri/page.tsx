"use client"

import FaceIdCamera from "@/components/face-id-camera"
import { useRouter } from "next/navigation"

export default function SantriPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Redirect to santri dashboard or member area
    router.push("/Ticketing/Member/Santri/dashboard")
  }

  return (
    <FaceIdCamera
      title="Face ID Santri"
      description="Gunakan Face ID untuk mengakses akun member santri Anda"
      onSuccess={handleSuccess}
    />
  )
}
