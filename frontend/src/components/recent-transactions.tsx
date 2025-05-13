import { CreditCard, ShoppingCart } from "lucide-react"

export function RecentTransactions() {
  // Mock data for recent transactions
  const transactions = [
    {
      id: 1,
      studentName: "Ahmad Rizky",
      type: "purchase",
      amount: 25000,
      time: "10:15 AM",
    },
    {
      id: 2,
      studentName: "Siti Nuraini",
      type: "topup",
      amount: 50000,
      time: "09:45 AM",
    },
    {
      id: 3,
      studentName: "Budi Santoso",
      type: "purchase",
      amount: 15000,
      time: "09:30 AM",
    },
    {
      id: 4,
      studentName: "Dewi Lestari",
      type: "topup",
      amount: 100000,
      time: "09:15 AM",
    },
  ]

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
            {transaction.type === "purchase" ? (
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            ) : (
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{transaction.studentName}</p>
            <p className="text-sm text-muted-foreground">
              {transaction.type === "purchase" ? "Purchase" : "Top Up"} • {transaction.time}
            </p>
          </div>
          <div className={`ml-auto font-medium ${transaction.type === "purchase" ? "text-red-500" : "text-green-500"}`}>
            {transaction.type === "purchase" ? "-" : "+"} Rp {transaction.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
