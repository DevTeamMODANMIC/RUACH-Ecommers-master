import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import KycVerification from "@/components/kyc-verification";
import { useAuth } from "@/components/auth-provider";

export default function KycVerificationPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Please log in</h1>
            <p className="text-muted-foreground mb-8">You need to be logged in to complete KYC verification.</p>
            <Button asChild>
              <a href="/login">Log In</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">KYC Verification</h1>
            <p className="text-muted-foreground">Complete your identity verification</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Identity Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Why KYC is Required</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Comply with financial regulations</li>
                  <li>• Protect your account from unauthorized access</li>
                  <li>• Enable withdrawal functionality</li>
                  <li>• Prevent fraud and money laundering</li>
                </ul>
              </div>
              
              <KycVerification />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}