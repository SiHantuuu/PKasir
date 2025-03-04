"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence, LayoutGroup, useScroll, useSpring } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, User, GraduationCap, School, Calendar, CreditCard, Check, X, Upload, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { CSVImportGuide } from "@/components/csv-import-guide"

// Define TypeScript interfaces
interface Student {
  id: string
  name: string
  entryYear: number
  class: string
  nfcId: string | null
  pin: string | null
  profileImage: string
}

// Mock data
const studentsList: Student[] = [
  {
    id: "STD001",
    name: "Ahmad Rizky",
    entryYear: 2022,
    class: "X IPA 1",
    nfcId: null,
    pin: null,
    profileImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "STD002",
    name: "Siti Nurhaliza",
    entryYear: 2022,
    class: "X IPA 2",
    nfcId: "nfc123",
    pin: "1234",
    profileImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "STD003",
    name: "Budi Santoso",
    entryYear: 2021,
    class: "XI IPA 1",
    nfcId: null,
    pin: null,
    profileImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "STD004",
    name: "Dewi Anggraini",
    entryYear: 2021,
    class: "XI IPS 1",
    nfcId: "nfc456",
    pin: "5678",
    profileImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "STD005",
    name: "Farhan Maulana",
    entryYear: 2020,
    class: "XII IPA 1",
    nfcId: null,
    pin: null,
    profileImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "STD006",
    name: "Anisa Rahma",
    entryYear: 2020,
    class: "XII IPS 1",
    nfcId: "nfc789",
    pin: "9012",
    profileImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "STD007",
    name: "Dimas Pratama",
    entryYear: 2022,
    class: "X IPS 1",
    nfcId: null,
    pin: null,
    profileImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "STD008",
    name: "Putri Wulandari",
    entryYear: 2021,
    class: "XI IPA 2",
    nfcId: "nfc101",
    pin: "3456",
    profileImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "STD009",
    name: "Reza Firmansyah",
    entryYear: 2020,
    class: "XII IPA 2",
    nfcId: null,
    pin: null,
    profileImage: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "STD010",
    name: "Nadia Safitri",
    entryYear: 2022,
    class: "X IPA 3",
    nfcId: "nfc202",
    pin: "7890",
    profileImage: "/placeholder.svg?height=100&width=100",
  },
]

const ProgressBar = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left" style={{ scaleX }} />
}

function StudentDetailsDialog({
  student,
  isOpen,
  onClose,
  onSave,
}: {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, nfcId: string) => void
}) {
  const [newNfcId, setNewNfcId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isOpen && student) {
      setNewNfcId("")
      setError(null)
    }
  }, [isOpen, student])

  const handleSubmit = () => {
    setError(null)

    if (!newNfcId.trim() && !student?.nfcId) {
      setError("NFC ID is required")
      return
    }

    setIsProcessing(true)

    setTimeout(() => {
      if (student) {
        onSave(student.id, newNfcId || student.nfcId || "")
      }
      setIsProcessing(false)
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
        <DialogHeader>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Set Student NFC ID
            </DialogTitle>
          </motion.div>
        </DialogHeader>
        {student && (
          <motion.div
            className="mt-4 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="flex items-center space-x-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <User className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <motion.h3
                  className="text-lg font-medium text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {student.name}
                </motion.h3>
                <motion.p
                  className="text-sm text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {student.class} • {student.entryYear}
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }} // Changed from delay: 0.6 to duration: 0.3
            >
              <div className="space-y-2">
                <Label htmlFor="current-nfc-id" className="text-gray-700 dark:text-gray-300">
                  Current NFC ID
                </Label>
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <Input
                    id="current-nfc-id"
                    value={student.nfcId || "Not assigned"}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                </motion.div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-nfc-id" className="text-gray-700 dark:text-gray-300">
                  New NFC ID
                </Label>
                <motion.div
                  className="relative"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="new-nfc-id"
                    value={newNfcId}
                    onChange={(e) => setNewNfcId(e.target.value)}
                    placeholder="Enter new NFC ID"
                    className="pl-10"
                  />
                </motion.div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-center space-x-2"
                  >
                    <X size={18} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              className="flex justify-end gap-2 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <CreditCard className="h-4 w-4" />
                  </motion.div>
                ) : student.nfcId ? (
                  "Update NFC ID"
                ) : (
                  "Assign NFC ID"
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function NotificationDialog({
  isOpen,
  onClose,
  title,
  description,
  status,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  status: "success" | "error"
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
            <DialogHeader>
              <motion.div
                className="flex flex-col items-center gap-4 py-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <motion.div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    status === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                  )}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                >
                  {status === "success" ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </motion.div>
                <motion.div
                  className="text-center space-y-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</DialogTitle>
                  <p className="text-base text-gray-600 dark:text-gray-300">{description}</p>
                </motion.div>
              </motion.div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

const AnimatedButton = motion(Button)

export default function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    description: string
    status: "success" | "error"
  }>({
    isOpen: false,
    title: "",
    description: "",
    status: "success",
  })
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null)
  const [showCSVGuide, setShowCSVGuide] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  // Create a mutable copy of the students list
  const [students, setStudents] = useState<Student[]>(studentsList)

  // Extract unique years and classes for filters
  const years = useMemo(() => [...new Set(students.map((student) => student.entryYear))], [students])
  const classes = useMemo(() => [...new Set(students.map((student) => student.class))], [students])

  // Filter students based on selected filters and search query
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesYear =
        selectedYear === null || selectedYear === "all" || student.entryYear.toString() === selectedYear
      const matchesClass = selectedClass === null || selectedClass === "all" || student.class === selectedClass
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesYear && matchesClass && matchesSearch
    })
  }, [students, selectedYear, selectedClass, searchQuery])

  const handleSaveStudentCard = (id: string, nfcId: string) => {
    // Update the student in the list
    setStudents((prevStudents) => prevStudents.map((student) => (student.id === id ? { ...student, nfcId } : student)))

    // Show success notification
    setNotification({
      isOpen: true,
      title: "NFC ID Setup Successful",
      description: "The student's NFC ID has been successfully configured.",
      status: "success",
    })
  }

  const handleImportCSV = (file: File) => {
    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      const csv = event.target?.result as string
      // Here you would process the CSV and add students
      console.log("CSV content:", csv)
      // For now, we'll just show a notification
      setNotification({
        isOpen: true,
        title: "Students Imported",
        description: "CSV file has been processed. Students will be added to the system.",
        status: "success",
      })
      setShowCSVGuide(false)
    }
    reader.readAsText(file)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProgressBar />
        {/* Header Section */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex h-16 shrink-0 items-center border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg w-full sticky top-0 z-40"
        >
          <div className="flex items-center px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mx-4 h-4" />
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Students
            </motion.h1>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container max-w-6xl p-6 mx-auto">
            {/* Search and Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 space-y-4"
            >
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary dark:text-primary" />
                <Input
                  type="text"
                  placeholder="Search by name or ID"
                  className="pl-10 w-full bg-white/50 dark:bg-gray-700/50 border-0 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              <motion.div
                className="flex items-center justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <Select
                      value={selectedYear || "all"}
                      onValueChange={(value) => setSelectedYear(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-[180px] bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md">
                        <SelectValue placeholder="Entry Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <School className="h-5 w-5 text-primary" />
                    <Select
                      value={selectedClass || "all"}
                      onValueChange={(value) => setSelectedClass(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-[180px] bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-0 shadow-md">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <Button className="bg-primary text-primary-foreground" onClick={() => setShowCSVGuide(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Students (CSV)
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Students List */}
            <LayoutGroup>
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => setSelectedStudent(student)}
                      onMouseEnter={() => setHoveredStudentId(student.id)}
                      onMouseLeave={() => setHoveredStudentId(null)}
                      className="overflow-hidden backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg rounded-xl cursor-pointer"
                      whileHover={{ y: -4, scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                          <motion.div
                            className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <User className="w-6 h-6 text-primary" />
                          </motion.div>
                          <div>
                            <motion.p className="font-medium text-gray-800 dark:text-gray-200" whileHover={{ x: 5 }}>
                              {student.name}
                            </motion.p>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center">
                                  <GraduationCap className="w-4 h-4 mr-1" />
                                  {student.class}
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {student.entryYear}
                                </span>
                              </div>

                              {/* NFC ID shown below class when selected */}
                              {selectedStudent?.id === student.id && student.nfcId && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                                >
                                  <CreditCard className="w-4 h-4 mr-1 text-primary" />
                                  <span>NFC ID: {student.nfcId}</span>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm relative",
                            student.nfcId
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                          )}
                        >
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={hoveredStudentId === student.id ? "hovered" : "default"}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="block"
                            >
                              {hoveredStudentId === student.id && student.nfcId
                                ? `${student.nfcId}`
                                : student.nfcId
                                  ? "NFC Assigned"
                                  : "No NFC ID"}
                            </motion.span>
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredStudents.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <User className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No students found</p>
                  </motion.div>
                )}
              </motion.div>
            </LayoutGroup>
          </div>
        </div>
      </SidebarInset>

      {/* Student Details Dialog */}
      <StudentDetailsDialog
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onSave={handleSaveStudentCard}
      />

      {/* Notification Dialog */}
      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        description={notification.description}
        status={notification.status}
      />

      {/* CSV Import Dialog */}
      <Dialog open={showCSVGuide} onOpenChange={setShowCSVGuide}>
        <DialogContent className="sm:max-w-[700px] p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <CSVImportGuide />
            <div className="p-6 flex justify-end gap-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  const sampleCSV = `id,name,entryYear,class,nfcId,pin
STD011,John Doe,2022,X IPA 1,nfc123,1234
STD012,Jane Smith,2022,X IPA 2,,
STD013,Robert Johnson,2021,XI IPA 1,nfc456,5678
STD014,Emily Davis,2021,XI IPS 1,,
STD015,Michael Brown,2020,XII IPA 1,nfc789,9012`

                  const blob = new Blob([sampleCSV], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "students_sample.csv"
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Sample CSV
              </Button>
              <Button
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = ".csv"
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      handleImportCSV(file)
                    }
                  }
                  input.click()
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

