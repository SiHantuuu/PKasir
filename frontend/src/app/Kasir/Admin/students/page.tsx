'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Upload,
  Edit,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Student {
  id: number;
  NIS: string;
  NISN: string;
  Nama: string;
  Gen: string;
  NFC_id: string;
  Balance: number;
  is_active: boolean;
  username?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    siswa: Student[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Form state
  const [studentForm, setStudentForm] = useState({
    NIS: '',
    NISN: '',
    Nama: '',
    Gen: '',
    NFC_id: '',
    Balance: '',
    username: '',
    email: '',
    password: '',
    PIN: '',
  });

  // API Base URL - adjust this to your backend URL
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // API Functions
  const fetchStudents = async (page = 1, limit = 10, status = 'all') => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/siswa?page=${page}&limit=${limit}&status=${status}&sortBy=createdAt&sortOrder=DESC`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setStudents(data.data.siswa);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal mengambil data siswa');
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async (query: string, page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/siswa/search?query=${encodeURIComponent(
          query
        )}&page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=DESC`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setStudents(data.data.siswa);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Gagal mencari data siswa');
    } finally {
      setLoading(false);
    }
  };

  const registerSiswaAttachment = async (studentData) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/auth/register/siswa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          NIS: studentData.NIS,
          NISN: studentData.NISN,
          username: studentData.username,
          email: studentData.email,
          Nama: studentData.Nama,
          Gen: Number.parseInt(studentData.Gen), // Convert to number as expected by API
          password: studentData.password,
          PIN: studentData.PIN,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Siswa berhasil didaftarkan');
        fetchStudents(pagination.currentPage); // Refresh current page
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error registering student:', error);
      toast.error(
        error instanceof Error ? error.message : 'Gagal mendaftarkan siswa'
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateStudent = async (id: number, studentData: Partial<Student>) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/siswa/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Data siswa berhasil diupdate');
        fetchStudents(pagination.currentPage); // Refresh current page
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(
        error instanceof Error ? error.message : 'Gagal mengupdate siswa'
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStudentStatus = async (id: number, activate: boolean) => {
    try {
      const endpoint = activate ? 'activate' : 'deactivate';
      const response = await fetch(`${API_BASE_URL}/siswa/${id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: activate ? undefined : 'Dinonaktifkan oleh admin',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Siswa berhasil ${activate ? 'diaktifkan' : 'dinonaktifkan'}`
        );
        fetchStudents(pagination.currentPage); // Refresh current page
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error toggling student status:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Gagal ${activate ? 'mengaktifkan' : 'menonaktifkan'} siswa`
      );
      return false;
    }
  };

  // Load students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchStudents(searchQuery.trim());
      } else {
        fetchStudents();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddStudent = async () => {
    if (
      studentForm.NIS &&
      studentForm.NISN &&
      studentForm.Nama &&
      studentForm.Gen &&
      studentForm.password &&
      studentForm.PIN
    ) {
      const studentData = {
        NIS: studentForm.NIS,
        NISN: studentForm.NISN,
        Nama: studentForm.Nama,
        Gen: studentForm.Gen,
        username: studentForm.username || studentForm.NIS,
        email: studentForm.email || `${studentForm.NIS}@student.school.id`,
        password: studentForm.password,
        PIN: studentForm.PIN,
      };

      const success = await registerSiswaAttachment(studentData);
      if (success) {
        resetStudentForm();
        setIsAddStudentOpen(false);
      }
    } else {
      toast.error(
        'Mohon lengkapi semua field yang wajib diisi (NIS, NISN, Nama, Gen, Password, PIN)'
      );
    }
  };

  const handleEditStudent = async () => {
    if (
      selectedStudent &&
      studentForm.NIS &&
      studentForm.NISN &&
      studentForm.Nama &&
      studentForm.Gen &&
      studentForm.NFC_id
    ) {
      const studentData = {
        NIS: studentForm.NIS,
        NISN: studentForm.NISN,
        Nama: studentForm.Nama,
        Gen: studentForm.Gen,
        NFC_id: studentForm.NFC_id,
        username: studentForm.username,
        email: studentForm.email,
      };

      const success = await updateStudent(selectedStudent.id, studentData);
      if (success) {
        resetStudentForm();
        setSelectedStudent(null);
        setIsEditStudentOpen(false);
      }
    } else {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
    }
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setStudentForm({
      NIS: student.NIS,
      NISN: student.NISN,
      Nama: student.Nama,
      Gen: student.Gen,
      NFC_id: student.NFC_id,
      Balance: student.Balance.toString(),
      username: student.username || '',
      email: student.email || '',
      password: '',
      PIN: '',
    });
    setIsEditStudentOpen(true);
  };

  const resetStudentForm = () => {
    setStudentForm({
      NIS: '',
      NISN: '',
      Nama: '',
      Gen: '',
      NFC_id: '',
      Balance: '',
      username: '',
      email: '',
      password: '',
      PIN: '',
    });
  };

  const handleImportExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(
          `File "${file.name}" uploaded successfully! (This is a demo - actual import functionality would be implemented with a proper Excel parsing library)`
        );
      }
    };
    input.click();
  };

  const handleExportExcel = () => {
    const headers = [
      'NIS',
      'NISN',
      'Name',
      'Gen',
      'NFC ID',
      'Balance',
      'Status',
    ];
    const csvContent = [
      headers.join(','),
      ...students.map((student) =>
        [
          student.NIS,
          student.NISN,
          `"${student.Nama}"`,
          student.Gen,
          student.NFC_id,
          student.Balance,
          student.is_active ? 'active' : 'inactive',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `students_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handlePageChange = (page: number) => {
    if (searchQuery.trim()) {
      searchStudents(searchQuery.trim(), page);
    } else {
      fetchStudents(page);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar isLoggedIn={true} isAdmin={true} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-6"
            />
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
            <Button
              size="sm"
              className="h-9"
              onClick={() => setIsAddStudentOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleImportExcel}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleExportExcel}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage student accounts, balances, and NFC cards
                {searchQuery && (
                  <span className="ml-2 text-sm">
                    (Showing {pagination.totalItems} results for "{searchQuery}
                    ")
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Loading students...
                  </p>
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No students found
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    {searchQuery
                      ? 'Try adjusting your search criteria'
                      : 'Start by adding your first student'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={clearSearch}
                    >
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
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.NIS}</TableCell>
                          <TableCell>{student.NISN}</TableCell>
                          <TableCell className="font-medium">
                            {student.Nama}
                          </TableCell>
                          <TableCell>{student.Gen}</TableCell>
                          <TableCell>{student.NFC_id}</TableCell>
                          <TableCell>
                            Rp {student.Balance.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.is_active ? 'default' : 'destructive'
                              }
                              className={
                                student.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {student.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleStudentStatus(
                                    student.id,
                                    !student.is_active
                                  )
                                }
                              >
                                {student.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing{' '}
                      <span className="font-medium">
                        {(pagination.currentPage - 1) *
                          pagination.itemsPerPage +
                          1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(
                          pagination.currentPage * pagination.itemsPerPage,
                          pagination.totalItems
                        )}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">
                        {pagination.totalItems}
                      </span>{' '}
                      results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrevPage}
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                      >
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" className="px-4">
                        {pagination.currentPage}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNextPage}
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                      >
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
          setIsAddStudentOpen(open);
          if (!open) resetStudentForm();
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Register a new student account in the system. Fill in all the
              required information including login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student-nis">NIS *</Label>
              <Input
                id="student-nis"
                value={studentForm.NIS}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, NIS: e.target.value })
                }
                placeholder="Enter NIS"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-nisn">NISN *</Label>
              <Input
                id="student-nisn"
                value={studentForm.NISN}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, NISN: e.target.value })
                }
                placeholder="Enter NISN"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-name">Full Name *</Label>
              <Input
                id="student-name"
                value={studentForm.Nama}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, Nama: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-gen">Batch/Generation *</Label>
              <Select
                value={studentForm.Gen}
                onValueChange={(value) =>
                  setStudentForm({ ...studentForm, Gen: value })
                }
              >
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
              <Label htmlFor="student-nfc">NFC ID *</Label>
              <Input
                id="student-nfc"
                value={studentForm.NFC_id}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, NFC_id: e.target.value })
                }
                placeholder="Enter NFC ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-username">Username</Label>
              <Input
                id="student-username"
                value={studentForm.username}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, username: e.target.value })
                }
                placeholder="Enter username (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-email">Email</Label>
              <Input
                id="student-email"
                type="email"
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
                placeholder="Enter email (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-password">Password *</Label>
              <Input
                id="student-password"
                type="password"
                value={studentForm.password}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, password: e.target.value })
                }
                placeholder="Enter password (min 6 characters)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-pin">PIN *</Label>
              <Input
                id="student-pin"
                type="password"
                maxLength={6}
                value={studentForm.PIN}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, PIN: e.target.value })
                }
                placeholder="Enter 6-digit PIN"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddStudentOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStudent} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={isEditStudentOpen}
        onOpenChange={(open) => {
          setIsEditStudentOpen(open);
          if (!open) {
            resetStudentForm();
            setSelectedStudent(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student information. Fill in all the required fields.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-student-nis">NIS *</Label>
              <Input
                id="edit-student-nis"
                value={studentForm.NIS}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, NIS: e.target.value })
                }
                placeholder="Enter NIS"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-student-nisn">NISN *</Label>
              <Input
                id="edit-student-nisn"
                value={studentForm.NISN}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, NISN: e.target.value })
                }
                placeholder="Enter NISN"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-student-name">Full Name *</Label>
              <Input
                id="edit-student-name"
                value={studentForm.Nama}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, Nama: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-student-gen">Batch/Generation *</Label>
              <Select
                value={studentForm.Gen}
                onValueChange={(value) =>
                  setStudentForm({ ...studentForm, Gen: value })
                }
              >
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
              <Label htmlFor="edit-student-nfc">NFC ID *</Label>
              <Input
                id="edit-student-nfc"
                value={studentForm.NFC_id}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, NFC_id: e.target.value })
                }
                placeholder="Enter NFC ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-student-username">Username</Label>
              <Input
                id="edit-student-username"
                value={studentForm.username}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, username: e.target.value })
                }
                placeholder="Enter username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-student-email">Email</Label>
              <Input
                id="edit-student-email"
                type="email"
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
                placeholder="Enter email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditStudentOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEditStudent} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
