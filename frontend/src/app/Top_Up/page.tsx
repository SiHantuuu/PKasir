"use client";
import type React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Page() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [nfcId, setNfcId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dummy data - replace with real data
  const user = nfcId
    ? {
        username: "johndoe",
        balance: 150000,
        nfcId: "burunghantu123",
      }
    : null;

  const presetAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCustomAmount(value);
    const numValue = Number.parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue);
    } else {
      setSelectedAmount(null);
    }
  };

  const handlePresetAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleNfcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const nfcValue = formData.get("nfc") as string;

    if (!nfcValue) {
      setErrorMessage("Please enter a valid NFC ID.");
      return;
    }

    try {
      const isValid = await validateNfcId(nfcValue);

      if (isValid) {
        setNfcId(nfcValue);
        setErrorMessage(null); // Clear error message on success
      } else {
        setErrorMessage("Invalid NFC ID. Please try again.");
      }
    } catch (error) {
      console.error("Error validating NFC ID:", error);
      setErrorMessage("An error occurred while validating the NFC ID.");
    }
  };

  const handleTopUp = async () => {
    if (selectedAmount && isValidAmount) {
      setIsProcessing(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // After successful top up, clear NFC
        setNfcId(null);
        setSelectedAmount(null);
        setCustomAmount("");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleClearNfc = () => {
    setNfcId(null);
    setSelectedAmount(null);
    setCustomAmount("");
  };

  const isValidAmount = selectedAmount && selectedAmount >= 10000;

  // Simulated API call to validate NFC ID
  async function validateNfcId(id: string): Promise<boolean> {
    // Simulate delay for API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Example list of valid NFC IDs
    const validNfcIds = ["burunghantu123", "contohnfc123", "idkartu456"];
    return validNfcIds.includes(id);
  }

  if (!nfcId) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
          </header>
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <Card className="w-full max-w-md p-6">
              <form onSubmit={handleNfcSubmit} className="space-y-6">
                <div className="space-y-2 text-center">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h2 className="text-2xl font-bold">Tap Your Card</h2>
                  <p className="text-sm text-muted-foreground">
                    Please tap your NFC card or enter your card ID manually
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nfc">Card ID</Label>
                  <Input id="nfc" name="nfc" placeholder="Enter your card ID" required />
                  {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="p-6">
          <Alert className="mb-6">
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              Card ID: {nfcId}
              <Button variant="link" className="ml-2 h-auto p-0" onClick={handleClearNfc}>
                Clear Card
              </Button>
            </AlertDescription>
          </Alert>
          <Card className="grid md:grid-cols-2 gap-6 p-6">
            {/* Left side - Profile */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Profile</h2>
                <div className="text-lg">@{user?.username}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Current Balance</div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  <span className="text-2xl font-bold">{formatCurrency(user?.balance || 0)}</span>
                </div>
              </div>
            </div>
            {/* Right side - Top Up */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Top Up</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-amount">Custom Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                    <Input
                      id="custom-amount"
                      type="text"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className="pl-9"
                    />
                  </div>
                  {selectedAmount !== null && selectedAmount < 10000 && (
                    <p className="text-sm text-destructive">Minimum amount is Rp 10,000</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Quick Amounts</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {presetAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        className={cn("h-16", selectedAmount === amount && "border-primary border-2")}
                        onClick={() => handlePresetAmount(amount)}
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={!isValidAmount || isProcessing}
                onClick={handleTopUp}
              >
                {isProcessing
                  ? "Processing..."
                  : isValidAmount
                  ? `Top Up ${formatCurrency(selectedAmount)}`
                  : "Enter Valid Amount"}
              </Button>
            </div>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}