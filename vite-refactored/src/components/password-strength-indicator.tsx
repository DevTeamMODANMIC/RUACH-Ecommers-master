

import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
}

export function PasswordStrengthIndicator({ password, showRequirements = false }: PasswordStrengthIndicatorProps) {
  const requirements = [
    { test: (pwd: string) => pwd.length >= 8, text: "At least 8 characters" },
    { test: (pwd: string) => /[a-z]/.test(pwd), text: "One lowercase letter" },
    { test: (pwd: string) => /[A-Z]/.test(pwd), text: "One uppercase letter" },
    { test: (pwd: string) => /\d/.test(pwd), text: "One number" },
    { test: (pwd: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd), text: "One special character" },
  ]

  const metRequirements = requirements.filter((req) => req.test(password)).length
  const strength = metRequirements <= 2 ? "weak" : metRequirements <= 4 ? "medium" : "strong"
  const progress = (metRequirements / requirements.length) * 100

  const getStrengthColor = () => {
    switch (strength) {
      case "weak":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "strong":
        return "bg-green-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStrengthText = () => {
    switch (strength) {
      case "weak":
        return "Weak"
      case "medium":
        return "Medium"
      case "strong":
        return "Strong"
      default:
        return ""
    }
  }

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength:</span>
        <span
          className={`text-sm font-medium ${
            strength === "weak" ? "text-red-500" : strength === "medium" ? "text-yellow-500" : "text-green-500"
          }`}
        >
          {getStrengthText()}
        </span>
      </div>
      <Progress value={progress} className="h-2" />

      {showRequirements && (
        <div className="space-y-1">
          {requirements.map((req, index) => {
            const isMet = req.test(password)
            return (
              <div key={index} className="flex items-center space-x-2 text-sm">
                {isMet ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                <span className={isMet ? "text-green-600" : "text-muted-foreground"}>{req.text}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
