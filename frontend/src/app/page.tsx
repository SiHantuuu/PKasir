'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Minus,
  Plus,
  ShoppingCart,
  KeyRound,
  CheckCircle,
  XCircle,
  CameraOff,
  User,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = 'http://localhost:3001';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

interface Student {
  id: string;
  NISN: string;
  PIN: string;
  Nama: string;
  NIS: string;
  Balance: number;
}

type AuthFlow = 'login' | 'dashboard';

interface PaymentResult {
  success: boolean;
  message: string;
  studentName: string;
  totalAmount: number;
  newBalance?: number;
  items: Product[];
}

interface DetectionFeedback {
  status: 'detecting' | 'detected' | 'not_detected' | 'error' | null;
  message: string;
  detectedCount?: number;
  timestamp?: Date;
}

export default function Dashboard() {
  const [authFlow, setAuthFlow] = useState<AuthFlow>('login');
  const [identifier, setIdentifier] = useState<string>('');
  const [authenticatedStudent, setAuthenticatedStudent] =
    useState<Student | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProducts, setScannedProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [showPaymentResult, setShowPaymentResult] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [videoReady, setVideoReady] = useState(false);
  const [detectionFeedback, setDetectionFeedback] = useState<DetectionFeedback>(
    {
      status: null,
      message: '',
    }
  );

  const totalPrice = scannedProducts.reduce((total, product) => {
    return total + product.price * (product.quantity || 1);
  }, 0);

  useEffect(() => {
    if (showPaymentResult && paymentResult) {
      const timer = setTimeout(() => {
        setShowPaymentResult(false);
        setPaymentResult(null);
        if (paymentResult.success) {
          resetToLogin();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showPaymentResult, paymentResult]);

  // Clear detection feedback after 5 seconds
  useEffect(() => {
    if (detectionFeedback.status && detectionFeedback.status !== 'detecting') {
      const timer = setTimeout(() => {
        setDetectionFeedback({ status: null, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [detectionFeedback]);

  const startCamera = async () => {
    try {
      setCameraError('');
      setIsLoading(true);
      const loadingToast = toast.loading('Starting camera...');

      // Check if video element exists
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Stop existing stream if any
      if (videoRef.current.srcObject) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      videoRef.current.srcObject = stream;

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current;
        if (!video) {
          reject(new Error('Video element lost'));
          return;
        }

        const onLoadedMetadata = () => {
          if (canvasRef.current && video) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
          }
          setVideoReady(true);
          resolve();
        };

        const onError = () => {
          reject(new Error('Video loading failed'));
        };

        video.addEventListener('loadedmetadata', onLoadedMetadata, {
          once: true,
        });
        video.addEventListener('error', onError, { once: true });

        // Cleanup listeners on timeout
        setTimeout(() => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          reject(new Error('Camera timeout'));
        }, 10000);
      });

      setIsCameraActive(true);
      setIsLoading(false);
      toast.dismiss(loadingToast);
      toast.success('Camera started successfully');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
      setIsCameraActive(false);
      setVideoReady(false);
      setIsLoading(false);

      let errorMessage = 'Unable to access camera';
      if (error instanceof Error) errorMessage = error.message;

      toast.error('Camera Error', { description: errorMessage });

      if (videoRef.current?.srcObject) {
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setVideoReady(false);
    toast.info('Camera stopped');
  };

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setIsLoading(true);
    const loadingToast = toast.loading('Authenticating...');

    try {
      const response = await apiRequest(`${API_BASE_URL}/auth/login/siswa`, {
        method: 'POST',
        body: JSON.stringify({ identifier, PIN: pin }),
      });

      if (response.success) {
        setAuthenticatedStudent(response.data.user);
        setAuthFlow('dashboard');
        setPin('');
        setIdentifier('');
        toast.dismiss(loadingToast);
        toast.success(`Welcome, ${response.data.user.Nama}!`);
      } else {
        setPinError(response.message || 'Invalid credentials');
        setPin('');
        toast.dismiss(loadingToast);
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setPinError('Login failed. Please try again.');
      setPin('');
      toast.dismiss(loadingToast);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const captureFrame = async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !isCameraActive ||
      !videoReady
    ) {
      toast.error('Camera not ready');
      return;
    }

    try {
      setIsLoading(true);
      setDetectionFeedback({
        status: 'detecting',
        message: 'Analyzing image...',
        timestamp: new Date(),
      });

      const loadingToast = toast.loading('Processing image...');

      if (videoRef.current.paused || videoRef.current.ended) {
        throw new Error('Video stream not active');
      }

      const context = canvasRef.current.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob(
          (blob) => blob && resolve(blob),
          'image/jpeg',
          0.95
        );
      });

      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');

      const response = await fetch(`${API_BASE_URL}/predict/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success && result.data.products) {
        const detectedProducts = result.data.products; // Expected format: {"Pocky": 2, "Pringles": 1}
        const productNames = Object.keys(detectedProducts);

        if (productNames.length > 0) {
          setDetectionFeedback({
            status: 'detected',
            message: `${productNames.length} product(s) detected successfully!`,
            detectedCount: productNames.length,
            timestamp: new Date(),
          });

          // Use the new batch API endpoint
          try {
            const batchResponse = await apiRequest(
              `${API_BASE_URL}/products/batch`,
              {
                method: 'POST',
                body: JSON.stringify({
                  products: detectedProducts, // {"Pocky": 2, "Pringles": 1}
                }),
              }
            );

            if (batchResponse.success) {
              const { found, notFound, summary } = batchResponse.data;

              // Convert found products to our Product interface
              const foundProducts: Product[] = Object.entries(found).map(
                ([productName, productData]: [string, any]) => ({
                  id: productData.id,
                  name: productData.Nama,
                  price: productData.Harga,
                  image: '/placeholder.svg?height=80&width=80',
                  quantity: productData.requestedQuantity,
                })
              );

              if (foundProducts.length > 0) {
                // Add products to cart
                setScannedProducts((prev) => {
                  const updatedProducts = [...prev];
                  foundProducts.forEach((newProduct) => {
                    const existingIndex = updatedProducts.findIndex(
                      (p) => p.id === newProduct.id
                    );
                    if (existingIndex >= 0) {
                      updatedProducts[existingIndex].quantity =
                        (updatedProducts[existingIndex].quantity || 1) +
                        (newProduct.quantity || 1);
                    } else {
                      updatedProducts.push(newProduct);
                    }
                  });
                  return updatedProducts;
                });

                toast.dismiss(loadingToast);

                // Show success message with details
                const successMessage = `Added ${foundProducts.length} product(s) to cart`;
                const productDetails = foundProducts
                  .map((p) => `${p.name} (${p.quantity}x)`)
                  .join(', ');

                toast.success(successMessage, {
                  description: productDetails,
                });

                // Show warning for products not found
                if (notFound.length > 0) {
                  toast.warning(`${notFound.length} product(s) not found`, {
                    description: `Could not find: ${notFound.join(', ')}`,
                  });
                }
              } else {
                setDetectionFeedback({
                  status: 'not_detected',
                  message: 'Detected products not found in database',
                  timestamp: new Date(),
                });
                toast.dismiss(loadingToast);
                toast.warning('Products not found', {
                  description: `Detected: ${productNames.join(
                    ', '
                  )} but not found in database`,
                });
              }
            } else {
              throw new Error(batchResponse.message || 'Batch API failed');
            }
          } catch (batchError) {
            console.error('Batch API error:', batchError);
            setDetectionFeedback({
              status: 'error',
              message: 'Failed to fetch product details from database',
              timestamp: new Date(),
            });
            toast.dismiss(loadingToast);
            toast.error('Database error', {
              description: 'Could not fetch product details',
            });
          }
        } else {
          setDetectionFeedback({
            status: 'not_detected',
            message: 'No products detected in the image',
            timestamp: new Date(),
          });
          toast.dismiss(loadingToast);
          toast.info('No products detected', {
            description: 'Try adjusting the camera angle or lighting',
          });
        }
      } else {
        setDetectionFeedback({
          status: 'not_detected',
          message: result.message || 'No products detected in the image',
          timestamp: new Date(),
        });
        toast.dismiss(loadingToast);
        toast.warning('Detection failed', {
          description:
            result.message || 'Please try again with better lighting',
        });
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      setDetectionFeedback({
        status: 'error',
        message: 'Failed to process image. Please try again.',
        timestamp: new Date(),
      });
      toast.dismiss(loadingToast);
      toast.error('Processing failed', {
        description: 'Check your connection or try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = (product: Product) => {
    setScannedProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity =
          (updated[existingIndex].quantity || 1) + 1;
        return updated;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsProductModalOpen(false);
    toast.success(`${product.name} added to cart`);
  };

  const removeProduct = (productId: number) => {
    const product = scannedProducts.find((p) => p.id === productId);
    setScannedProducts((prev) => prev.filter((p) => p.id !== productId));
    if (product) toast.info(`${product.name} removed`);
  };

  const increaseQuantity = (productId: number) => {
    setScannedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, quantity: (product.quantity || 1) + 1 }
          : product
      )
    );
  };

  const decreaseQuantity = (productId: number) => {
    setScannedProducts((prev) =>
      prev.map((product) =>
        product.id === productId && (product.quantity || 1) > 1
          ? { ...product, quantity: (product.quantity || 1) - 1 }
          : product
      )
    );
  };

  const handlePayment = async () => {
    if (scannedProducts.length === 0) {
      toast.error('No products to pay for');
      return;
    }

    if (authenticatedStudent && totalPrice > authenticatedStudent.Balance) {
      toast.error(
        `Insufficient balance (Rp ${authenticatedStudent.Balance.toLocaleString()})`
      );
      return;
    }

    try {
      setIsLoading(true);
      const loadingToast = toast.loading('Processing payment...');

      const response = await apiRequest(
        `${API_BASE_URL}/transactions/purchase`,
        {
          method: 'POST',
          body: JSON.stringify({
            customer_id: authenticatedStudent?.id,
            items: scannedProducts.map((p) => ({
              product_id: p.id,
              amount: p.quantity || 1,
            })),
            note: 'Purchase from dashboard',
          }),
        }
      );

      if (response.success) {
        const transaction = response.data;
        setPaymentResult({
          success: true,
          message: 'Payment successful!',
          studentName: authenticatedStudent?.Nama || '',
          totalAmount: transaction.total_amount,
          newBalance: transaction.new_balance,
          items: [...scannedProducts],
        });

        if (authenticatedStudent) {
          setAuthenticatedStudent({
            ...authenticatedStudent,
            Balance: transaction.new_balance,
          });
        }

        setShowPaymentResult(true);
        toast.dismiss(loadingToast);
        toast.success('Payment processed', {
          description: `New balance: Rp ${transaction.new_balance.toLocaleString()}`,
        });
      } else {
        toast.dismiss(loadingToast);
        toast.error(response.message || 'Payment failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Payment error');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLogin = () => {
    stopCamera();
    setAuthFlow('login');
    setIdentifier('');
    setAuthenticatedStudent(null);
    setPin('');
    setPinError('');
    setScannedProducts([]);
    setDetectionFeedback({ status: null, message: '' });
  };

  const handleLogout = () => {
    resetToLogin();
    toast.info('Logged out successfully');
  };

  // Effect to handle camera initialization after dashboard is rendered
  useEffect(() => {
    if (authFlow === 'dashboard') {
      // Wait for DOM to be fully rendered
      const timer = setTimeout(() => {
        if (videoRef.current) {
          startCamera();
        }
      }, 500); // Increased delay to ensure DOM is ready

      return () => clearTimeout(timer);
    }
  }, [authFlow]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (isProductModalOpen) {
        try {
          const loadingToast = toast.loading('Loading products...');
          const response = await apiRequest(`${API_BASE_URL}/products`);

          if (response.success) {
            setProducts(
              response.data.products.map((p: any) => ({
                id: p.id,
                name: p.Nama,
                price: p.Harga,
                image: '/placeholder.svg?height=80&width=80',
              }))
            );
            toast.dismiss(loadingToast);
            toast.success(`${response.data.products.length} products loaded`);
          } else {
            toast.dismiss(loadingToast);
            toast.error('Failed to load products');
          }
        } catch (error) {
          toast.error('Network error');
          console.error('Error fetching products:', error);
        }
      }
    };

    fetchProducts();
  }, [isProductModalOpen]);

  useEffect(() => {
    // Check camera availability
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((device) => device.kind === 'videoinput');
      if (cameras.length === 0) {
        toast.error('No camera detected!');
      } else {
        console.log('Available cameras:', cameras);
      }
    });
  }, []);

  const getDetectionStatusBadge = () => {
    if (!detectionFeedback.status) return null;

    const badgeProps = {
      detecting: {
        variant: 'secondary' as const,
        icon: Eye,
        className: 'animate-pulse',
      },
      detected: {
        variant: 'default' as const,
        icon: CheckCircle,
        className: 'bg-green-500 hover:bg-green-600',
      },
      not_detected: {
        variant: 'outline' as const,
        icon: EyeOff,
        className: 'border-orange-500 text-orange-700',
      },
      error: {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        className: '',
      },
    };

    const config = badgeProps[detectionFeedback.status];
    const IconComponent = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-1 ${config.className}`}
      >
        <IconComponent className="h-3 w-3" />
        {detectionFeedback.status === 'detected' &&
        detectionFeedback.detectedCount
          ? `${detectionFeedback.detectedCount} detected`
          : detectionFeedback.status.replace('_', ' ')}
      </Badge>
    );
  };

  const renderLoginPage = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <User className="h-6 w-6 text-blue-500" />
            Student Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">NISN/NIS/Username/NFC ID</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your identifier"
                className="text-center text-lg"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN (6 digit)</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your PIN"
                  className="pl-10 text-center text-lg tracking-widest"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
              {pinError && <p className="text-sm text-red-500">{pinError}</p>}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!identifier || pin.length !== 6 || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
      <header className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-8 justify-between">
          <h1 className="text-2xl font-semibold">Payment Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {authenticatedStudent?.Nama}
              </p>
              <p className="text-xs text-muted-foreground">
                NIS: {authenticatedStudent?.NIS}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoading}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 h-full">
          {/* Left section - Camera */}
          <div className="p-6 border-r">
            <Card className="w-full h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {isCameraActive ? (
                      <Camera className="h-6 w-6 text-green-500" />
                    ) : (
                      <CameraOff className="h-6 w-6 text-red-500" />
                    )}
                    Camera
                  </CardTitle>
                  {getDetectionStatusBadge()}
                </div>
                {detectionFeedback.message && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {detectionFeedback.message}
                    {detectionFeedback.timestamp && (
                      <span className="ml-2 text-xs">
                        ({detectionFeedback.timestamp.toLocaleTimeString()})
                      </span>
                    )}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-2">
                <div className="relative flex-1 bg-slate-900 rounded-md overflow-hidden mb-6">
                  {/* Video element is always rendered */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                    style={{
                      display: isCameraActive && videoReady ? 'block' : 'none',
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ display: 'none' }}
                  />

                  {/* Overlay for non-active states */}
                  {(!isCameraActive || !videoReady) && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-white">
                      {cameraError ? (
                        <div className="text-center p-8">
                          <CameraOff className="h-16 w-16 mx-auto mb-4 text-red-400" />
                          <p className="text-lg text-red-400 mb-2">
                            Camera Error
                          </p>
                          <p className="text-sm opacity-70">{cameraError}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={startCamera}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Starting...' : 'Retry Camera'}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                          <p className="text-lg opacity-70">
                            {isLoading ? 'Starting camera...' : 'Camera ready'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detection overlay animation */}
                  {detectionFeedback.status === 'detecting' && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-4 border-2 border-blue-400 rounded-lg animate-pulse">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="default"
                    onClick={captureFrame}
                    disabled={!isCameraActive || !videoReady || isLoading}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {detectionFeedback.status === 'detecting'
                      ? 'Analyzing...'
                      : isLoading
                      ? 'Processing...'
                      : 'Capture Frame'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsProductModalOpen(true)}
                    disabled={isLoading}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Select Product
                  </Button>
                </div>
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
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">
                    {authenticatedStudent?.Nama}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="font-medium">
                    Rp {authenticatedStudent?.Balance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium">{scannedProducts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Quantity:</span>
                  <span className="font-medium">
                    {scannedProducts.reduce(
                      (total, item) => total + (item.quantity || 1),
                      0
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-medium">
                  <span className="text-lg mr-2">Total Price:</span>
                  <span className="text-2xl font-bold">
                    Rp {totalPrice.toLocaleString()}
                  </span>
                </div>
                <Button
                  size="lg"
                  disabled={scannedProducts.length === 0 || isLoading}
                  onClick={handlePayment}
                  className="px-6 py-2"
                >
                  {isLoading ? 'Processing...' : 'Pay Now'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
                {products.map((product) => (
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
                {products.map((product) => (
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
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        {authFlow === 'login' ? renderLoginPage() : renderDashboard()}

        {/* Payment Result Dialog */}
        <AlertDialog open={showPaymentResult} onOpenChange={() => {}}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-2 mb-2">
                {paymentResult?.success ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <AlertDialogTitle
                  className={
                    paymentResult?.success ? 'text-green-800' : 'text-red-800'
                  }
                >
                  {paymentResult?.success ? 'Success!' : 'Failed'}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-left space-y-3">
                <div className="text-gray-700">
                  <p className="font-medium">{paymentResult?.message}</p>
                  {paymentResult?.studentName && (
                    <div className="mt-3 space-y-1">
                      <p>
                        <span className="font-medium">Student:</span>{' '}
                        {paymentResult.studentName}
                      </p>
                      <p>
                        <span className="font-medium">Total:</span> Rp{' '}
                        {paymentResult.totalAmount.toLocaleString()}
                      </p>
                      {paymentResult.success &&
                        paymentResult.newBalance !== undefined && (
                          <p>
                            <span className="font-medium">New Balance:</span> Rp{' '}
                            {paymentResult.newBalance.toLocaleString()}
                          </p>
                        )}
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
}
