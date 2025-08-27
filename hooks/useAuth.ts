"use client"

import { useUser } from "@clerk/nextjs"

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser()
  
  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn,
    session: user ? { user } : null,
  }
}
