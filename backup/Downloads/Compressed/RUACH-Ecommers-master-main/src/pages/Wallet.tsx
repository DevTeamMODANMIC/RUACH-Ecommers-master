// ... existing imports ...
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/components/auth-provider";
import { DollarSign, Wallet, History, Users, Gift, ArrowUpCircle, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReferralSystem from "@/components/referral-system";
import KycVerification from "@/components/kyc-verification";
import { Link } from "react-router-dom";

// Define withdrawal limits
const MIN_WITHDRAWAL = 1000; // 1000 Naira minimum
const MAX_WITHDRAWAL = 50000; // 50,000 Naira maximum

export default function WalletPage() {
  const { wallet, transactions, referrals, addFunds, withdrawFunds, claimBonus, loading } = useWallet();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Check if user has completed KYC
  const isKycVerified = profile?.kycStatus === "verified";

  const handleAddFunds = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add to your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingFunds(true);
    try {
      await addFunds(parseFloat(amount), "Manual deposit");
      setAmount("");
      toast({
        title: "Funds Added",
        description: `${formatCurrency(parseFloat(amount))} has been added to your wallet.`,
      });
    } catch (error) {
      console.error("Error adding funds:", error);
      toast({
        title: "Error",
        description: "Failed to add funds to your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!isKycVerified) {
      toast({
        title: "KYC Required",
        description: "Please complete KYC verification before withdrawing funds.",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(withdrawalAmount);
    
    if (!withdrawalAmount || isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (amountNum < MIN_WITHDRAWAL) {
      toast({
        title: "Minimum Withdrawal",
        description: `Minimum withdrawal amount is ${formatCurrency(MIN_WITHDRAWAL)}.`,
        variant: "destructive",
      });
      return;
    }

    if (amountNum > MAX_WITHDRAWAL) {
      toast({
        title: "Maximum Withdrawal",
        description: `Maximum withdrawal amount is ${formatCurrency(MAX_WITHDRAWAL)}.`,
        variant: "destructive",
      });
      return;
    }

    if (amountNum > (wallet?.balance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      // Process the withdrawal through our wallet hook
      await withdrawFunds(amountNum, "Withdrawal request");
      
      toast({
        title: "Withdrawal Requested",
        description: `Withdrawal of ${formatCurrency(amountNum)} has been requested. It will be processed within 24 hours.`,
      });
      
      // Clear the withdrawal amount
      setWithdrawalAmount("");
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleClaimBonus = async (referralId: string) => {
    try {
      await claimBonus(referralId);
      toast({
        title: "Bonus Claimed",
        description: "500 Naira bonus has been added to your wallet.",
      });
    } catch (error) {
      console.error("Error claiming bonus:", error);
      toast({
        title: "Error",
        description: "Failed to claim bonus. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Please log in</h1>
            <p className="text-muted-foreground mb-8">You need to be logged in to view your wallet.</p>
            <Button asChild>
              <a href="/login">Log In</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show KYC verification if not completed
  if (!isKycVerified) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Wallet Verification</h1>
              <p className="text-muted-foreground">Complete KYC to access your wallet features</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">KYC Verification Required</h3>
              <p className="text-sm text-yellow-700">
                To protect your account and comply with financial regulations, we need to verify your identity before you can access wallet features.
              </p>
            </div>
          </div>
          
          <KycVerification />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Having trouble with verification? <Link to="/contact" className="text-green-600 hover:underline">Contact support</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wallet</h1>
            <p className="text-muted-foreground">Manage your wallet balance and transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Balance Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {loading ? "Loading..." : formatCurrency(wallet?.balance || 0)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Available balance
                </p>
                
                {wallet && wallet.balance > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Note:</span> You can withdraw between {formatCurrency(MIN_WITHDRAWAL)} and {formatCurrency(MAX_WITHDRAWAL)} per transaction.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Funds Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Add Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount to Add</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        ₦
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                        disabled={isAddingFunds}
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleAddFunds}
                  disabled={isAddingFunds || !amount}
                  className="w-full md:w-auto"
                >
                  {isAddingFunds ? "Processing..." : "Add Funds"}
                </Button>
              </CardContent>
            </Card>

            {/* Withdraw Funds Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  Withdraw Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdrawalAmount">Amount to Withdraw</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        ₦
                      </span>
                      <Input
                        id="withdrawalAmount"
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                        disabled={isWithdrawing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Min: {formatCurrency(MIN_WITHDRAWAL)} | Max: {formatCurrency(MAX_WITHDRAWAL)}
                    </p>
                  </div>
                </div>
                
                {profile?.kycData?.bankAccount && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Withdrawal Account</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.kycData.bankAccount.bank_name} ••••{profile.kycData.bankAccount.account_number.slice(-4)}
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleWithdrawal}
                  disabled={isWithdrawing || !withdrawalAmount || (wallet?.balance || 0) < MIN_WITHDRAWAL}
                  variant="destructive"
                  className="w-full md:w-auto"
                >
                  {isWithdrawing ? "Processing..." : "Withdraw Funds"}
                </Button>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 border-4 border-t-green-500 border-l-green-600 border-r-green-600 border-b-green-700 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your transactions will appear here once you start using your wallet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.createdAt?.toDate?.().toLocaleDateString() || "Unknown date"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                            {transaction.type === "credit" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Balance: {formatCurrency(transaction.balanceAfter)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Referral Section */}
          <div>
            <ReferralSystem />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Referrals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="h-4 w-4 border-2 border-t-blue-500 border-l-blue-600 border-r-blue-600 border-b-blue-700 rounded-full animate-spin mx-auto" />
                    </div>
                  ) : referrals.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      You haven't referred any friends yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {referrals.map((referral) => (
                        <div key={referral.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Friend Referral</div>
                              <div className="text-xs text-muted-foreground">
                                {referral.createdAt?.toDate?.().toLocaleDateString() || "Unknown date"}
                              </div>
                              {referral.referredUserId ? (
                                <div className="flex items-center mt-1">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                  <span className="text-xs text-green-600">First purchase completed</span>
                                </div>
                              ) : (
                                <div className="flex items-center mt-1">
                                  <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs text-yellow-600">Waiting for first purchase</span>
                                </div>
                              )}
                            </div>
                            {referral.claimed ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Claimed
                              </Badge>
                            ) : referral.referredUserId ? (
                              <Button 
                size="sm" 
                onClick={() => handleClaimBonus(referral.id)}
              >
                Claim 500 Naira
              </Button>
                            ) : (
                              <Button size="sm" disabled>
                Waiting for purchase
              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center bg-green-100">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Add Funds</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Easily add money to your wallet for quick purchases.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center bg-green-100">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Withdraw Funds</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Withdraw your earnings with verified bank account (KYC required).
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center bg-green-100">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Transaction History</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        View all your wallet transactions in one place.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center bg-green-100">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Referral Bonuses</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Earn 500 Naira for each friend you refer who makes a purchase.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}