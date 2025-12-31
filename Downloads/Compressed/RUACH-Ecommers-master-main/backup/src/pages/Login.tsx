import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardFooter } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { useAuth } from "../components/auth-provider"
import { useToast } from "../hooks/use-toast"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { SocialLoginButtons } from "../components/social-login-buttons"

export default function LoginPage() {
  // console.log("Testing Server Info")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  
  // Get redirect parameter from URL
  const urlParams = new URLSearchParams(window.location.search)
  const redirectTo = urlParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(email, password)

      toast({
        title: "🎉 Welcome back!",
        description: "You have been successfully logged in to your account.",
        variant: "success",
      })
      
      // Redirect to the intended page or home
      navigate(redirectTo)
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
      // 
      setError(error.message || "Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const getGoogleLogin = await loginWithGoogle()
      console.log("getGoogleLogin", getGoogleLogin)

      toast({
        title: "🎉 Welcome to RUACH-EStore!",
        description: "You have been successfully logged in with Google.",
        variant: "success",
      })

      // Check if user has specific admin privileges
      const adminEmail = "enochehimika@gmail.com" // Fixed typo
      localStorage.setItem("masterMail", adminEmail)
      
      // Only redirect to admin if they're actually an admin and redirect parameter allows it
      if (getGoogleLogin && getGoogleLogin.email === adminEmail && redirectTo.includes('/admin')) {
        console.log("Admin user detected, redirecting to admin")
        navigate("/admin")
      } else {
        // For all other users, go to intended destination or home
        navigate(redirectTo)
      }
      

    } catch (error: any) {

      // console.log(error.message, "family")

      toast({
        title: "Google login failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })

      setError(error.message || "Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="w-full max-w-md">
        <Card className="border-gray-800/30 shadow-lg shadow-black/10 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <h1 className="text-2xl font-semibold text-center text-gray-100 mb-1">Sign in to your account</h1>
            <p className="text-gray-400 text-center text-sm mb-6">
              Enter your email and password to access your account
            </p>
          
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-300 h-12"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-300 h-12"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
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
                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-green-600 hover:text-green-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white h-12 mt-2 font-medium transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
          
          <CardContent className="p-0">
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center px-8">
                <Separator className="w-full bg-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-600">Or continue with</span>
                </div>
              </div>
              
            <div className="px-8 pb-6">
              <SocialLoginButtons 
                onGoogleLogin={handleGoogleLogin}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center py-6 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
