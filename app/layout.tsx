import { Providers } from "@/components/providers"
import type { Metadata } from "next"
import type React from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "IETF AI Assistant",
  description: "Your personalized guide to Internet Engineering Task Force documents, processes, and activities",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
