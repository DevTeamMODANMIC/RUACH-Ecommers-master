import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useVendor } from "@/hooks/use-vendor"
import { VendorLayout } from "@/components/vendor-layout"
import { updateVendorStore } from "@/lib/firebase-vendors"
import { DollarSign, Wallet, Shield, AlertCircle, CheckCircle, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VendorDashboardWallet() {
  const { activeStore, refreshStores } = useVendor()
  const { toast } = useToast()
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")

  // Check if KYC is verified
  const isKycVerified = activeStore?.kycStatus === "verified"
  
  // Wallet balance (default to 0 if not set)
  const walletBalance = activeStore?.walletBalance || 0

  const handleWithdraw = async () => {
    if (!activeStore) return
    
    // Check KYC status before allowing withdrawal
    if (!isKycVerified) {
      toast({
        title: "KYC Required",
        description: "Please complete your KYC verification before withdrawing funds.",
        variant: "destructive",
      })
      return
    }
    
    const amount = parseFloat(withdrawalAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      })
      return
    }
    
    if (amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You cannot withdraw more than your available balance.",
        variant: "destructive",
      })
      return
    }
    
    if (!activeStore.payoutSettings) {
      toast({
        title: "Payout Settings Required",
        description: "Please configure your payout settings before withdrawing.",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)
    try {
      // In a real implementation, this would initiate a withdrawal request
      // For now, we'll just show a success message
      
      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for ${formatCurrency(amount)} has been submitted successfully.`,
      })
      
      // Reset form
      setWithdrawalAmount("")
    } catch (error) {
      console.error("Error processing withdrawal:", error)
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <VendorLayout 
      title="Wallet" 
      description="Manage your wallet balance and withdrawals"
    >
      <div className="space-y-6">
        {/* Wallet Access Banner */}
        <Card className={isKycVerified ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Wallet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">Wallet Access</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Your wallet is accessible. {isKycVerified ? "You can perform all wallet operations." : "Complete KYC to enable withdrawals and other financial operations."}
                </p>
              </div>
              {isKycVerified ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Fully Accessible
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Limited Access
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(walletBalance)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Available balance
            </p>
          </CardContent>
        </Card>

        {/* Withdrawal Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Withdraw Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isKycVerified && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-900">Withdrawal Locked</h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      Complete your KYC verification to enable withdrawals.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-3 bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      onClick={() => window.location.href = "/vendor/dashboard/kyc"}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Complete KYC Verification
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="withdrawalAmount" className="text-sm font-medium">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    ₦
                  </span>
                  <input
                    id="withdrawalAmount"
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isWithdrawing || !isKycVerified}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Minimum withdrawal: {formatCurrency(5000)}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Payout Method
                </label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {activeStore?.payoutSettings ? (
                    <div>
                      <p className="font-medium">{activeStore.payoutSettings.bankName}</p>
                      <p className="text-sm text-gray-600">
                        {activeStore.payoutSettings.accountName}
                      </p>
                      <p className="text-xs text-gray-500">
                        ****{activeStore.payoutSettings.accountNumber.slice(-4)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No payout method configured
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleWithdraw}
              disabled={isWithdrawing || walletBalance === 0 || !isKycVerified}
              className="w-full md:w-auto"
            >
              {isWithdrawing ? "Processing..." : "Withdraw Funds"}
            </Button>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">No transaction history available.</p>
              <p className="text-sm text-gray-400 mt-1">
                Transaction history will appear here once you start receiving payments.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Features */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${isKycVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CheckCircle className={`h-4 w-4 ${isKycVerified ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-medium">View Balance</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Check your current wallet balance at any time.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${isKycVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CheckCircle className={`h-4 w-4 ${isKycVerified ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-medium">Transaction History</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    View all transactions and payment history.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${isKycVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {isKycVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Withdraw Funds</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Transfer your wallet balance to your bank account.
                    {!isKycVerified && (
                      <span className="text-yellow-700"> (Requires KYC verification)</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${isKycVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {isKycVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Automatic Payouts</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Set up automatic transfers to your bank account.
                    {!isKycVerified && (
                      <span className="text-yellow-700"> (Requires KYC verification)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  )
}