"use client"

import type React from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Removed unused component imports
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowRight,
    BookOpen,
    Bot,
    Clock,
    Copy,
    FileText,
    Loader2,
    Send,
    Sparkles,
    ThumbsDown,
    ThumbsUp,
    User,
    Users
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

type AudienceType = "policymaker" | "technical" | "newcomer" | null

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "rfc-summary" | "working-group" | "glossary"
  metadata?: {
    rfcNumber?: string
    workingGroup?: string
    category?: string
  }
  sources?: {
    rfcNumber: string
    title: string
  }[]
}

const audienceConfig = {
  policymaker: {
    title: "Policymaker",
    color: "bg-primary text-primary-foreground",
    quickActions: ["RFC summaries", "Policy updates", "Event outcomes"],
  },
  technical: {
    title: "Technical Professional",
    color: "bg-secondary text-secondary-foreground",
    quickActions: ["Full RFC access", "Version comparisons", "WG intelligence"],
  },
  newcomer: {
    title: "Newcomer",
    color: "bg-accent text-accent-foreground",
    quickActions: ["Interactive glossary", "Guided onboarding", "Learning paths"],
  },
}

export default function IETFChatbot() {
  return <IETFChatbotContent />
}

function IETFChatbotContent() {
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>(null)

  const audienceOptions = [
    {
      type: "policymaker" as const,
      title: "Policymaker",
      description: "Get plain-language summaries and governance insights",
      icon: Users,
      features: ["RFC summaries in plain language", "Policy-relevant updates", "High-level event outcomes"],
      color: "bg-primary text-primary-foreground",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      type: "technical" as const,
      title: "Technical Professional",
      description: "Access detailed technical information and documentation",
      icon: FileText,
      features: ["Full RFC access with status", "Version comparisons", "Working Group intelligence"],
      color: "bg-secondary text-secondary-foreground",
      gradient: "from-secondary/20 to-secondary/5",
    },
    {
      type: "newcomer" as const,
      title: "Newcomer",
      description: "Learn IETF processes with guided onboarding",
      icon: BookOpen,
      features: ["Interactive glossary", "Guided onboarding", "Suggested learning paths"],
      color: "bg-accent text-accent-foreground",
      gradient: "from-accent/20 to-accent/5",
    },
  ]

  if (!selectedAudience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-colors duration-300">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <ThemeToggle />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <div className="absolute inset-0 w-8 h-8 text-primary/30 animate-ping" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                IETF AI Assistant
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your personalized guide to Internet Engineering Task Force documents, processes, and activities
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-8 text-foreground">Choose your role to get started</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {audienceOptions.map((option, index) => {
                const IconComponent = option.icon
                return (
                  <Card
                    key={option.type}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-105 border-2 hover:border-primary/50 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setSelectedAudience(option.type)}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />

                    <CardHeader className="text-center relative z-10">
                      <div
                        className={`w-16 h-16 rounded-full ${option.color} flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <IconComponent className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-200">
                        {option.title}
                      </CardTitle>
                      <CardDescription className="text-sm">{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="space-y-2">
                        {option.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 group/feature">
                            <div className="w-2 h-2 bg-accent rounded-full transition-all duration-200 group-hover/feature:scale-125" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Not sure which role fits you best?</p>
              <Button
                variant="outline"
                onClick={() => setSelectedAudience("newcomer")}
                className="gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                Start with Newcomer Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <ChatInterface audience={selectedAudience} onBack={() => setSelectedAudience(null)} />
}

function ChatInterface({ audience, onBack }: { audience: AudienceType; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsTyping(true)

    setTimeout(
      async () => {
        try {
          const response = await generateAudienceResponse(currentInput, audience!)
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response.content,
            timestamp: new Date(),
            type: getResponseType(currentInput),
            metadata: getResponseMetadata(currentInput),
            sources: response.sources || [],
          }

          setMessages((prev) => [...prev, assistantMessage])
        } catch (error) {
          console.error('Error generating response:', error)
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
            timestamp: new Date(),
            type: "text",
          }
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setIsTyping(false)
        }
      },
      1500 + Math.random() * 1000,
    )
  }

  const generateAudienceResponse = async (query: string, audienceType: AudienceType) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: query
            }
          ],
          audience: audienceType
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      return {
        content: data.content || 'I apologize, but I couldn\'t generate a response at the moment. Please try again.',
        sources: data.sources || [],
      }
    } catch (error) {
      console.error('Error generating response:', error)
      
      // Fallback to simple audience-based responses if API fails
      let content = "I'm having some technical issues right now. Please try your question again in a moment!"
      
      if (audienceType === 'policymaker') {
        content = "I'm currently experiencing technical difficulties. As a brief overview for policymakers: The IETF develops critical internet standards through consensus-based processes that impact global digital policy and governance."
      } else if (audienceType === 'technical') {
        content = "API temporarily unavailable. The IETF is the primary standards organization for internet protocols. Key processes include Internet-Drafts, Working Group reviews, and RFC publication through the standards track."
      } else {
        content = "I'm having some technical issues right now. The IETF is the organization that creates the rules for how the internet works. Please try your question again in a moment!"
      }
      
      return {
        content,
        sources: [],
      }
    }
  }

  const getResponseType = (query: string): Message["type"] => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes("rfc")) return "rfc-summary"
    if (lowerQuery.includes("working group") || lowerQuery.includes("wg")) return "working-group"
    if (lowerQuery.includes("what is") || lowerQuery.includes("define")) return "glossary"
    return "text"
  }

  const getResponseMetadata = (query: string): Message["metadata"] => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes("rfc 9110")) {
      return { rfcNumber: "9110", category: "Standards Track" }
    }
    if (lowerQuery.includes("tls")) {
      return { workingGroup: "TLS", category: "Security" }
    }
    return {}
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="transition-all duration-200 hover:scale-105 hover:bg-accent/50"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{audienceConfig[audience!].title}</h1>
                <Badge className={`${audienceConfig[audience!].color} transition-all duration-200 hover:scale-105`}>
                  {audience ? audience.charAt(0).toUpperCase() + audience.slice(1) : ''}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b bg-muted/30 transition-colors duration-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {audienceConfig[audience!].quickActions.map((action, index) => (
              <Button
                key={action}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-md animate-in fade-in slide-in-from-left-2"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setInput(action)}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* All panel components removed */}

      {/* Chat Messages */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MessageBubble message={message} audience={audience!} />
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-card text-card-foreground border rounded-lg px-4 py-3 max-w-[80%] shadow-sm">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t bg-card/50 backdrop-blur-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about RFCs, Working Groups, or IETF processes..."
              className="flex-1 min-h-[44px] max-h-32 resize-none bg-input focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 focus:shadow-md"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md disabled:hover:scale-100"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, audience }: { message: Message; audience: AudienceType }) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleLike = () => {
    setLiked(!liked)
    if (disliked) setDisliked(false)
  }

  const handleDislike = () => {
    setDisliked(!disliked)
    if (liked) setLiked(false)
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end group">
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 max-w-[80%] shadow-sm transition-all duration-200 group-hover:shadow-md">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="prose prose-sm max-w-none
                           prose-headings:text-primary-foreground
                           prose-p:text-primary-foreground prose-p:my-1
                           prose-strong:text-primary-foreground prose-strong:font-semibold
                           prose-a:text-primary-foreground prose-a:underline hover:prose-a:no-underline
                           prose-ul:text-primary-foreground prose-li:text-primary-foreground">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children, ...props }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <div className="flex items-center justify-end gap-2 mt-2 text-xs opacity-70">
                <Clock className="w-3 h-3" />
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start group">
      <div className="bg-card text-card-foreground border rounded-lg px-4 py-3 max-w-[80%] shadow-sm transition-all duration-200 group-hover:shadow-md">
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <div className="flex-1">
            {message.metadata?.rfcNumber && (
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs transition-all duration-200 hover:scale-105">
                  RFC {message.metadata.rfcNumber}
                </Badge>
                {message.metadata.category && (
                  <Badge variant="outline" className="text-xs ml-1 transition-all duration-200 hover:scale-105">
                    {message.metadata.category}
                  </Badge>
                )}
              </div>
            )}

            {message.metadata?.workingGroup && (
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs transition-all duration-200 hover:scale-105">
                  {message.metadata.workingGroup} WG
                </Badge>
                {message.metadata.category && (
                  <Badge variant="outline" className="text-xs ml-1 transition-all duration-200 hover:scale-105">
                    {message.metadata.category}
                  </Badge>
                )}
              </div>
            )}

            <div className="prose prose-sm max-w-none leading-relaxed
                         prose-headings:text-foreground prose-headings:font-semibold
                         prose-p:text-foreground prose-p:my-2
                         prose-strong:text-foreground prose-strong:font-semibold
                         prose-a:text-primary prose-a:font-medium hover:prose-a:text-primary/80
                         prose-ul:text-foreground prose-li:text-foreground
                         prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children, ...props }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            
            {/* Show RFC sources if available */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Sources:</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {message.sources.map((source, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs bg-muted/50 hover:bg-muted transition-all duration-200"
                    >
                      <a 
                        href={`https://tools.ietf.org/rfc/rfc${source.rfcNumber}.txt`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        RFC {source.rfcNumber}
                        {source.title && <span className="hidden sm:inline">- {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}</span>}
                      </a>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatTimestamp(message.timestamp)}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-6 px-2 text-xs transition-all duration-200 hover:scale-110"
                >
                  {copied ? "Copied!" : <Copy className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 transition-all duration-200 hover:scale-110 ${liked ? "text-green-500" : ""}`}
                  onClick={handleLike}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 transition-all duration-200 hover:scale-110 ${disliked ? "text-red-500" : ""}`}
                  onClick={handleDislike}
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
