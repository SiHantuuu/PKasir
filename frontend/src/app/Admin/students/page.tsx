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
import { FileSpreadsheet, Plus, Search, Upload } from 'lucide-react';

export default function StudentsPage() {
  // Mock data for students
  const students = [
    {
      id: 1,
      nis: '2023001',
      nisn: '9876543210',
      name: 'Ahmad Rizky',
      gen: '2023',
      nfc_id: 'NFC001',
      balance: 250000,
      status: 'active',
    },
    {
      id: 2,
      nis: '2023002',
      nisn: '9876543211',
      name: 'Siti Nuraini',
      gen: '2023',
      nfc_id: 'NFC002',
      balance: 175000,
      status: 'active',
    },
    {
      id: 3,
      nis: '2023003',
      nisn: '9876543212',
      name: 'Budi Santoso',
      gen: '2022',
      nfc_id: 'NFC003',
      balance: 125000,
      status: 'active',
    },
    {
      id: 4,
      nis: '2023004',
      nisn: '9876543213',
      name: 'Dewi Lestari',
      gen: '2022',
      nfc_id: 'NFC004',
      balance: 300000,
      status: 'active',
    },
    {
      id: 5,
      nis: '2023005',
      nisn: '9876543214',
      name: 'Eko Prasetyo',
      gen: '2021',
      nfc_id: 'NFC005',
      balance: 50000,
      status: 'low_balance',
    },
    {
      id: 6,
      nis: '2023006',
      nisn: '9876543215',
      name: 'Fitri Handayani',
      gen: '2021',
      nfc_id: 'NFC006',
      balance: 225000,
      status: 'active',
    },
    {
      id: 7,
      nis: '2023007',
      nisn: '9876543216',
      name: 'Gunawan Wibowo',
      gen: '2022',
      nfc_id: 'NFC007',
      balance: 175000,
      status: 'active',
    },
    {
      id: 8,
      nis: '2023008',
      nisn: '9876543217',
      name: 'Hani Susanti',
      gen: '2023',
      nfc_id: 'NFC008',
      balance: 25000,
      status: 'low_balance',
    },
    {
      id: 9,
      nis: '2023009',
      nisn: '9876543218',
      name: 'Irfan Hakim',
      gen: '2021',
      nfc_id: 'NFC009',
      balance: 150000,
      status: 'active',
    },
    {
      id: 10,
      nis: '2023010',
      nisn: '9876543219',
      name: 'Juwita Sari',
      gen: '2022',
      nfc_id: 'NFC010',
      balance: 200000,
      status: 'active',
    },
  ];

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
              />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Button size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage student accounts, balances, and NFC cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>NFC ID</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.nis}</TableCell>
                      <TableCell>{student.nisn}</TableCell>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.gen}</TableCell>
                      <TableCell>{student.nfc_id}</TableCell>
                      <TableCell>
                        Rp {student.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            student.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {student.status === 'active'
                            ? 'Active'
                            : 'Low Balance'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Top Up
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-end space-x-2">
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
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
