"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type AuthContextType = {
  isAuthenticated: boolean
  username: string | null
  login: (username: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    const storedUsername = localStorage.getItem("username")
    if (authStatus === "true" && storedUsername) {
      setIsAuthenticated(true)
      setUsername(storedUsername)
    }
  }, [])

  const login = (username: string) => {
    setIsAuthenticated(true)
    setUsername(username)
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("username", username)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUsername(null)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    window.location.href = "/"
  }

  return <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

