import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

interface RecentStudentsProps {
  students: Student[];
}

export function RecentStudents({ students }: RecentStudentsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent students found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div key={student.id} className="flex items-center space-x-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{student.Nama.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{student.Nama}</p>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-muted-foreground">
                NIS: {student.NIS}
              </p>
              <Badge
                variant={student.is_active ? 'default' : 'secondary'}
                className="text-xs"
              >
                {student.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {formatCurrency(student.Balance)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(student.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
