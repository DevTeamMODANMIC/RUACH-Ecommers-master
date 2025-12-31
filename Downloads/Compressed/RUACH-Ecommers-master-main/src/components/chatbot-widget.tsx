"use client"

import { useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Bot,
  Headphones,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
  User,
  X,
  type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useChatbot,
  type ChatbotIntent,
  type ContactConfig,
  type QuickReply
} from "@/hooks/use-chatbot"
import type { ChatContext } from "@/services/chatbot-service"

type ChatbotTheme = "blue" | "green" | "purple" | "teal"

interface ThemeConfig {
  toggleButton: string
  headerBg: string
  headerText: string
  sendButton: string
  userBubble: string
  userTimestamp: string
  contactButton: string
  quickReply: string
}

const THEME_PRESETS: Record<ChatbotTheme, ThemeConfig> = {
  blue: {
    toggleButton: "bg-blue-600 hover:bg-blue-700",
    headerBg: "bg-blue-600",
    headerText: "text-white",
    sendButton: "bg-blue-600 hover:bg-blue-700",
    userBubble: "bg-blue-600 text-white",
    userTimestamp: "text-blue-100",
    contactButton: "border border-blue-200 text-blue-700 hover:bg-blue-50",
    quickReply: "border border-blue-200 text-blue-700 hover:bg-blue-50"
  },
  green: {
    toggleButton: "bg-green-600 hover:bg-green-700",
    headerBg: "bg-green-600",
    headerText: "text-white",
    sendButton: "bg-green-600 hover:bg-green-700",
    userBubble: "bg-green-600 text-white",
    userTimestamp: "text-green-100",
    contactButton: "border border-green-200 text-green-700 hover:bg-green-50",
    quickReply: "border border-green-200 text-green-700 hover:bg-green-50"
  },
  purple: {
    toggleButton: "bg-purple-600 hover:bg-purple-700",
    headerBg: "bg-purple-600",
    headerText: "text-white",
    sendButton: "bg-purple-600 hover:bg-purple-700",
    userBubble: "bg-purple-600 text-white",
    userTimestamp: "text-purple-100",
    contactButton: "border border-purple-200 text-purple-700 hover:bg-purple-50",
    quickReply: "border border-purple-200 text-purple-700 hover:bg-purple-50"
  },
  teal: {
    toggleButton: "bg-teal-600 hover:bg-teal-700",
    headerBg: "bg-teal-600",
    headerText: "text-white",
    sendButton: "bg-teal-600 hover:bg-teal-700",
    userBubble: "bg-teal-600 text-white",
    userTimestamp: "text-teal-100",
    contactButton: "border border-teal-200 text-teal-700 hover:bg-teal-50",
    quickReply: "border border-teal-200 text-teal-700 hover:bg-teal-50"
  }
}

export interface ChatbotWidgetProps {
  storageKey: string
  context: ChatContext
  greeting: string
  headerTitle: string
  defaultResponse: string
  intents?: ChatbotIntent[]
  quickReplies?: QuickReply[]
  contact?: ContactConfig
  theme?: ChatbotTheme
  toggleIcon?: LucideIcon
  headerIcon?: LucideIcon
  contactIcon?: LucideIcon
  contactButtonLabel?: string
  textareaPlaceholder?: string
  footerNote?: string
}

export default function ChatbotWidget({
  storageKey,
  context,
  greeting,
  headerTitle,
  defaultResponse,
  intents,
  quickReplies,
  contact,
  theme = "blue",
  toggleIcon,
  headerIcon,
  contactIcon,
  contactButtonLabel = "Connect to Human Agent",
  textareaPlaceholder = "Type your message...",
  footerNote
}: ChatbotWidgetProps) {
  const {
    isOpen,
    toggleOpen,
    messages,
    inputValue,
    setInputValue,
    isTyping,
    quickReplies: resolvedQuickReplies,
    sendMessage,
    handleQuickReply,
    connectToAgent,
    clearHistory,
    hasContactOption
  } = useChatbot({
    storageKey,
    context,
    greeting,
    defaultResponse,
    intents,
    quickReplies,
    contact
  })

  const themeConfig = useMemo(() => THEME_PRESETS[theme], [theme])
  const ToggleIcon = toggleIcon ?? MessageCircle
  const HeaderIcon = headerIcon ?? Bot
  const ContactIcon = contactIcon ?? Headphones

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSubmit = () => {
    if (!inputValue.trim()) return
    void sendMessage(inputValue)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      <Button
        onClick={toggleOpen}
        className={cn(
          "fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-40 transition-transform focus-visible:ring-2 focus-visible:ring-offset-2",
          themeConfig.toggleButton,
          isOpen && "scale-95"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <ToggleIcon className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[520px] bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200">
          <div
            className={cn(
              "rounded-t-lg p-4 flex items-center justify-between",
              themeConfig.headerBg,
              themeConfig.headerText
            )}
          >
            <div className="flex items-center space-x-2">
              <HeaderIcon className="h-5 w-5" />
              <h3 className="font-semibold text-sm md:text-base">{headerTitle}</h3>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                onClick={clearHistory}
                variant="ghost"
                size="icon"
                className={cn("text-white hover:bg-white/10")}
                aria-label="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={toggleOpen}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => {
              const isUser = message.sender === "user"
              const timeLabel = message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })

              return (
                <div
                  key={message.id}
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 shadow-sm",
                      isUser
                        ? themeConfig.userBubble
                        : "bg-white border border-gray-200 text-gray-800"
                    )}
                  >
                    <div className="flex items-start space-x-2">
                      {!isUser && (
                        <HeaderIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      )}
                      {isUser && (
                        <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        isUser ? themeConfig.userTimestamp : "text-gray-500"
                      )}
                    >
                      {timeLabel}
                    </p>
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                  <div className="flex items-center space-x-2 text-gray-500 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>RUACH assistant is typing…</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {resolvedQuickReplies.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <div className="flex flex-wrap gap-2">
                {resolvedQuickReplies.map((reply) => (
                  <Button
                    key={reply.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-xs font-medium px-3 py-1 transition",
                      themeConfig.quickReply
                    )}
                    onClick={() => void handleQuickReply(reply.prompt)}
                  >
                    {reply.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {hasContactOption && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <Button
                onClick={connectToAgent}
                variant="outline"
                size="sm"
                className={cn("w-full text-sm justify-center", themeConfig.contactButton)}
              >
                <ContactIcon className="h-4 w-4 mr-2" />
                {contactButtonLabel}
              </Button>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={textareaPlaceholder}
                className="flex-1 text-sm resize-none"
                rows={2}
                disabled={isTyping}
              />
              <Button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isTyping}
                className={cn("self-end h-10 px-3", themeConfig.sendButton)}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {footerNote && (
              <p className="text-xs text-gray-500 mt-2 text-center">{footerNote}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

