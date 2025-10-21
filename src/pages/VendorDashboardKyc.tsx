import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useVendor } from "@/hooks/use-vendor"
import { VendorLayout } from "@/components/vendor-layout"
import { updateVendorStore } from "@/lib/firebase-vendors"
import { useToast } from "@/hooks/use-toast"
import { Shield, CheckCircle, AlertCircle, Clock, UserCheck } from "lucide-react"
import { validateBankAccountData, createCustomer, resolveBankAccount, resolveBvn, resolveBankFromAccountNumber, CustomerData, BankAccountData, BvnData } from "@/lib/paystack-kyc"
import { NIGERIAN_BANKS, getCurrentBanksInfo } from "@/lib/nigerian-banks"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function VendorDashboardKyc() {
  const { vendor, activeStore, refreshStores } = useVendor()
  const { toast } = useToast()
  const [kycData, setKycData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
    bvn: ""
  })

  const [nigerianBank, setNigerianBank] = useState(NIGERIAN_BANKS)
  
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected" | "flagged">("pending")
  const [isVerifyingCustomer, setIsVerifyingCustomer] = useState(false)
  const [isVerifyingBank, setIsVerifyingBank] = useState(false)
  const [isVerifyingBvn, setIsVerifyingBvn] = useState(false)
  const [isResolvingAccount, setIsResolvingAccount] = useState(false)
  const [customerId, setCustomerId] = useState("");

  // Ref to track if we've already resolved the bank for the current account number
  const resolvedAccountNumberRef = useRef<string>("")

  let getAllCurrentBank = []

  const requestCurrentBanks = async()=>{

    const getCurrentBankInfos = await getCurrentBanksInfo()
    console.log("getCurrentBankInfos", getCurrentBankInfos)
    setNigerianBank(getCurrentBankInfos)
  }

  useEffect(()=>{
      requestCurrentBanks()
  }, [])


  // Auto-resolve bank when account number is entered
  useEffect(() => {
    
    const resolveBankFromAccount = async () => {
      
      // Only attempt to resolve if we have a valid account number (10-12 digits) 
      // and we haven't already resolved for this account number
      if (kycData.accountNumber.length >= 10 && 
          kycData.accountNumber.length <= 12 &&
          /^\d+$/.test(kycData.accountNumber) && 
          !isResolvingAccount && 
          resolvedAccountNumberRef.current !== kycData.accountNumber) {
        
        // Update the ref to prevent multiple resolutions for the same account number
        resolvedAccountNumberRef.current = kycData.accountNumber
        setIsResolvingAccount(true)
        if(kycData.accountNumber !== "" && kycData.bankCode !== ""){
            try {
              // Call the Paystack API to resolve the bank from account number
              const bankResult = await resolveBankFromAccountNumber(kycData.accountNumber, kycData.bankCode)
              
              // Also try to resolve the account name
              let accountName = ""
              try {
                const fullName = `${kycData.firstName} ${kycData.lastName}`.trim()
                const bankAccountData: BankAccountData = {
                  bank_code: bankResult.bank_code,
                  country_code: "NG",
                  account_number: bankResult?.account_number || kycData.accountNumber,
                  account_name: bankResult?.account_name
                }
                // const accountResult = await resolveBankAccount(bankAccountData, fullName)
                accountName = bankResult.account_name
              } catch (accountError) {
                console.error("Error resolving account name:", accountError)
                // Use a default account name if we can't resolve it
                accountName = `${kycData.firstName} ${kycData.lastName}`.trim() || "Account Holder"
              }
              
              setKycData(prev => ({
                ...prev,
                bankCode: bankResult.bank_code,
                bankName: kycData.bankName,
                accountName: accountName
              }))
              
              toast({
                title: "Bank Detected",
                description: `Account resolved to ${bankResult.bank_name}`,
              })
          } catch (error) {
              console.error("Error resolving bank:", error)
              toast({
                title: "Bank Detection Failed",
                description: "Could not automatically detect bank. Please select manually.",
                variant: "destructive",
              })
          } finally {
              setIsResolvingAccount(false)
          }
        }
        
      }
    }
    
    // Add a small delay to avoid too many API calls while typing
    const timer = setTimeout(() => {
      if (kycData.accountNumber.length >= 10) {
        resolveBankFromAccount()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [kycData.accountNumber, kycData.bankCode, isResolvingAccount, toast])

  const handleInputChange = (field: string, value: string) => {
    setKycData(prev => ({ ...prev, [field]: value }))
    
    // Clear bank selection when account number changes significantly
    if (field === "accountNumber") {
      // Reset the resolved account number ref when the account number changes significantly
      if (value.length < 10 || !/^\d+$/.test(value)) {
        resolvedAccountNumberRef.current = ""
        
        const selectedBank = nigerianBank.find(bank => bank.code === value)

        setKycData(prev => ({ ...prev, bankCode: kycData?.bankCode, bankName: selectedBank?.name, accountName: "" }))
      }
    }
    
    // Auto-populate bank name when bank code is selected
    if (field === "bankCode") {
      const selectedBank = nigerianBank.find(bank => bank.code === value)
      if (selectedBank) {
        setKycData(prev => ({ ...prev, bankName: selectedBank.name }))
      }
    }
  }

  const handleVerifyCustomer = async () => {
    if (!activeStore) return
    
    setIsVerifyingCustomer(true)
    try {
      // Validate customer data
      const customerData: CustomerData = {
        first_name: kycData.firstName,
        last_name: kycData.lastName,
        email: kycData.email,
        phone: kycData.phone
      }
      
      // In a real implementation, this would call the Paystack API
      // For now, we'll simulate the verification
      const result = await createCustomer(customerData);
      setCustomerId(result.customer_code);
      console.log(`CUSTOMER ID  ${result.id} CUSTOMER CODE ${result.customer_code}`)
      // Update vendor's KYC status
      await updateVendorStore(activeStore.id, {
        kycStatus: "Pending"
      })
      
      await refreshStores()
      setVerificationStatus("Pending")
      
      toast({
        title: "Customer Created",
        description: `Customer ID: ${result.id}`
      });
      setKycData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountName: "",
        bvn: ""
      })
      // await new Promise(resolve => setTimeout(resolve, 1000))
      
      // // Update vendor's KYC status
      // await updateVendorStore(activeStore.id, {
      //   kycStatus: "verified"
      // })
      
      // await refreshStores()
      // setVerificationStatus("verified")
      
      // toast({
      //   title: "Success",
      //   description: "Customer information verified successfully.",
      // })
    } catch (error) {
      console.error("Error verifying customer:", error)
      toast({
        title: "Error",
        description: "Failed to verify customer information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingCustomer(false)
    }
  }

  const handleVerifyBankAccount = async () => {
    if (!activeStore) return
    
    setIsVerifyingBank(true)
    try {
      // Validate bank account data
      const bankAccountData: BankAccountData = {
        bank_code: kycData.bankCode,
        country_code: "NG", // Assuming Nigeria
        account_number: kycData.accountNumber,
        account_name: kycData.accountName
      }
      
      // In a real implementation, this would call the Paystack API
      // For now, we'll simulate the verification
      // await new Promise(resolve => setTimeout(resolve, 1000))
      await validateBankAccountData(bankAccountData)
      // Update vendor's KYC status if not already verified
      if (verificationStatus !== "verified") {
        await updateVendorStore(activeStore.id, {
          kycStatus: "verified"
        })
        await refreshStores()
        setVerificationStatus("verified")
      }
      
      toast({
        title: "Success",
        description: "Bank account verified successfully.",
      })
    } catch (error) {
      console.error("Error verifying bank account:", error)
      toast({
        title: "Error",
        description: "Failed to verify bank account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingBank(false)
    }
  }

  const handleVerifyBvn = async () => {
    if (!activeStore) return
    
    setIsVerifyingBvn(true)
    try {
      // Validate BVN data
      const bvnData: BvnData = {
        bvn: kycData.bvn,
        first_name: kycData.firstName,
        last_name: kycData.lastName
      }
      
      // In a real implementation, this would call the Paystack API
      const result = await resolveBvn(bvnData, `${kycData.firstName} ${kycData.lastName}`)
      
      // Update vendor's KYC status if verification is successful
      if (result.verified) {
        await updateVendorStore(activeStore.id, {
          kycStatus: "verified"
        })
        await refreshStores()
        setVerificationStatus("verified")
        
        toast({
          title: "Success",
          description: "BVN verified successfully.",
        })
      } else {
        toast({
          title: "Verification Failed",
          description: "BVN verification was not successful. Please check the details and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying BVN:", error)
      toast({
        title: "Error",
        description: "Failed to verify BVN. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingBvn(false)
    }
  }

  return (
    <VendorLayout 
      title="KYC Verification" 
      description="Complete your Know Your Customer verification to unlock all vendor features"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Know Your Customer (KYC) Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Why KYC is Important</h3>
                <p className="text-sm text-blue-700">
                  KYC verification helps us ensure the security of your account and comply with financial regulations. 
                  Verified vendors have higher transaction limits, access to advanced features, and increased customer trust.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Customer ID</p>
                        <p className="font-medium">CUS_xxx</p>
                      </div>
                      <Badge variant="outline">
                        {verificationStatus === "verified" ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        ) : verificationStatus === "rejected" ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            Rejected
                          </span>
                        ) : verificationStatus === "flagged" ? (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertCircle className="h-3 w-3" />
                            Flagged
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input 
                        value={kycData.firstName} 
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input 
                        value={kycData.lastName} 
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        value={kycData.email} 
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input 
                        value={kycData.phone} 
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleVerifyCustomer}
                      disabled={verificationStatus === "verified" || isVerifyingCustomer}
                    >
                      {isVerifyingCustomer ? "Verifying..." : verificationStatus === "verified" ? "Customer Verified" : "Verify Customer Information"}
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Bank Account Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bank Account</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Verification Status</p>
                        <p className="font-medium">
                          {verificationStatus === "verified" ? "Verified" : "Not Verified"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {verificationStatus === "verified" ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        ) : verificationStatus === "rejected" ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            Rejected
                          </span>
                        ) : verificationStatus === "flagged" ? (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertCircle className="h-3 w-3" />
                            Flagged
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">

                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Select onValueChange={(value) => handleInputChange("bankCode", value)} value={kycData.bankCode} disabled={isResolvingAccount}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select or auto-detected bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {nigerianBank.map((bank) => (
                              <SelectItem key={bank.code} value={bank.code}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input 
                          value={kycData.accountNumber} 
                          onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                          placeholder="Enter account number (10-12 digits)"
                          maxLength={12}
                        />
                        {isResolvingAccount && (
                          <p className="text-sm text-blue-500">Detecting bank and account name...</p>
                        )}
                      </div>
                      
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input 
                        value={kycData.bankName} 
                        onChange={(e) => handleInputChange("bankName", e.target.value)}
                        placeholder="Bank name will be auto-filled"
                        readOnly
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input 
                        value={kycData.accountName} 
                        onChange={(e) => handleInputChange("accountName", e.target.value)}
                        placeholder="Account name will be auto-filled"
                        readOnly
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleVerifyBankAccount}
                      disabled={verificationStatus === "verified" || isVerifyingBank || !kycData.accountNumber || !kycData.bankCode}
                    >
                      {isVerifyingBank ? "Verifying..." : verificationStatus === "verified" ? "Bank Account Verified" : "Verify Bank Account"}
                    </Button>
                  </CardContent>
                </Card>
                
                {/* BVN Verification */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Bank Verification Number (BVN)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-yellow-800 mb-2">What is BVN?</h3>
                      <p className="text-sm text-yellow-700">
                        The Bank Verification Number (BVN) is a biometric identification system 
                        implemented by the Central Bank of Nigeria to verify the identity of bank customers.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">BVN Verification Status</p>
                        <p className="font-medium">
                          {verificationStatus === "verified" ? "Verified" : "Not Verified"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {verificationStatus === "verified" ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        ) : verificationStatus === "rejected" ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            Rejected
                          </span>
                        ) : verificationStatus === "flagged" ? (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertCircle className="h-3 w-3" />
                            Flagged
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bvn">BVN (11 digits)</Label>
                      <Input 
                        id="bvn"
                        value={kycData.bvn} 
                        onChange={(e) => handleInputChange("bvn", e.target.value)}
                        placeholder="Enter your 11-digit BVN"
                        maxLength={11}
                      />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleVerifyBvn}
                      disabled={verificationStatus === "verified" || isVerifyingBvn || kycData.bvn.length !== 11}
                    >
                      {isVerifyingBvn ? "Verifying..." : verificationStatus === "verified" ? "BVN Verified" : "Verify BVN"}
                    </Button>
                    
                    {kycData.bvn.length > 0 && kycData.bvn.length !== 11 && (
                      <p className="text-sm text-red-500">BVN must be exactly 11 digits</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">Next Steps</h3>
                <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>Complete customer information verification</li>
                  <li>Verify your bank account details</li>
                  <li>Verify your Bank Verification Number (BVN)</li>
                  <li>Upload required identification documents</li>
                  <li>Wait for admin approval (usually within 24 hours)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  )
}