"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useState } from "react"
import { useAuth } from "./auth-context"
import { AuthModal } from "./auth-modal"

export function UserAuthButton() {
  const { isSignedIn, user, signOut } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const handleSignInClick = () => {
    setAuthMode('signin')
    setIsModalOpen(true)
  }

  const handleSignUpClick = () => {
    setAuthMode('signup')
    setIsModalOpen(true)
  }

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
  }

  if (isSignedIn && user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm">
          <User className="w-4 h-4" />
          <span>Welcome, {user.name}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={signOut}
          className="flex items-center space-x-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={handleSignInClick}>
          Sign In
        </Button>
        <Button variant="default" onClick={handleSignUpClick}>
          Sign Up
        </Button>
      </div>
      
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={authMode}
        onToggleMode={toggleAuthMode}
      />
    </>
  )
}
