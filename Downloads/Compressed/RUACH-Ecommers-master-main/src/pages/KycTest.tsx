import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createCustomer, resolveBankAccount, validateCustomerData, validateBankAccountData } from "@/lib/paystack-kyc";

export default function KycTestPage() {
  const { toast } = useToast();
  const [customerData, setCustomerData] = useState({
    email: "anna@example.com",
    first_name: "Anna",
    last_name: "Bron",
    phone: "08012345678"
  });
  
  const [bankData, setBankData] = useState({
    bank_code: "632005",
    country_code: "ZA",
    account_number: "012456789",
    account_name: "Ann Bron",
    account_type: "personal",
    document_type: "identityNumber",
    document_number: "1234567890123"
  });
  
  const [customerId, setCustomerId] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleCustomerDataChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleBankDataChange = (field: string, value: string) => {
    setBankData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCreateCustomer = async () => {
    if (!validateCustomerData(customerData)) {
      toast({
        title: "Invalid Customer Data",
        description: "Please check that all customer fields are filled correctly.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = await createCustomer(customerData);
      setCustomerId(result.id);
      toast({
        title: "Customer Created",
        description: `Customer ID: ${result.id}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyBankAccount = async () => {
    if (!customerId) {
      toast({
        title: "No Customer",
        description: "Please create a customer first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateBankAccountData(bankData)) {
      toast({
        title: "Invalid Bank Data",
        description: "Please check that all bank fields are filled correctly.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const fullName = `${customerData.first_name} ${customerData.last_name}`;
      const result = await resolveBankAccount(bankData, fullName);
      setVerificationResult(result);
      
      toast({
        title: "Bank Account Verified",
        description: result.verified 
          ? "Bank account successfully verified!" 
          : "Bank account verification failed."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify bank account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">KYC Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Creation Section */}
          <Card>
            <CardHeader>
              <CardTitle>Create Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={customerData.email}
                  onChange={(e) => handleCustomerDataChange("email", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={customerData.first_name}
                  onChange={(e) => handleCustomerDataChange("first_name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={customerData.last_name}
                  onChange={(e) => handleCustomerDataChange("last_name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => handleCustomerDataChange("phone", e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleCreateCustomer} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Customer"}
              </Button>
              
              {customerId && (
                <div className="p-3 bg-green-100 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>Customer ID:</strong> {customerId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Bank Verification Section */}
          <Card>
            <CardHeader>
              <CardTitle>Verify Bank Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank_code">Bank Code</Label>
                <Input
                  id="bank_code"
                  value={bankData.bank_code}
                  onChange={(e) => handleBankDataChange("bank_code", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country_code">Country Code</Label>
                <Input
                  id="country_code"
                  value={bankData.country_code}
                  onChange={(e) => handleBankDataChange("country_code", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={bankData.account_number}
                  onChange={(e) => handleBankDataChange("account_number", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={bankData.account_name}
                  onChange={(e) => handleBankDataChange("account_name", e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleVerifyBankAccount} 
                disabled={loading || !customerId}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify Bank Account"}
              </Button>
              
              {verificationResult && (
                <div className={`p-3 rounded-md ${verificationResult.verified ? "bg-green-100" : "bg-red-100"}`}>
                  <p className="text-sm">
                    <strong>Verification Status:</strong> {verificationResult.verified ? "Verified" : "Not Verified"}
                  </p>
                  <p className="text-sm">
                    <strong>Match Status:</strong> {verificationResult.match_status}
                  </p>
                  <p className="text-sm">
                    <strong>Account Name:</strong> {verificationResult.account_name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Fill in the customer details and click "Create Customer"</li>
              <li>Once the customer is created, fill in the bank account details</li>
              <li>Click "Verify Bank Account" to check if the account name matches the customer name</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}