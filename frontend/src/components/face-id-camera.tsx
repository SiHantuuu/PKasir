"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CameraOff, CheckCircle, AlertCircle, RotateCcw } from "lucide-react"

interface FaceIdCameraProps {
  title: string
  description: string
  onSuccess?: () => void
}

export default function FaceIdCamera({ title, description, onSuccess }: FaceIdCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [recognitionStatus, setRecognitionStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      setError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.")
      console.error("Error accessing camera:", err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)

        // Simulate face recognition process
        setIsProcessing(true)
        setRecognitionStatus("processing")

        setTimeout(() => {
          // Simulate recognition result (random for demo)
          const isRecognized = Math.random() > 0.3 // 70% success rate for demo

          if (isRecognized) {
            setRecognitionStatus("success")
            setTimeout(() => {
              onSuccess?.()
            }, 2000)
          } else {
            setRecognitionStatus("failed")
          }
          setIsProcessing(false)
        }, 3000)
      }
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    setRecognitionStatus("idle")
    setIsProcessing(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Camera className="w-6 h-6" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Camera View */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {!capturedImage ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured face"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Overlay for face detection */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-full opacity-50"></div>
              </div>

              {/* Recognition Status Overlay */}
              {recognitionStatus === "processing" && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Memproses Face ID...</p>
                  </div>
                </div>
              )}

              {recognitionStatus === "success" && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center">
                  <div className="text-white text-center">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xl font-semibold">Berhasil Dikenali!</p>
                    <p>Mengalihkan ke akun member...</p>
                  </div>
                </div>
              )}

              {recognitionStatus === "failed" && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center">
                  <div className="text-white text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xl font-semibold">Wajah Tidak Dikenali</p>
                    <p>Silakan coba lagi</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Control Buttons */}
            <div className="flex gap-4 justify-center">
              {!isStreaming && !capturedImage && (
                <Button onClick={startCamera} size="lg" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Mulai Kamera
                </Button>
              )}

              {isStreaming && !capturedImage && (
                <>
                  <Button onClick={captureImage} size="lg" className="flex items-center gap-2" disabled={isProcessing}>
                    <Camera className="w-4 h-4" />
                    Ambil Foto
                  </Button>
                  <Button onClick={stopCamera} variant="outline" size="lg" className="flex items-center gap-2">
                    <CameraOff className="w-4 h-4" />
                    Hentikan
                  </Button>
                </>
              )}

              {capturedImage && recognitionStatus !== "success" && (
                <Button
                  onClick={resetCapture}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                  disabled={isProcessing}
                >
                  <RotateCcw className="w-4 h-4" />
                  Coba Lagi
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>• Posisikan wajah Anda di dalam lingkaran</p>
              <p>• Pastikan pencahayaan cukup terang</p>
              <p>• Tatap langsung ke kamera</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
