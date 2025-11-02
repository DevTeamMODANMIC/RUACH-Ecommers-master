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
import { Shield, CheckCircle, AlertCircle, Clock, UserCheck, ArrowRight, ArrowLeft } from "lucide-react"
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
  
  // Step-by-step KYC process
  const [currentStep, setCurrentStep] = useState(1) // 1: Customer Info, 2: Bank Account, 3: BVN
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected" | "flagged">("pending")
  const [isVerifyingCustomer, setIsVerifyingCustomer] = useState(false)
  const [isVerifyingBank, setIsVerifyingBank] = useState(false)
  const [isVerifyingBvn, setIsVerifyingBvn] = useState(false)
  const [isResolvingAccount, setIsResolvingAccount] = useState(false)
  const [customerId, setCustomerId] = useState("");

  // Ref to track if we've already resolved the bank for the current account number
  const resolvedAccountNumberRef = useRef<string>("")

  const requestCurrentBanks = async()=>{

    const getCurrentBankInfos = await getCurrentBanksInfo()
    console.log("getCurrentBankInfos", getCurrentBankInfos)
    setNigerianBank(getCurrentBankInfos)
  }

  useEffect(()=>{
      requestCurrentBanks()
  }, [])

  // Initialize verificationStatus based on vendor's KYC status
  useEffect(() => {
    if (activeStore?.kycStatus) {
      setVerificationStatus(activeStore.kycStatus)
    }
    
    // Populate form with existing vendor data if available
    if (activeStore) {
      setKycData(prev => ({
        ...prev,
        email: activeStore.contactEmail || "",
        phone: activeStore.contactPhone || "",
        // Note: Bank information and BVN are not stored in the vendor object for security reasons
      }))
    }
  }, [activeStore])

  // Auto-detect bank and account name when account number is entered
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
              console.log("bankResult", bankResult)
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
                const accountResult = await resolveBankAccount(bankAccountData, fullName)
                // console.log(accountResult, "accountResult")
                accountName = accountResult.account_name
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
  }, [kycData.accountNumber, kycData.bankCode])

  const handleInputChange = (field: string, value: string) => {
    setKycData(prev => ({ ...prev, [field]: value }))
    
    // Clear bank selection and account name when account number changes significantly
    if (field === "accountNumber") {
      // Reset the resolved account number ref when the account number changes significantly
      if (value.length < 10 || !/^\d+$/.test(value)) {
        resolvedAccountNumberRef.current = ""
        setKycData(prev => ({ 
          ...prev, 
          // bankCode: "",
          bankName: "",
          accountName: ""
        }))
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
      
      // Create customer with Paystack
      const result = await createCustomer(customerData);
      console.log('result', result)
      setCustomerId(result.customer_code);
      
      toast({
        title: "Customer Created",
        description: `Customer ID: ${result.id}`
      });
      
      // Move to next step
      setCurrentStep(2);
    } catch (error: any) {
      console.error("Error verifying customer:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to verify customer information. Please try again.",
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
      
      // Validate bank account data first
      if (!validateBankAccountData(bankAccountData)) {
        throw new Error("Invalid bank account data. Please check your inputs.");
      }
      
      // Resolve bank account with Paystack
      const result = await resolveBankAccount(
        bankAccountData,
        `${kycData.firstName} ${kycData.lastName}`
      );
      // STORE TO FIRBBASE RHAPEH VICTORE !!!!!!
      const getBankName = nigerianBank.filter( bank=>bank.code === kycData.bankCode  )
      const storeUserAccountData = {
        ...result,
        bank_name: getBankName[0].name
      }
      // this is what u want to store @storeUserAccountData@

      if (result.verified) {
        toast({
          title: "Success",
          description: "Bank account verified successfully.",
        });
        
        // Move to next step
        setCurrentStep(3);
      } else {
        toast({
          title: "Verification Failed",
          description: "Bank account verification was not successful. Please check the details and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error verifying bank account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to verify bank account. Please try again.",
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
        last_name: kycData.lastName,
        account_number: kycData.accountNumber, // Optional but recommended
        bank_code: kycData.bankCode, 
      }
      
      // Resolve BVN with Paystack
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
          description: "BVN verified successfully. Your KYC process is now complete!",
        })
      } else {
        toast({
          title: "Verification Failed",
          description: "BVN verification was not successful. Please check the details and try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error verifying BVN:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to verify BVN. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingBvn(false)
    }
  }

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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
              {/* Progress indicator */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === step 
                        ? "bg-blue-600 text-white" 
                        : step < currentStep 
                          ? "bg-green-600 text-white" 
                          : "bg-gray-200 text-gray-600"
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step < currentStep ? "bg-green-600" : "bg-gray-200"
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Why KYC is Important</h3>
                <p className="text-sm text-blue-700">
                  KYC verification helps us ensure the security of your account and comply with financial regulations. 
                  Verified vendors have higher transaction limits, access to advanced features, and increased customer trust.
                </p>
              </div>
              
              {/* Step 1: Customer Information */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Step 1: Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Customer ID</p>
                        <p className="font-medium">{customerId || "Not created yet"}</p>
                      </div>
                      <Badge variant="outline">
                        {customerId ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Created
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
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="outline" 
                        disabled
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        onClick={handleVerifyCustomer}
                        disabled={isVerifyingCustomer || !kycData.firstName || !kycData.lastName || !kycData.email || !kycData.phone}
                      >
                        {isVerifyingCustomer ? "Verifying..." : "Verify Customer Information"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Step 2: Bank Account Verification */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Step 2: Bank Account</CardTitle>
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
                        ) : (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Clock className="h-33 w-3" />
                            Pending
                          </span>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Select 
                          onValueChange={(value) => handleInputChange("bankCode", value)} 
                          value={kycData.bankCode} 
                          disabled={isResolvingAccount}
                        >
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
                      <Label>Account Name</Label>
                      <Input 
                        value={kycData.accountName} 
                        onChange={(e) => handleInputChange("accountName", e.target.value)}
                        placeholder="Account name will be auto-filled"
                        readOnly
                      />
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="outline" 
                        onClick={goToPreviousStep}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        onClick={handleVerifyBankAccount}
                        disabled={isVerifyingBank || !kycData.accountNumber || !kycData.bankCode || !kycData.accountName}
                      >
                        {isVerifyingBank ? "Verifying..." : "Verify Bank Account"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Step 3: BVN Verification */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Step 3: Bank Verification Number (BVN)
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
                      {kycData.bvn.length > 0 && kycData.bvn.length !== 11 && (
                        <p className="text-sm text-red-500">BVN must be exactly 11 digits</p>
                      )}
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="outline" 
                        onClick={goToPreviousStep}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        onClick={handleVerifyBvn}
                        disabled={isVerifyingBvn || kycData.bvn.length !== 11}
                      >
                        {isVerifyingBvn ? "Verifying..." : "Verify BVN"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
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