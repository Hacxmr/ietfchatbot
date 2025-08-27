"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Calendar, Clock, MessageCircle, Trash2, User, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from './auth-context'

interface ChatHistoryPanelProps {
  onClose: () => void
  onChatSelect: (chatId: string) => void
}

export function ChatHistoryPanel({ onClose, onChatSelect }: ChatHistoryPanelProps) {
  const { chatHistory, deleteChatHistory } = useAuth()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChatHistory(chatId)
    }
  }

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId)
    onChatSelect(chatId)
  }

  const groupChatsByDate = (chats: any[]) => {
    const groups: { [key: string]: any[] } = {}
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    chats.forEach(chat => {
      const chatDate = new Date(chat.lastUpdated)
      let groupKey = ''
      
      if (chatDate.toDateString() === today.toDateString()) {
        groupKey = 'Today'
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday'
      } else if (chatDate > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Week'
      } else if (chatDate > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Month'
      } else {
        groupKey = 'Older'
      }
      
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(chat)
    })
    
    return groups
  }

  const chatGroups = groupChatsByDate(chatHistory)

  return (
    <div className="border-b bg-card/50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Chat History
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {chatHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No chat history yet</p>
            <p className="text-sm">Start a conversation to see your chat history here</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {Object.entries(chatGroups).map(([groupName, chats]) => (
                <div key={groupName}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{groupName}</h4>
                  <div className="space-y-2">
                    {chats.map(chat => (
                      <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedChat === chat.id 
                            ? 'bg-primary/10 border-primary/20' 
                            : 'bg-card hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageCircle className="w-4 h-4 text-muted-foreground" />
                              <p className="font-medium text-sm truncate">{chat.title}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Clock className="w-3 h-3" />
                              <span>{chat.lastUpdated.toLocaleString()}</span>
                              <span>•</span>
                              <span>{chat.messages.length} messages</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {chat.messages[0]?.audience || 'general'}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteChat(e, chat.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {selectedChat === chat.id && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {chat.messages.slice(0, 4).map((message: any, index: number) => (
                                <div key={index} className="flex items-start gap-2 text-xs">
                                  {message.role === 'user' ? (
                                    <User className="w-3 h-3 mt-0.5 text-blue-500" />
                                  ) : (
                                    <Bot className="w-3 h-3 mt-0.5 text-green-500" />
                                  )}
                                  <p className="text-muted-foreground line-clamp-2">
                                    {message.content.slice(0, 100)}
                                    {message.content.length > 100 ? '...' : ''}
                                  </p>
                                </div>
                              ))}
                              {chat.messages.length > 4 && (
                                <p className="text-xs text-muted-foreground text-center">
                                  +{chat.messages.length - 4} more messages
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
