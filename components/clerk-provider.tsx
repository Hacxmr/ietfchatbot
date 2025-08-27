"use client"

import { ReactNode } from 'react'

interface ClerkProviderWrapperProps {
  children: ReactNode
}

// Temporary simple auth wrapper - replace ClerkProvider temporarily
export function ClerkWrapper({ children }: ClerkProviderWrapperProps) {
  return <>{children}</>
}
