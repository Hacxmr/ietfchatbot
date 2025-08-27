"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, MessageCircle, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from './auth-context'

interface SearchPanelProps {
  onClose: () => void
  onSearchSelect: (query: string) => void
}

export function SearchPanel({ onClose, onSearchSelect }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { chatHistory } = useAuth()

  // Filter chat history based on search query
  const filteredHistory = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearchSelect(searchQuery.trim())
      onClose()
    }
  }

  const handleHistorySelect = (chat: any) => {
    const firstUserMessage = chat.messages.find((msg: any) => msg.role === 'user')
    if (firstUserMessage) {
      onSearchSelect(firstUserMessage.content)
      onClose()
    }
  }

  return (
    <div className="border-b bg-card/50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Chats
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search your chat history or ask a new question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!searchQuery.trim()}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {searchQuery && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {filteredHistory.length > 0 ? 'Found in your chat history:' : 'No matches found in chat history'}
            </h4>
            <ScrollArea className="max-h-60">
              <div className="space-y-2">
                {filteredHistory.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => handleHistorySelect(chat)}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{chat.title}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{chat.lastUpdated.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{chat.messages.length} messages</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {!searchQuery && chatHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent chats:</h4>
            <ScrollArea className="max-h-40">
              <div className="space-y-2">
                {chatHistory.slice(0, 5).map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => handleHistorySelect(chat)}
                    className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate">{chat.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
