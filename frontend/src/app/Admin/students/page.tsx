"use client"

import { useState, useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, Plus, Search, Upload, Edit, CreditCard } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Student {
  id: number
  nis: string
  nisn: string
  name: string
  gen: string
  nfc_id: string
  balance: number
  status: string
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Form state
  const [studentForm, setStudentForm] = useState({
    nis: "",
    nisn: "",
    name: "",
    gen: "",
    nfc_id: "",
    balance: "",
  })

  // Mock data for students
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      nis: "2023001",
      nisn: "9876543210",
      name: "Ahmad Rizky",
      gen: "2023",
      nfc_id: "NFC001",
      balance: 250000,
      status: "active",
    },
    {
      id: 2,
      nis: "2023002",
      nisn: "9876543211",
      name: "Siti Nuraini",
      gen: "2023",
      nfc_id: "NFC002",
      balance: 175000,
      status: "active",
    },
    {
      id: 3,
      nis: "2023003",
      nisn: "9876543212",
      name: "Budi Santoso",
      gen: "2022",
      nfc_id: "NFC003",
      balance: 125000,
      status: "active",
    },
    {
      id: 4,
      nis: "2023004",
      nisn: "9876543213",
      name: "Dewi Lestari",
      gen: "2022",
      nfc_id: "NFC004",
      balance: 300000,
      status: "active",
    },
    {
      id: 5,
      nis: "2023005",
      nisn: "9876543214",
      name: "Eko Prasetyo",
      gen: "2021",
      nfc_id: "NFC005",
      balance: 50000,
      status: "low_balance",
    },
    {
      id: 6,
      nis: "2023006",
      nisn: "9876543215",
      name: "Fitri Handayani",
      gen: "2021",
      nfc_id: "NFC006",
      balance: 225000,
      status: "active",
    },
    {
      id: 7,
      nis: "2023007",
      nisn: "9876543216",
      name: "Gunawan Wibowo",
      gen: "2022",
      nfc_id: "NFC007",
      balance: 175000,
      status: "active",
    },
    {
      id: 8,
      nis: "2023008",
      nisn: "9876543217",
      name: "Hani Susanti",
      gen: "2023",
      nfc_id: "NFC008",
      balance: 25000,
      status: "low_balance",
    },
    {
      id: 9,
      nis: "2023009",
      nisn: "9876543218",
      name: "Irfan Hakim",
      gen: "2021",
      nfc_id: "NFC009",
      balance: 150000,
      status: "active",
    },
    {
      id: 10,
      nis: "2023010",
      nisn: "9876543219",
      name: "Juwita Sari",
      gen: "2022",
      nfc_id: "NFC010",
      balance: 200000,
      status: "active",
    },
    {
      id: 11,
      nis: "1140",
      nisn: "1140:",
      name: "Iehab Mubarok",
      gen: "8",
      nfc_id: "NFC010",
      balance: 200000000,
      status: "active",
    },
  ])

  // Filtered students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students

    return students.filter((student) => {
      const query = searchQuery.toLowerCase()
      return (
        student.name.toLowerCase().includes(query) ||
        student.nis.toLowerCase().includes(query) ||
        student.nisn.toLowerCase().includes(query) ||
        student.nfc_id.toLowerCase().includes(query) ||
        student.gen.toLowerCase().includes(query)
      )
    })
  }, [students, searchQuery])

  const handleAddStudent = () => {
    if (studentForm.nis && studentForm.nisn && studentForm.name && studentForm.gen && studentForm.nfc_id) {
      const newStudent: Student = {
        id: students.length + 1,
        nis: studentForm.nis,
        nisn: studentForm.nisn,
        name: studentForm.name,
        gen: studentForm.gen,
        nfc_id: studentForm.nfc_id,
        balance: studentForm.balance ? Number.parseInt(studentForm.balance) : 0,
        status: "active",
      }
      setStudents([...students, newStudent])
      resetStudentForm()
      setIsAddStudentOpen(false)
    }
  }

  const handleEditStudent = () => {
    if (
      selectedStudent &&
      studentForm.nis &&
      studentForm.nisn &&
      studentForm.name &&
      studentForm.gen &&
      studentForm.nfc_id
    ) {
      const updatedStudents = students.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              nis: studentForm.nis,
              nisn: studentForm.nisn,
              name: studentForm.name,
              gen: studentForm.gen,
              nfc_id: studentForm.nfc_id,
              balance: studentForm.balance ? Number.parseInt(studentForm.balance) : student.balance,
            }
          : student,
      )
      setStudents(updatedStudents)
      resetStudentForm()
      setSelectedStudent(null)
      setIsEditStudentOpen(false)
    }
  }

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student)
    setStudentForm({
      nis: student.nis,
      nisn: student.nisn,
      name: student.name,
      gen: student.gen,
      nfc_id: student.nfc_id,
      balance: student.balance.toString(),
    })
    setIsEditStudentOpen(true)
  }

  const resetStudentForm = () => {
    setStudentForm({
      nis: "",
      nisn: "",
      name: "",
      gen: "",
      nfc_id: "",
      balance: "",
    })
  }

  const handleImportExcel = () => {
    // Create a file input element
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".xlsx,.xls,.csv"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // In a real application, you would parse the Excel file here
        // For now, we'll just show a success message
        alert(
          `File "${file.name}" uploaded successfully! (This is a demo - actual import functionality would be implemented with a proper Excel parsing library)`,
        )
      }
    }
    input.click()
  }

  const handleExportExcel = () => {
    // In a real application, you would generate an Excel file here
    // For now, we'll create a CSV file as a simple export
    const headers = ["NIS", "NISN", "Name", "Gen", "NFC ID", "Balance", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map((student) =>
        [
          student.nis,
          student.nisn,
          `"${student.name}"`,
          student.gen,
          student.nfc_id,
          student.balance,
          student.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `students_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // const handleTopUp = (student: Student) => {
  //   // In a real application, this would navigate to the top-up page with the student pre-selected
  //   alert(`Redirecting to top-up page for ${student.name}`)
  // }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <SidebarProvider>
      <AppSidebar isLoggedIn={true} isAdmin={true} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-6" />
            <h1 className="text-lg font-semibold">Student Management</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-full md:w-64 lg:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="w-full rounded-lg bg-background pl-8 md:w-64 lg:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Button size="sm" className="h-9" onClick={() => setIsAddStudentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
            <Button variant="outline" size="sm" className="h-9" onClick={handleImportExcel}>
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <Button variant="outline" size="sm" className="h-9" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage student accounts, balances, and NFC cards
                {filteredStudents.length !== students.length && (
                  <span className="ml-2 text-sm">
                    (Showing {filteredStudents.length} of {students.length} students)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No students found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {searchQuery ? "Try adjusting your search criteria" : "Start by adding your first student"}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={clearSearch}>
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIS</TableHead>
                        <TableHead>NISN</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Gen</TableHead>
                        <TableHead>NFC ID</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.nis}</TableCell>
                          <TableCell>{student.nisn}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.gen}</TableCell>
                          <TableCell>{student.nfc_id}</TableCell>
                          <TableCell>Rp {student.balance.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={student.status === "active" ? "default" : "destructive"}
                              className={
                                student.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {student.status === "active" ? "Active" : "Low Balance"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(student)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {/* <Button variant="ghost" size="sm" onClick={() => handleTopUp(student)}>
                                <CreditCard className="h-4 w-4" />
                              </Button> */}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">1</span> to{" "}
                      <span className="font-medium">{Math.min(10, filteredStudents.length)}</span> of{" "}
                      <span className="font-medium">{filteredStudents.length}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" className="px-4">
                        1
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      {/* Add Student Dialog */}
      <Dialog
        open={isAddStudentOpen}
        onOpenChange={(open) => {
          setIsAddStudentOpen(open)
          if (!open) resetStudentForm()
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Add a new student to the system. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student-nis">NIS</Label>
              <Input
                id="student-nis"
                value={studentForm.nis}
                onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                placeholder="Enter NIS"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-nisn">NISN</Label>
              <Input
                id="student-nisn"
                value={studentForm.nisn}
                onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                placeholder="Enter NISN"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-name">Full Name</Label>
              <Input
                id="student-name"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-gen">Batch/Generation</Label>
              <Select value={studentForm.gen} onValueChange={(value) => setStudentForm({ ...studentForm, gen: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-nfc">NFC ID</Label>
              <Input
                id="student-nfc"
                value={studentForm.nfc_id}
                onChange={(e) => setStudentForm({ ...studentForm, nfc_id: e.target.value })}
                placeholder="Enter NFC ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent}>Add Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={isEditStudentOpen}
        onOpenChange={(open) => {
          setIsEditStudentOpen(open)
          if (!open) {
            resetStudentForm()
            setSelectedStudent(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update the student information. Fill in all the required fields.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-student-nis">NIS</Label>
              <Input
                id="edit-student-nis"
                value={studentForm.nis}
                onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                placeholder="Enter NIS"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-student-nisn">NISN</Label>
              <Input
                id="edit-student-nisn"
                value={studentForm.nisn}
                onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                placeholder="Enter NISN"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-student-name">Full Name</Label>
              <Input
                id="edit-student-name"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-student-gen">Batch/Generation</Label>
              <Select value={studentForm.gen} onValueChange={(value) => setStudentForm({ ...studentForm, gen: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-student-nfc">NFC ID</Label>
              <Input
                id="edit-student-nfc"
                value={studentForm.nfc_id}
                onChange={(e) => setStudentForm({ ...studentForm, nfc_id: e.target.value })}
                placeholder="Enter NFC ID"
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStudentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStudent}>Update Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
