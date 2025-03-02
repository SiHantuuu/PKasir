"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check } from "lucide-react"

export function CSVImportGuide() {
  const [copied, setCopied] = useState(false)

  const sampleCSV = `id,name,entryYear,class,nfcId,pin
STD011,John Doe,2022,X IPA 1,nfc123,1234
STD012,Jane Smith,2022,X IPA 2,,
STD013,Robert Johnson,2021,XI IPA 1,nfc456,5678
STD014,Emily Davis,2021,XI IPS 1,,
STD015,Michael Brown,2020,XII IPA 1,nfc789,9012`

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleCSV)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "students_sample.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          CSV Import Format
        </CardTitle>
        <CardDescription>Use this format to import students. The NFC ID and PIN fields are optional.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
          <pre className="text-sm">{sampleCSV}</pre>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          <h3 className="font-medium">Required Fields:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>id</strong> - Unique student ID (e.g., STD001)
            </li>
            <li>
              <strong>name</strong> - Student's full name
            </li>
            <li>
              <strong>entryYear</strong> - Year of entry (e.g., 2022)
            </li>
            <li>
              <strong>class</strong> - Class name (e.g., X IPA 1)
            </li>
          </ul>
          <h3 className="font-medium mt-4">Optional Fields:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>nfcId</strong> - NFC card ID (leave empty if not assigned)
            </li>
            <li>
              <strong>pin</strong> - PIN for the student (leave empty if not assigned)
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

