import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";

// Define TypeScript interfaces
interface Item {
  name: string;
  price: number;
  quantity: number;
}

interface Payment {
  id: string;
  dateTime: string;
  userName: string;
  totalPrice: number;
  items: Item[];
}

// Mock data
const paymentHistory: Payment[] = [
  {
    id: "USR001",
    dateTime: "2025-02-23 20:15:30",
    userName: "Burung Hantu Putih",
    totalPrice: 150000,
    items: [
      { name: "Owl Perch", price: 75000, quantity: 1 },
      { name: "Feather Brush", price: 25000, quantity: 2 },
      { name: "Nocturnal Treats", price: 50000, quantity: 1 },
    ],
  },
  {
    id: "USR002",
    dateTime: "2025-02-22 15:30:45",
    userName: "Burung Hantu Coklat",
    totalPrice: 200000,
    items: [
      { name: "Owl House", price: 120000, quantity: 1 },
      { name: "Owl Toy", price: 30000, quantity: 1 },
      { name: "Premium Owl Food", price: 50000, quantity: 1 },
    ],
  },
  {
    id: "USR003",
    dateTime: "2025-02-21 10:45:20",
    userName: "Burung Hantu Hitam",
    totalPrice: 175000,
    items: [
      { name: "Night Vision Goggles", price: 100000, quantity: 1 },
      { name: "Silent Flight Training Manual", price: 75000, quantity: 1 },
    ],
  },
];

function PurchaseDetailsDialog({ payment }: { payment: Payment }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          
          size="sm"
          aria-label={`View details for transaction ${payment.id}`}
        >
          More Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm font-medium">Transaction ID: {payment.id}</p>
          <p className="text-sm text-gray-500">Date: {payment.dateTime}</p>
          <p className="text-sm text-gray-500 mb-4">User: {payment.userName}</p>
          <Table className="border-collapse border-2 border-gray-300">
            <TableHeader>
              <TableRow>
                <TableHead className="border-2 border-gray-300 px-4 py-2 bg-gray-100 text-left">Item</TableHead>
                <TableHead className="border-2 border-gray-300 px-4 py-2 bg-gray-100 text-right">Quantity</TableHead>
                <TableHead className="border-2 border-gray-300 px-4 py-2 bg-gray-100 text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payment.items.map((item: Item) => (
                <TableRow key={item.name} className="hover:bg-gray-100">
                  <TableCell className="border-2 border-gray-300 px-4 py-2">{item.name}</TableCell>
                  <TableCell className="border-2 border-gray-300 px-4 py-2 text-right">{item.quantity}</TableCell>
                  <TableCell className="border-2 border-gray-300 px-4 py-2 text-right">Rp {item.price.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-right font-semibold">Total: Rp {payment.totalPrice.toLocaleString()}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header Section */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger aria-label="Toggle sidebar" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <h1 className="text-xl font-semibold"><b>Payment History</b></h1>
        </header>
        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="rounded-xl bg-background p-6 shadow-sm">
            <Table className="border-collapse border-2 border-gray-300">
              <TableHeader>
                <TableRow>
                  <TableHead className="border-2 border-gray-300 px-4 py-2 bg-gray-100 text-left">No.</TableHead>
                  <TableHead className="border-2 border-gray-300 px-4 py-2 bg-gray-100 text-left">Transaction ID</TableHead>
                  <TableHead className="border-2 border-gray-300 px-4 py-2 bg-gray-100 text-left">Date & Time</TableHead>
                  <TableHead className="border-2 border-gray-300 px-4 py-2 bg-gray-100 text-left">User Name</TableHead>
                  <TableHead className="border-2 border-gray-300 px-4 py-2 bg-gray-100 text-right">Total Price</TableHead>
                  <TableHead className="border-2 border-gray-300 px-4 py-2 bg-gray-100 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment: Payment, index: number) => (
                  <TableRow key={payment.id} className="odd:bg-white even:bg-gray-200 hover:bg-gray-100">
                    <TableCell className="border-2 border-gray-300 px-4 py-2 font-medium">{index + 1}</TableCell>
                    <TableCell className="border-2 border-gray-300 px-4 py-2">{payment.id}</TableCell>
                    <TableCell className="border-2 border-gray-300 px-4 py-2">{payment.dateTime}</TableCell>
                    <TableCell className="border-2 border-gray-300 px-4 py-2">{payment.userName}</TableCell>
                    <TableCell className="border-2 border-gray-300 px-4 py-2 text-right">
                      Rp {payment.totalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="border-2 border-gray-300 px-4 py-2 text-right">
                      <PurchaseDetailsDialog payment={payment} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}