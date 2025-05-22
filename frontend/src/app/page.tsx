'use client';

import { useState } from 'react';
import { Camera, Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: 'Snack Potato Chips',
    price: 8000,
    image: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 2,
    name: 'Chocolate Bar',
    price: 12000,
    image: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 3,
    name: 'Mineral Water',
    price: 5000,
    image: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 4,
    name: 'Sandwich',
    price: 15000,
    image: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 5,
    name: 'Fruit Juice',
    price: 10000,
    image: '/placeholder.svg?height=80&width=80',
  },
  {
    id: 6,
    name: 'Energy Drink',
    price: 18000,
    image: '/placeholder.svg?height=80&width=80',
  },
];

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

export default function Dashboard() {
  const [scannedProducts, setScannedProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // User data (would come from authentication in a real app)
  const userData = {
    username: 'asd',
    balance: 0,
  };

  // Calculate total price
  const totalPrice = scannedProducts.reduce((total, product) => {
    return total + product.price * (product.quantity || 1);
  }, 0);

  // Add product to cart
  const addProduct = (product: Product) => {
    setScannedProducts((prev) => {
      // Check if product already exists in cart
      const existingProductIndex = prev.findIndex((p) => p.id === product.id);

      if (existingProductIndex >= 0) {
        // Increment quantity if product already exists
        const updatedProducts = [...prev];
        const existingProduct = updatedProducts[existingProductIndex];
        updatedProducts[existingProductIndex] = {
          ...existingProduct,
          quantity: (existingProduct.quantity || 1) + 1,
        };
        return updatedProducts;
      } else {
        // Add new product with quantity 1
        return [...prev, { ...product, quantity: 1 }];
      }
    });

    // Close modal after adding product
    setIsProductModalOpen(false);
  };

  // Remove product from cart
  const removeProduct = (productId: number) => {
    setScannedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Increase quantity
  const increaseQuantity = (productId: number) => {
    setScannedProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            quantity: (product.quantity || 1) + 1,
          };
        }
        return product;
      })
    );
  };

  // Decrease quantity
  const decreaseQuantity = (productId: number) => {
    setScannedProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const newQuantity = (product.quantity || 1) - 1;
          if (newQuantity <= 0) {
            return product; // Prevent going below 1
          }
          return {
            ...product,
            quantity: newQuantity,
          };
        }
        return product;
      })
    );
  };

  // Handle payment
  const handlePayment = () => {
    if (scannedProducts.length === 0) {
      alert('No products to pay for');
      return;
    }

    // In a real app, this would process the payment
    alert(
      `Payment of Rp ${totalPrice.toLocaleString()} processed successfully!`
    );
    setScannedProducts([]);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />

        {/* Main content area - full width */}
        <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
          {/* Header */}
          <header className="border-b bg-white shadow-sm">
            <div className="flex h-16 items-center px-8">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
          </header>

          {/* Main content - split into two equal columns */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 h-full">
              {/* Left section - Scan Item */}
              <div className="p-6 border-r">
                <Card className="w-full h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Camera className="h-6 w-6" />
                      Scan Item Here
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-2">
                    {/* Camera/Scanner area - larger for desktop */}
                    <div className="relative flex-1 bg-slate-900 rounded-md flex items-center justify-center mb-6">
                      {/* This would be a real camera component in production */}
                      <div className="text-white text-center p-8">
                        <Camera className="h-32 w-32 mx-auto mb-6 opacity-50" />
                        <p className="text-xl opacity-70">Camera is active</p>
                        <p className="text-base opacity-50 mt-4">
                          Position the barcode in the center
                        </p>
                      </div>
                    </div>

                    {/* Manual product selection button */}
                    <Button
                      className="w-full py-6 text-lg"
                      variant="default"
                      onClick={() => setIsProductModalOpen(true)}
                    >
                      <ShoppingCart className="mr-3 h-6 w-6" /> Select Product
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right section - Scanned Products */}
              <div className="p-6">
                <Card className="w-full h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ShoppingCart className="h-6 w-6" />
                      Scanned Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-2">
                    {scannedProducts.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <ShoppingCart className="h-32 w-32 mb-6 opacity-30" />
                        <p className="text-xl">No products scanned yet</p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-auto">
                        <div className="space-y-4">
                          {scannedProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center gap-4 p-4 border rounded-md"
                            >
                              <Image
                                src={product.image || '/placeholder.svg'}
                                alt={product.name}
                                width={70}
                                height={70}
                                className="rounded-md object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-lg truncate">
                                  {product.name}
                                </p>
                                <p className="text-muted-foreground">
                                  Rp {product.price.toLocaleString()}
                                </p>
                              </div>

                              {/* Quantity controls */}
                              <div className="flex items-center gap-2 mr-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => decreaseQuantity(product.id)}
                                  disabled={(product.quantity || 1) <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {product.quantity || 1}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => increaseQuantity(product.id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="text-right">
                                <p className="font-medium text-lg">
                                  Rp{' '}
                                  {(
                                    product.price * (product.quantity || 1)
                                  ).toLocaleString()}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 px-2 mt-1"
                                  onClick={() => removeProduct(product.id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Bottom bar - Order Summary */}
          <div className="border-t bg-white shadow-lg">
            <Card className="w-full rounded-none border-0">
              <CardContent className="py-3 px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* User Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium">{userData.username}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Account Balance:
                      </span>
                      <span className="font-medium">
                        Rp {userData.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium">
                        {scannedProducts.length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Total Quantity:
                      </span>
                      <span className="font-medium">
                        {scannedProducts.reduce(
                          (total, item) => total + (item.quantity || 1),
                          0
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Price and Payment */}
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      <span className="text-lg mr-2">Total Price:</span>
                      <span className="text-2xl font-bold">
                        Rp {totalPrice.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      size="lg"
                      disabled={scannedProducts.length === 0}
                      onClick={handlePayment}
                      className="px-6 py-2"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Selection Modal */}
        <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Select Product</DialogTitle>
            </DialogHeader>

            <Tabs
              defaultValue="grid"
              className="w-full"
              onValueChange={(value) => setViewMode(value as 'grid' | 'list')}
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {sampleProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => addProduct(product)}
                    >
                      <div className="flex justify-center mb-4">
                        <Image
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          width={100}
                          height={100}
                          className="rounded-md object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-center text-lg">
                        {product.name}
                      </h3>
                      <p className="text-center text-muted-foreground mt-1">
                        Rp {product.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                <div className="space-y-3">
                  {sampleProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-6 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => addProduct(product)}
                    >
                      <Image
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{product.name}</h3>
                      </div>
                      <p className="font-medium text-lg">
                        Rp {product.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}
