import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useVendor } from "@/hooks/use-vendor"
import { VendorLayout } from "@/components/vendor-layout"
import { updateVendorStore } from "@/lib/firebase-vendors"
import { DollarSign, Wallet, Shield, AlertCircle, CheckCircle, Lock, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"


export default function VendorDashboardWallet() {

  const { user, profile, updateProfile } = useAuth()
  console.log(profile?.kycData, "sending information")
  const [accData, setAccData] = useState(undefined)
  const { activeStore, refreshStores } = useVendor()
  const { toast } = useToast()
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [storeTransferReciptID, setStoreTransferReciptID] = useState(undefined)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [transferAmount, setTransferAmount] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)
  // console.log(accData, "accData information")

  // Check if KYC is verified
  const isKycVerified = activeStore?.kycStatus === "verified"
  
  // Wallet balances (default to 0 if not set)
  const walletBalance = activeStore?.walletBalance || 0
  const paidOutBalance = activeStore?.paidOutBalance || 0
  const pendingBalance = activeStore?.pendingBalance || 0 // Earnings not yet transferred to wallet
  const totalEarnings = walletBalance + paidOutBalance + pendingBalance

 

  async function createTransferRecipient() {
    try {
      const recipiantObj = {
        type: "nuban", // For Nigerian bank accounts
        name: accData?.bankAccount?.account_name, // Account holder name
        account_number: accData?.bankAccount?.account_number, // Valid 10-digit bank account number
        bank_code: accData?.bankAccount?.bank_code, // Example: GTBank = 058, Access Bank = 044
        currency: "NGN"
      }
      const response = await fetch("https://api.paystack.co/transferrecipient", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipiantObj)
      });

      const data = await response.json();

      if (data.status) {
        console.log("✅ Transfer recipient created successfully!");
        // console.log("Recipient Code:", data.data.recipient_code);
        // console.log("Full Response:", data.data);
        setStoreTransferReciptID(data.data?.recipient_code) //storeTransferReciptID
        return data.data
      } else {
        console.error("❌ Error creating recipient:", data.message);
      }
    } catch (error) {
      console.error("⚠️ Request failed:", error);
    }
  } 

  useEffect( ()=>{
    if(profile?.kycData){
      setAccData(profile?.kycData)
    }
  }, [profile?.kycData])
  
  useEffect(()=>{
    if(accData){
      console.log(accData)
      createTransferRecipient()//.then(data=>console.log(data, 'getTransferRec'))
      // console.log(getTransferRec, "getTransferRec")
    }

  }, [accData])

  // Handle transfer from pending balance to wallet
  const handleTransferToWallet = async () => {
    if (!activeStore) return

    const amount = parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to transfer.",
        variant: "destructive",
      })
      return
    }

    if (amount > pendingBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You cannot transfer more than your pending balance.",
        variant: "destructive",
      })
      return
    }

    setIsTransferring(true)
    try {
      // Update the store balances
      await updateVendorStore(activeStore.id, {
        pendingBalance: pendingBalance - amount,
        walletBalance: walletBalance + amount,
      })

      await refreshStores()

      toast({
        title: "Transfer Successful",
        description: `${formatCurrency(amount)} has been transferred to your wallet.`,
      })

      setTransferAmount("")
      setShowTransferModal(false)
    } catch (error) {
      console.error("Error transferring to wallet:", error)
      toast({
        title: "Error",
        description: "Failed to transfer funds. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTransferring(false)
    }
  }

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
    // MORE CHANGESS
    
    // if (!activeStore.payoutSettings) {
    //   toast({
    //     title: "Payout Settings Required",
    //     description: "Please configure your payout settings before withdrawing.",
    //     variant: "destructive",
    //   })
    //   return
    // }

    setIsWithdrawing(true)
    try {
      // In a real implementation, this would initiate a withdrawal request
      // For now, we'll just show a success message
      // async function initiateTransfer(recipientCode) {
        const body = {
          source: "balance",
          amount: withdrawalAmount, // amount in kobo
          recipient: storeTransferReciptID,
          reason: 'Vendore Payout',
        };

        const res = await fetch("https://api.paystack.co/transfer", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!data.status) throw new Error(data.message);

        console.log("✅ Transfer initiated successfully!");
        console.log("Transfer Reference:", data.data.reference);
        console.log("Status:", data.data.status);
        // return data.data;
      

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for ${formatCurrency(amount)} has been submitted successfully.`,
      })
      // inset code from here
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

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Earnings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <DollarSign className="h-4 w-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalEarnings)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pending: {formatCurrency(pendingBalance)}
              </p>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Wallet className="h-4 w-4" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(walletBalance)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>

          {/* Paid Out Balance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <CheckCircle className="h-4 w-4" />
                Paid Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(paidOutBalance)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total withdrawn
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setShowTransferModal(true)}
            disabled={pendingBalance === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Transfer to Wallet
          </Button>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            disabled={walletBalance === 0 || !isKycVerified}
            variant="outline"
            className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
          >
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Withdraw to Bank
          </Button>
        </div>

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
                  {profile?.kycData ? (
                    <div>
                      <p className="font-medium">{accData?.bankAccount?.bank_name}</p>
                      <p className="text-sm text-gray-600">
                        {accData?.bankAccount?.account_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ****{accData?.bankAccount?.account_number.slice(-4)}
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

      {/* Transfer to Wallet Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer to Wallet</DialogTitle>
            <DialogDescription>
              Transfer funds from your pending earnings to your wallet balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Available to transfer:</span>
              <span className="font-medium">{formatCurrency(pendingBalance)}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferAmount">Amount to Transfer</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  ₦
                </span>
                <Input
                  id="transferAmount"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTransferAmount(pendingBalance.toString())}
              className="text-xs"
            >
              Transfer All
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransferToWallet} disabled={isTransferring}>
              {isTransferring ? "Transferring..." : "Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw to Bank Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw to Bank</DialogTitle>
            <DialogDescription>
              Withdraw funds from your wallet to your bank account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!isKycVerified && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800 text-sm">
                  <Lock className="h-4 w-4" />
                  <span>Complete KYC verification to enable withdrawals.</span>
                </div>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Available to withdraw:</span>
              <span className="font-medium">{formatCurrency(walletBalance)}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Amount to Withdraw</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  ₦
                </span>
                <Input
                  id="withdrawAmount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  disabled={!isKycVerified}
                />
              </div>
              <p className="text-xs text-gray-500">
                Minimum withdrawal: {formatCurrency(5000)}
              </p>
            </div>
            {profile?.kycData && (
              <div className="space-y-2">
                <Label>Payout Account</Label>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  <p className="font-medium">{accData?.bankAccount?.bank_name}</p>
                  <p className="text-gray-600">{accData?.bankAccount?.account_name}</p>
                  <p className="text-gray-500">****{accData?.bankAccount?.account_number?.slice(-4)}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                handleWithdraw()
                setShowWithdrawModal(false)
              }} 
              disabled={isWithdrawing || !isKycVerified}
            >
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorLayout>
  )
}