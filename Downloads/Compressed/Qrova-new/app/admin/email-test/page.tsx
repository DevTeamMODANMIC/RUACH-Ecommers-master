"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
// Email functions will be called via API routes to avoid client-side module issues
import { Mail, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState("victorralph407@gmail.com")
  const [testName, setTestName] = useState("Victor Ralph")
  const [customSubject, setCustomSubject] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const { toast } = useToast()

  const addTestResult = (type: 'success' | 'error', message: string, details?: any) => {
    const result = {
      id: Date.now(),
      type,
      message,
      details,
      timestamp: new Date().toLocaleString()
    }
    setTestResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
  }

  const testCustomEmail = async () => {
    if (!testEmail || !customSubject || !customMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in email, subject, and message.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: customSubject,
          message: customMessage
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        addTestResult('success', `Custom email sent successfully to ${testEmail}`)
        toast({
          title: "Email Sent!",
          description: `Test email sent to ${testEmail}`,
        })
      } else {
        addTestResult('error', `Failed to send custom email: ${result.error}`)
        toast({
          title: "Email Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addTestResult('error', `Error sending custom email: ${error.message}`)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testWelcomeEmail = async () => {
    if (!testEmail || !testName) {
      toast({
        title: "Missing Information",
        description: "Please fill in email and name.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/test-email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          name: testName
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        addTestResult('success', `Welcome email sent successfully to ${testEmail}`)
        toast({
          title: "Welcome Email Sent!",
          description: `Welcome email sent to ${testEmail}`,
        })
      } else {
        addTestResult('error', `Failed to send welcome email: ${result.error}`)
        toast({
          title: "Welcome Email Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addTestResult('error', `Error sending welcome email: ${error.message}`)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testOrderConfirmation = async () => {
    if (!testEmail || !testName) {
      toast({
        title: "Missing Information",
        description: "Please fill in email and name.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/test-email/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          name: testName
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        addTestResult('success', `Order confirmation email sent successfully to ${testEmail}`)
        toast({
          title: "Order Email Sent!",
          description: `Order confirmation sent to ${testEmail}`,
        })
      } else {
        addTestResult('error', `Failed to send order email: ${result.error}`)
        toast({
          title: "Order Email Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addTestResult('error', `Error sending order email: ${error.message}`)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testPasswordReset = async () => {
    if (!testEmail || !testName) {
      toast({
        title: "Missing Information",
        description: "Please fill in email and name.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/test-email/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          name: testName
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        addTestResult('success', `Password reset email sent successfully to ${testEmail}`)
        toast({
          title: "Password Reset Email Sent!",
          description: `Password reset email sent to ${testEmail}`,
        })
      } else {
        addTestResult('error', `Failed to send password reset email: ${result.error}`)
        toast({
          title: "Password Reset Email Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addTestResult('error', `Error sending password reset email: ${error.message}`)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10 max-w-4xl">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Email Testing Center</h1>
          <p className="text-gray-500">Test your Grova email system and templates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Configuration
              </CardTitle>
              <CardDescription>
                Set up your test parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="your-email@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="testName">Test Name</Label>
                <Input
                  id="testName"
                  type="text"
                  placeholder="John Doe"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Email Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Custom Email Test
              </CardTitle>
              <CardDescription>
                Send a custom test email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customSubject">Subject</Label>
                <Input
                  id="customSubject"
                  type="text"
                  placeholder="Test Email Subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customMessage">Message</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Your test message here..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={testCustomEmail}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Custom Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Template Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Email Template Tests</CardTitle>
            <CardDescription>
              Test different email templates used throughout your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={testWelcomeEmail}
                disabled={isLoading}
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
              >
                <Mail className="h-6 w-6" />
                <span className="text-sm">Welcome Email</span>
              </Button>

              <Button
                onClick={testOrderConfirmation}
                disabled={isLoading}
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
              >
                <Mail className="h-6 w-6" />
                <span className="text-sm">Order Confirmation</span>
              </Button>

              <Button
                onClick={testPasswordReset}
                disabled={isLoading}
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
              >
                <Mail className="h-6 w-6" />
                <span className="text-sm">Password Reset</span>
              </Button>

              <Button
                onClick={() => window.open('https://app.brevo.com/', '_blank')}
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
              >
                <Mail className="h-6 w-6" />
                <span className="text-sm">Brevo Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Recent email test results (last 10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      result.type === 'success'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    {result.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${
                        result.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.message}
                      </p>
                      <p className={`text-xs ${
                        result.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• <strong>Test emails</strong> will be sent to the email address you specify above</p>
              <p>• <strong>Check your spam folder</strong> if test emails don't arrive in inbox</p>
              <p>• <strong>Brevo Dashboard</strong> button opens your email analytics and logs</p>
              <p>• <strong>Domain verification</strong> in Brevo improves deliverability</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}