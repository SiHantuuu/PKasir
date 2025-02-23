import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Item {
  name: string
  price: number
  quantity: number
}

interface PaymentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  payment: {
    id: string
    dateTime: string
    userName: string
    totalPrice: number
    items: Item[]
  }
}

export function PaymentDetailsModal({ isOpen, onClose, payment }: PaymentDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Payment Details - {payment.id}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p>
            <strong>Date & Time:</strong> {payment.dateTime}
          </p>
          <p>
            <strong>User Name:</strong> {payment.userName}
          </p>
          <p>
            <strong>Total Price:</strong> Rp {payment.totalPrice.toLocaleString()}
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payment.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">Rp {item.price.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">Rp {(item.price * item.quantity).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

