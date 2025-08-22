"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const { register, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await register(email, password, name)
      toast({
        title: "Account created!",
        description: "Your account has been successfully created.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)

    try {
      await loginWithGoogle()
      toast({
        title: "Welcome!",
        description: "Your account has been successfully created with Google.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Google signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="w-full max-w-md">
        <Card className="border-gray-800/30 shadow-lg shadow-black/10 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <h1 className="text-2xl font-semibold text-center text-gray-100 mb-1">Create Your Account</h1>
            <p className="text-gray-400 text-center text-sm mb-6">
              Join us to start shopping for authentic foods
            </p>

          <Button
            type="button"
            variant="outline"
              className="w-full h-12 border-gray-700/30 bg-[#1a212b]/50 hover:bg-[#1a212b] hover:border-gray-600/50 transition-all duration-200 mb-6 text-gray-100"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  <span>Creating account...</span>
                </div>
            ) : (
              <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.7663 12.2764C23.7663 11.4607 23.7001 10.6406 23.559 9.83807H12.2402V14.4591H18.722C18.453 15.9494 17.5888 17.2678 16.3233 18.1056V21.1039H20.1903C22.4611 19.0139 23.7663 15.9274 23.7663 12.2764Z" fill="#4285F4"/>
                    <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
                    <path d="M5.50253 14.3003C4.99987 12.8099 4.99987 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC04"/>
                    <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
                </svg>
                  <span>Continue with Google</span>
              </>
            )}
          </Button>

            <div className="relative py-2 mb-6">
            <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-700/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1a212b] px-2 text-gray-400">Or continue with email</span>
            </div>
          </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
              <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                    placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-[#1a212b]/80 border-gray-700/30 focus:border-green-500/50 h-12"
                  required
                />
              </div>
            </div>

              <div>
              <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                    placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[#1a212b]/80 border-gray-700/30 focus:border-green-500/50 h-12"
                  required
                />
              </div>
            </div>

              <div>
              <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                    placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-[#1a212b]/80 border-gray-700/30 focus:border-green-500/50 h-12"
                  required
                />
                  <button
                  type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                  ) : (
                      <Eye className="h-4 w-4" />
                  )}
                  </button>
              </div>
            </div>

              <div>
              <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-[#1a212b]/80 border-gray-700/30 focus:border-green-500/50 h-12"
                  required
                />
                  <button
                  type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                  ) : (
                      <Eye className="h-4 w-4" />
                  )}
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-md text-sm mt-2">
                <p className="font-medium mb-1 text-blue-400">🔒 Secure Account Creation</p>
                <p className="text-blue-300/90">Your account will be created using Firebase Authentication with industry-standard security practices.</p>
            </div>
            
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-500 text-white h-12 mt-2 font-medium transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
            </div>
                )}
            </Button>
          </form>
          </div>

          <CardFooter className="flex justify-center py-6 bg-[#141c28] border-t border-gray-800/30">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
          </div>
    </div>
  )
}
