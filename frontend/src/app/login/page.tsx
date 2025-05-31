"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAdminLogin = (e: { preventDefault: () => void }) => {
    e.preventDefault()

    // In a real app, this would validate admin credentials
    setIsLoading(true)
    setTimeout(() => {
      router.push("/Admin")
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4 sm:p-6 lg:p-8">
      <div className="w-full flex justify-center">
        <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
          <CardHeader className="text-center space-y-4 sm:space-y-6 py-6 sm:py-8 lg:py-12">
            <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-red-500" />
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">PKasir</span>
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl">Admin Login</CardTitle>
            <CardDescription className="text-sm sm:text-base lg:text-lg max-w-xs sm:max-w-sm lg:max-w-md mx-auto px-2">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 lg:px-16 pb-6 sm:pb-8">
            <div className="w-full max-w-sm mx-auto">
              <form onSubmit={handleAdminLogin}>
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    <Label htmlFor="username" className="text-sm sm:text-base lg:text-lg font-medium">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-10 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    <Label htmlFor="admin-password" className="text-sm sm:text-base lg:text-lg font-medium">
                      Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg font-medium mt-4 sm:mt-6 lg:mt-8"
                    disabled={isLoading || !username || !password}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-6 sm:pb-8 lg:pb-12">
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground text-center">
              PKasir School Canteen System v1.0
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
