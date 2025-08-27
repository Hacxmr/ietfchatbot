"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  audience: string
}

interface ChatHistory {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  lastUpdated: Date
}

interface AuthContextType {
  isSignedIn: boolean
  user: { name: string; email: string } | null
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => void
  signUp: (name: string, email: string, password: string) => Promise<boolean>
  chatHistory: ChatHistory[]
  saveChatHistory: (messages: ChatMessage[], audience: string) => void
  deleteChatHistory: (historyId: string) => void
  getCurrentChatId: () => string | null
  setCurrentChatId: (id: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuthState = localStorage.getItem('ietf-auth-state')
    if (savedAuthState) {
      try {
        const { isSignedIn: savedIsSignedIn, user: savedUser } = JSON.parse(savedAuthState)
        setIsSignedIn(savedIsSignedIn)
        setUser(savedUser)
        
        // Load chat history for the user
        if (savedUser) {
          const savedChatHistory = localStorage.getItem(`ietf-chat-history-${savedUser.email}`)
          if (savedChatHistory) {
            const parsedHistory = JSON.parse(savedChatHistory).map((chat: any) => ({
              ...chat,
              createdAt: new Date(chat.createdAt),
              lastUpdated: new Date(chat.lastUpdated),
              messages: chat.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }))
            setChatHistory(parsedHistory)
          }
        }
      } catch (error) {
        console.error('Failed to parse saved auth state:', error)
      }
    }
  }, [])

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ietf-auth-state', JSON.stringify({ isSignedIn, user }))
  }, [isSignedIn, user])

  // Save chat history whenever it changes
  useEffect(() => {
    if (user && chatHistory.length > 0) {
      localStorage.setItem(`ietf-chat-history-${user.email}`, JSON.stringify(chatHistory))
    }
  }, [chatHistory, user])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Simple mock authentication - in a real app, this would call an API
    if (email && password) {
      const mockUser = {
        name: email.split('@')[0],
        email: email
      }
      setUser(mockUser)
      setIsSignedIn(true)
      return true
    }
    return false
  }

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simple mock registration - in a real app, this would call an API
    if (name && email && password) {
      const mockUser = {
        name: name,
        email: email
      }
      setUser(mockUser)
      setIsSignedIn(true)
      return true
    }
    return false
  }

  const signOut = () => {
    setUser(null)
    setIsSignedIn(false)
    setChatHistory([])
    setCurrentChatId(null)
    localStorage.removeItem('ietf-auth-state')
  }

  const saveChatHistory = (messages: ChatMessage[], audience: string) => {
    if (!user || messages.length === 0) return

    const now = new Date()
    const title = messages[0]?.content.slice(0, 50) + (messages[0]?.content.length > 50 ? '...' : '') || 'New Chat'
    
    const newHistory: ChatHistory = {
      id: currentChatId || Date.now().toString(),
      title,
      messages,
      createdAt: now,
      lastUpdated: now
    }

    setChatHistory(prev => {
      const existingIndex = prev.findIndex(h => h.id === newHistory.id)
      if (existingIndex >= 0) {
        // Update existing chat
        const updated = [...prev]
        updated[existingIndex] = { ...newHistory, createdAt: prev[existingIndex].createdAt }
        return updated
      } else {
        // Add new chat
        return [newHistory, ...prev]
      }
    })

    if (!currentChatId) {
      setCurrentChatId(newHistory.id)
    }
  }

  const deleteChatHistory = (historyId: string) => {
    setChatHistory(prev => prev.filter(h => h.id !== historyId))
    if (currentChatId === historyId) {
      setCurrentChatId(null)
    }
  }

  const getCurrentChatId = () => currentChatId

  const value: AuthContextType = {
    isSignedIn,
    user,
    signIn,
    signOut,
    signUp,
    chatHistory,
    saveChatHistory,
    deleteChatHistory,
    getCurrentChatId,
    setCurrentChatId
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
