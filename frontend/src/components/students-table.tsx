import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, UserX, UserCheck } from 'lucide-react';

interface Student {
  id: number;
  NIS: string;
  NISN: string;
  Nama: string;
  username: string;
  Balance: number;
  is_active: boolean;
  createdAt: string;
}

interface StudentsTableProps {
  students: Student[];
}

export function StudentsTable({ students }: StudentsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No students found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>NIS</TableHead>
            <TableHead>NISN</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.Nama}</TableCell>
              <TableCell>{student.NIS}</TableCell>
              <TableCell>{student.NISN || '-'}</TableCell>
              <TableCell>{formatCurrency(student.Balance)}</TableCell>
              <TableCell>
                <Badge variant={student.is_active ? 'default' : 'secondary'}>
                  {student.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(student.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      student.is_active ? 'text-red-600' : 'text-green-600'
                    }
                  >
                    {student.is_active ? (
                      <UserX className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
