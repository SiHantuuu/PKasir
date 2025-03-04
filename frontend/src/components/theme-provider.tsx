"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Set default theme to light and store theme preference in localStorage
  React.useEffect(() => {
    // Set default theme to light
    localStorage.setItem("theme", "light")
    document.documentElement.classList.remove("dark")
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

