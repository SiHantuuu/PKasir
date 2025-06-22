"use client"

import FaceIdCamera from "@/components/face-id-camera"
import { useRouter } from "next/navigation"

export default function NonSantriPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Redirect to non-santri dashboard or member area
    router.push("/Ticketing/Member/Non-Santri/dashboard")
  }

  return (
    <FaceIdCamera
      title="Face ID Non-Santri"
      description="Gunakan Face ID untuk mengakses akun member non-santri Anda"
      onSuccess={handleSuccess}
    />
  )
}
