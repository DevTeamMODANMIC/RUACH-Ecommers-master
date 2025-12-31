"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { chatbotService, type ChatContext, type ChatMessage } from "@/services/chatbot-service"

type QueryValue = string | number | boolean | null | undefined

type BodyBuilderResult = QueryValue | Record<string, QueryValue> | BodyInit | null | undefined

export interface ChatbotApiConfig {
  endpoint: string | ((input: string, context: ChatContext) => string)
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  /**
   * Optional query parameters appended to the endpoint.
   */
  queryParams?:
    | Record<string, QueryValue>
    | ((input: string, context: ChatContext) => Record<string, QueryValue>)
  /**
   * Optional request body. When an object is returned it will be JSON stringified automatically.
   */
  body?:
    | BodyBuilderResult
    | ((input: string, context: ChatContext) => BodyBuilderResult)
  /**
   * Maps the raw API response into a chatbot friendly string.
   */
  transformResponse?: (data: unknown, input: string, context: ChatContext) => string
  /**
   * Message returned when the API call fails.
   */
  errorMessage?: string
}

export interface ChatbotIntent {
  /**
   * Keywords that should match the user input. All keywords are compared in lowercase.
   */
  keywords: string[]
  /**
   * How keywords should be evaluated. `any` (default) matches when any keyword is present.
   * `all` requires every keyword. `exact` matches when the message equals one of the keywords.
   */
  match?: "any" | "all" | "exact"
  /**
   * Bot response when the intent matches.
   */
  response: string
  /**
   * When true the response will be fetched dynamically from the knowledge service.
   */
  dynamic?: boolean
  /**
   * Optional async handler that can return a dynamic response (e.g. call an API).
   * When the handler resolves to an empty value the intent falls back to the static response.
   */
  action?: (input: string, context: ChatContext) => Promise<string | undefined | null>
  /**
   * Declarative API configuration. When provided we will automatically perform the HTTP request.
   */
  apiConfig?: ChatbotApiConfig
}

export interface QuickReply {
  label: string
  prompt: string
}

export interface ContactConfig {
  intro: string
  details: string[]
}

interface StoredMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string
  pageContext?: string
}

export interface UseChatbotConfig {
  storageKey: string
  context: ChatContext
  greeting: string
  defaultResponse: string
  intents?: ChatbotIntent[]
  quickReplies?: QuickReply[]
  contact?: ContactConfig
  /**
   * Maximum number of messages to retain in local history (default 40)
   */
  historyLimit?: number
}

interface UseChatbotReturn {
  isOpen: boolean
  toggleOpen: () => void
  setOpen: (value: boolean) => void
  messages: ChatMessage[]
  inputValue: string
  setInputValue: (value: string) => void
  isTyping: boolean
  quickReplies: QuickReply[]
  sendMessage: (text: string) => Promise<void>
  handleQuickReply: (prompt: string) => Promise<void>
  connectToAgent: () => void
  clearHistory: () => void
  hasContactOption: boolean
}

const DEFAULT_HISTORY_LIMIT = 40

const normalize = (value: string) => value.trim().toLowerCase()

const buildFallbackGreeting = (config: UseChatbotConfig): ChatMessage[] => [
  {
    id: `welcome-${Date.now()}`,
    text: config.greeting,
    sender: "bot" as const,
    timestamp: new Date(),
    pageContext: config.context.page
  }
]

const deserializeMessages = (stored: StoredMessage[], fallback: ChatMessage[], historyLimit: number) => {
  if (!Array.isArray(stored) || stored.length === 0) return fallback

  const messages = stored
    .map<ChatMessage>((msg) => ({
      id: msg.id,
      text: msg.text,
      sender: msg.sender,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      pageContext: msg.pageContext
    }))
    .filter((msg) => Boolean(msg.text))

  if (messages.length === 0) return fallback
  if (messages.length > historyLimit) {
    return messages.slice(messages.length - historyLimit)
  }

  return messages
}

const matchIntent = (intent: ChatbotIntent, message: string) => {
  const normalizedMessage = normalize(message)
  const keywords = intent.keywords.map(normalize)

  switch (intent.match) {
    case "all":
      return keywords.every((keyword) => normalizedMessage.includes(keyword))
    case "exact":
      return keywords.some((keyword) => normalizedMessage === keyword)
    case "any":
    default:
      return keywords.some((keyword) => normalizedMessage.includes(keyword))
  }
}

const trimHistory = (messages: ChatMessage[], historyLimit: number) => {
  if (messages.length <= historyLimit) return messages
  return messages.slice(messages.length - historyLimit)
}

const buildQueryParams = (params: Record<string, QueryValue>): string => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    searchParams.append(key, String(value))
  })
  return searchParams.toString()
}

const resolveConfigValue = <Value, ResolverArgs extends [string, ChatContext]>(
  valueOrResolver: Value | ((...args: ResolverArgs) => Value),
  ...args: ResolverArgs
): Value => {
  if (typeof valueOrResolver === "function") {
    return (valueOrResolver as (...resolverArgs: ResolverArgs) => Value)(...args)
  }
  return valueOrResolver
}

const performApiRequest = async (
  apiConfig: ChatbotApiConfig,
  input: string,
  context: ChatContext
): Promise<string> => {
  if (typeof fetch !== "function") {
    throw new Error("Fetch API is not available in this environment.")
  }

  const resolvedEndpoint = resolveConfigValue(apiConfig.endpoint, input, context)
  if (!resolvedEndpoint) {
    throw new Error("API endpoint could not be resolved.")
  }

  let url = resolvedEndpoint
  const resolvedQuery = apiConfig.queryParams
    ? resolveConfigValue(apiConfig.queryParams, input, context)
    : undefined

  if (resolvedQuery && Object.keys(resolvedQuery).length > 0) {
    const queryString = buildQueryParams(resolvedQuery)
    if (queryString) {
      url += url.includes("?") ? "&" : "?"
      url += queryString
    }
  }

  const init: RequestInit = {
    method: apiConfig.method ?? "GET",
    headers: apiConfig.headers ? { ...apiConfig.headers } : undefined
  }

  if (apiConfig.body) {
    const resolvedBody = resolveConfigValue(apiConfig.body, input, context)
    if (resolvedBody !== undefined && resolvedBody !== null) {
      const headers = init.headers ?? {}
      const existingContentType = headers["Content-Type"] || headers["content-type"]
      if (typeof resolvedBody === "string" || resolvedBody instanceof Blob) {
        init.body = resolvedBody as BodyInit
      } else if (resolvedBody instanceof FormData) {
        init.body = resolvedBody
      } else {
        init.body = JSON.stringify(resolvedBody)
        if (!existingContentType) {
          headers["Content-Type"] = "application/json"
        }
      }
      init.headers = headers
    }
  }

  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  let parsed: unknown
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    parsed = await response.json()
  } else {
    parsed = await response.text()
  }

  if (apiConfig.transformResponse) {
    return apiConfig.transformResponse(parsed, input, context)
  }

  if (typeof parsed === "string") {
    return parsed
  }

  return JSON.stringify(parsed, null, 2)
}

export function useChatbot(config: UseChatbotConfig): UseChatbotReturn {
  const historyLimit = config.historyLimit ?? DEFAULT_HISTORY_LIMIT

  const loadInitialMessages = useCallback((): ChatMessage[] => {
    if (typeof window === "undefined") {
      return buildFallbackGreeting(config)
    }

    try {
      const stored = window.localStorage.getItem(config.storageKey)
      if (!stored) {
        return buildFallbackGreeting(config)
      }

      const parsed = JSON.parse(stored) as StoredMessage[]
      const messages = deserializeMessages(parsed, buildFallbackGreeting(config), historyLimit)

      // Ensure the first message is always from the bot
      if (messages[0]?.sender !== "bot") {
        return [...buildFallbackGreeting(config), ...messages]
      }

      return messages
    } catch (error) {
      console.error("Failed to load chatbot history:", error)
      return buildFallbackGreeting(config)
    }
  }, [config, historyLimit])

  const [messages, setMessages] = useState<ChatMessage[]>(loadInitialMessages)
  const messagesRef = useRef<ChatMessage[]>(messages)

  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const quickReplies = useMemo(() => config.quickReplies ?? [], [config.quickReplies])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    if (typeof window === "undefined") return

    const serializable = messages.map<StoredMessage>((msg) => ({
      id: msg.id,
      text: msg.text,
      sender: msg.sender,
      timestamp: msg.timestamp.toISOString(),
      pageContext: msg.pageContext
    }))

    try {
      window.localStorage.setItem(config.storageKey, JSON.stringify(serializable))
    } catch (error) {
      console.error("Failed to persist chatbot history:", error)
    }
  }, [config.storageKey, messages])

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const getBotResponse = useCallback(
    async (userInput: string) => {
      const intents = config.intents ?? []

      for (const intent of intents) {
        if (!intent.keywords || intent.keywords.length === 0) continue
        if (!matchIntent(intent, userInput)) continue

        if (intent.action) {
          try {
            const actionResult = await intent.action(userInput, config.context)
            if (actionResult) {
              return actionResult
            }
          } catch (error) {
            console.error("Error executing chatbot intent action:", error)
            if (intent.apiConfig?.errorMessage) {
              return intent.apiConfig.errorMessage
            }
            if (intent.response) {
              return intent.response
            }
            continue
          }
        }

        if (intent.apiConfig) {
          try {
            return await performApiRequest(intent.apiConfig, userInput, config.context)
          } catch (error) {
            console.error("Error executing chatbot API intent:", error)
            if (intent.apiConfig.errorMessage) {
              return intent.apiConfig.errorMessage
            }
          }
        }

        if (intent.dynamic) {
          return chatbotService.getDynamicInfo(config.context)
        }

        return intent.response
      }

      try {
        const knowledgeResponses = await chatbotService.findRelevantAnswers(userInput, config.context)
        if (knowledgeResponses.length > 0) {
          return knowledgeResponses[0]
        }
      } catch (error) {
        console.error("Failed to query chatbot knowledge base:", error)
      }

      const normalizedInput = normalize(userInput)
      const dynamicTriggers = ["status", "stats", "overview", "summary", "update", "insight"]

      if (dynamicTriggers.some((trigger) => normalizedInput.includes(trigger))) {
        try {
          return await chatbotService.getDynamicInfo(config.context)
        } catch (error) {
          console.error("Failed to fetch dynamic chatbot info:", error)
        }
      }

      return config.defaultResponse
    },
    [config.context, config.defaultResponse, config.intents]
  )

  const sendMessage = useCallback(
    async (rawInput: string) => {
      const trimmed = rawInput.trim()
      if (!trimmed) return
      if (isTyping) return

      const timestamp = new Date()
      const userMessage: ChatMessage = {
        id: `user-${timestamp.getTime()}`,
        text: trimmed,
        sender: "user",
        timestamp,
        pageContext: config.context.page
      }

      const withUser = trimHistory([...messagesRef.current, userMessage], historyLimit)
      setMessages(withUser)
      messagesRef.current = withUser

      setInputValue("")
      setIsTyping(true)

      try {
        const responseText = await getBotResponse(trimmed)

        const botTimestamp = new Date()
        const botMessage: ChatMessage = {
          id: `bot-${botTimestamp.getTime()}`,
          text: responseText,
          sender: "bot",
          timestamp: botTimestamp,
          pageContext: config.context.page
        }

        const withBot = trimHistory([...withUser, botMessage], historyLimit)
        setMessages(withBot)
        messagesRef.current = withBot

        if (config.context.userId && withBot.length % 6 === 0) {
          void chatbotService.saveChatHistory(withBot, config.context).catch((error) => {
            console.error("Failed to sync chatbot history:", error)
          })
        }
      } catch (error) {
        console.error("Error generating chatbot response:", error)

        const fallbackMessage: ChatMessage = {
          id: `bot-error-${Date.now()}`,
          text: "Sorry, I'm having trouble responding right now. Please try again or contact support directly.",
          sender: "bot",
          timestamp: new Date(),
          pageContext: config.context.page
        }

        const withFallback = trimHistory([...messagesRef.current, fallbackMessage], historyLimit)
        setMessages(withFallback)
        messagesRef.current = withFallback
      } finally {
        setIsTyping(false)
      }
    },
    [config.context, getBotResponse, historyLimit, isTyping]
  )

  const handleQuickReply = useCallback(
    async (prompt: string) => {
      await sendMessage(prompt)
    },
    [sendMessage]
  )

  const connectToAgent = useCallback(() => {
    if (!config.contact) return

    const timestamp = new Date()
    const introMessage: ChatMessage = {
      id: `bot-contact-${timestamp.getTime()}`,
      text: config.contact.intro,
      sender: "bot",
      timestamp,
      pageContext: config.context.page
    }

    const withIntro = trimHistory([...messagesRef.current, introMessage], historyLimit)
    setMessages(withIntro)
    messagesRef.current = withIntro

    if (config.contact.details.length === 0) return

    setTimeout(() => {
      const detailsMessage: ChatMessage = {
        id: `bot-contact-details-${Date.now()}`,
        text: config.contact!.details.join("\n"),
        sender: "bot",
        timestamp: new Date(),
        pageContext: config.context.page
      }

      const withDetails = trimHistory([...messagesRef.current, detailsMessage], historyLimit)
      setMessages(withDetails)
      messagesRef.current = withDetails
    }, 400)
  }, [config.contact, config.context.page, historyLimit])

  const clearHistory = useCallback(() => {
    const fallback = buildFallbackGreeting(config)
    setMessages(fallback)
    messagesRef.current = fallback

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(config.storageKey)
      } catch (error) {
        console.error("Failed to clear chatbot history:", error)
      }
    }
  }, [config])

  return {
    isOpen,
    toggleOpen,
    setOpen: setIsOpen,
    messages,
    inputValue,
    setInputValue,
    isTyping,
    quickReplies,
    sendMessage,
    handleQuickReply,
    connectToAgent,
    clearHistory,
    hasContactOption: Boolean(config.contact)
  }
}
