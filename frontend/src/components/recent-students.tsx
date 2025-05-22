import { Separator } from "@/components/ui/separator"

export function RecentStudents() {
  // Mock data for recent students
  const students = [
    {
      id: 1,
      nis: "2023001",
      nisn: "9876543210",
      name: "Ahmad Rizky",
      gender: "L",
      balance: 250000,
      status: "active",
    },
    {
      id: 2,
      nis: "2023002",
      nisn: "9876543211",
      name: "Siti Nuraini",
      gender: "P",
      balance: 175000,
      status: "active",
    },
    {
      id: 3,
      nis: "2023003",
      nisn: "9876543212",
      name: "Budi Santoso",
      gender: "L",
      balance: 125000,
      status: "active",
    },
    {
      id: 4,
      nis: "2023004",
      nisn: "9876543213",
      name: "Dewi Lestari",
      gender: "P",
      balance: 300000,
      status: "active",
    },
    {
      id: 5,
      nis: "2023005",
      nisn: "9876543214",
      name: "Eko Prasetyo",
      gender: "L",
      balance: 50000,
      status: "low_balance",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 text-sm text-muted-foreground">
        <div>NIS</div>
        <div>Name</div>
        <div>Gender</div>
        <div>Status</div>
        <div className="text-right">Balance</div>
      </div>
      <Separator />
      {students.map((student) => (
        <div key={student.id} className="grid grid-cols-5 text-sm">
          <div>{student.nis}</div>
          <div className="font-medium">{student.name}</div>
          <div>{student.gender}</div>
          <div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                student.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {student.status === "active" ? "Active" : "Low Balance"}
            </span>
          </div>
          <div className="text-right font-medium">Rp {student.balance.toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}
