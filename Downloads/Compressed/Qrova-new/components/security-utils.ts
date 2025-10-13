// Security utilities for input validation and sanitization
export class SecurityUtils {
  // Email validation with comprehensive regex
  static validateEmail(email: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email) && email.length <= 254
  }

  // Password strength validation
  static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
    strength: "weak" | "medium" | "strong"
  } {
    const errors: string[] = []
    let score = 0

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    } else {
      score += 1
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    } else {
      score += 1
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    } else {
      score += 1
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    } else {
      score += 1
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("Password must contain at least one special character")
    } else {
      score += 1
    }

    const strength = score <= 2 ? "weak" : score <= 4 ? "medium" : "strong"

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    }
  }

  // XSS prevention - sanitize input
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim()
  }

  // Rate limiting helper
  static checkRateLimit(identifier: string, maxAttempts = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const key = `login_attempts_${identifier}`
    const now = Date.now()

    try {
      const stored = localStorage.getItem(key)
      const attempts = stored ? JSON.parse(stored) : { count: 0, firstAttempt: now }

      // Reset if window has passed
      if (now - attempts.firstAttempt > windowMs) {
        attempts.count = 0
        attempts.firstAttempt = now
      }

      if (attempts.count >= maxAttempts) {
        return false // Rate limited
      }

      attempts.count += 1
      localStorage.setItem(key, JSON.stringify(attempts))
      return true
    } catch {
      return true // Allow if localStorage fails
    }
  }

  // Clear rate limit on successful login
  static clearRateLimit(identifier: string): void {
    const key = `login_attempts_${identifier}`
    localStorage.removeItem(key)
  }
}
