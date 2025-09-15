"use client"

import { ThemeProvider } from "@/components/theme-provider"
import type React from "react"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      {children}
    </ThemeProvider>
  )
}
