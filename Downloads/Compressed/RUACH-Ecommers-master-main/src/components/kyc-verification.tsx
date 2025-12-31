import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { resolveBvn, resolveBankAccount, resolveBankFromAccountNumber } from "@/lib/paystack-kyc";
import { updateUserProfile, type UserProfile } from "@/lib/firebase-auth";
import { saveKycProgress } from "@/lib/firebase-kyc";
import { NIGERIAN_BANKS } from "@/lib/nigerian-banks";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Banknote, 
  UserCheck, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

// Sort banks alphabetically by name
const sortedBanks = [...NIGERIAN_BANKS].sort((a, b) => a.name.localeCompare(b.name));
type KycDataShape = NonNullable<UserProfile["kycData"]>;

export default function KycVerification() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"bvn" | "bank" | "complete">("bvn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  
  // BVN form state
  const [bvn, setBvn] = useState("");
  const [bvnData, setBvnData] = useState<any>(null);
  const [kycId, setKycId] = useState(profile?.kycData?.kycId || "");
  
  // Bank account form state
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankData, setBankData] = useState<any>(null);
  const [accountVerified, setAccountVerified] = useState(false);
  const [bankDetectionMode, setBankDetectionMode] = useState<"auto" | "manual">("auto");
  
  // Ref to track if we've already resolved the bank for the current account number
  const resolvedAccountNumberRef = useRef<string>("");
  const walletPath =
    profile?.roles?.includes("vendor") || profile?.role === "vendor"
      ? "/vendor/dashboard/wallet"
      : "/wallet";

  useEffect(() => {
    setKycId(profile?.kycData?.kycId || "");
  }, [profile?.kycData?.kycId]);

  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!profile || hasRedirectedRef.current) return;

    if (profile.kycStatus === "verified") {
      setStep("complete");
      const identifier = profile.kycData?.kycId;
      const query = identifier ? `?kycId=${encodeURIComponent(identifier)}` : "";
      navigate(`/kyc/success${query}`);
      hasRedirectedRef.current = true;
    } else if (profile.kycStatus === "pending") {
      setStep("bank");
      const identifier = profile.kycData?.kycId;
      const query = identifier ? `?kycId=${encodeURIComponent(identifier)}` : "";
      navigate(`/kyc/pending${query}`);
      hasRedirectedRef.current = true;
    }
  }, [profile, navigate]);

  // Auto-detect bank when account number is entered
  useEffect(() => {
    if (bankDetectionMode === "manual") {
      return;
    }

    const resolveBank = async () => {
      // Only resolve if we have a complete valid account number (10 digits) and it's different from the last resolved one
      if (
        accountNumber &&
        accountNumber.length === 10 && // Only try when we have exactly 10 digits
        /^\d+$/.test(accountNumber) &&
        accountNumber !== resolvedAccountNumberRef.current
      ) {
        setIsResolvingAccount(true);
        try {
          const result = await resolveBankFromAccountNumber(accountNumber);
          setBankCode(result.bank_code);
          resolvedAccountNumberRef.current = accountNumber;
        } catch (error) {
          console.error("Error resolving bank:", error);
          // Don't show error to user as they might still select bank manually
        } finally {
          setIsResolvingAccount(false);
        }
      } else if (accountNumber && (accountNumber.length < 10 || !/^\d+$/.test(accountNumber) || accountNumber.length > 10)) {
        // Clear bank info if account number becomes invalid or is not exactly 10 digits
        setBankCode("");
        resolvedAccountNumberRef.current = "";
      }
    };

    // Only try to resolve when we have exactly 10 digits to avoid too many API calls
    if (accountNumber && accountNumber.length === 10) {
      // Add a longer delay to avoid too many API calls
      const timeoutId = setTimeout(() => {
        resolveBank();
      }, 5000); // Reduced delay to 5 seconds for better UX

      return () => clearTimeout(timeoutId);
    }
  }, [accountNumber, bankDetectionMode]);

  useEffect(() => {
    if (bankDetectionMode === "manual") {
      setIsResolvingAccount(false);
      resolvedAccountNumberRef.current = "";
    }
  }, [bankDetectionMode]);

  const handleBvnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      toast({
        title: "Invalid BVN",
        description: "Please enter a valid 11-digit BVN.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resolveBvn({ bvn }, profile.name);
      setBvnData(result);

      if (result.verified) {
        const kycIdentifier = await saveKycProgress(user.uid, {
          status: "pending",
          bvnData: {
            bvn,
            first_name: result.first_name,
            last_name: result.last_name,
            middle_name: result.middle_name,
            verified: result.verified,
            match_status: result.match_status,
            phone: result.phone,
            date_of_birth: result.date_of_birth,
          },
          metadata: {
            stage: "bvn",
            matchStatus: result.match_status,
          },
        });

        setKycId(kycIdentifier);

        const existingKycData = profile.kycData as KycDataShape | undefined;
        const updatedKycData: KycDataShape = {
          ...(existingKycData ?? {}),
          kycId: kycIdentifier,
          bvn,
        };

        await updateUserProfile(user.uid, {
          kycStatus: "pending",
          kycData: updatedKycData,
        });

        await updateProfile({
          kycStatus: "pending",
          kycData: updatedKycData,
        });

        setStep("bank");
        toast({
          title: "BVN Verified",
          description:
            result.match_status === "match"
              ? "Your BVN has been successfully verified."
              : "Your BVN has been verified. Please ensure your bank account name matches your profile name.",
        });
      } else {
        toast({
          title: "BVN Verification Failed",
          description: "Could not verify your BVN. Please check the details and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error verifying BVN:", error);
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify BVN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !bvnData) return;

    if (accountNumber.length < 10 || accountNumber.length > 12 || !/^\d+$/.test(accountNumber)) {
      toast({
        title: "Invalid Account Number",
        description: "Please enter a valid account number (10-12 digits).",
        variant: "destructive",
      });
      return;
    }

    if (!bankCode) {
      toast({
        title: "Bank Required",
        description: "Please select your bank.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resolveBankAccount(
        {
          bank_code: bankCode,
          country_code: "NG",
          account_number: accountNumber,
        },
        `${bvnData.first_name} ${bvnData.middle_name} ${bvnData.last_name}`
      );

      setBankData(result);
      
      if (result.verified) {
        setAccountVerified(true);

        const resolvedBankName =
          result.bank_name ||
          sortedBanks.find((bank) => bank.code === bankCode)?.name ||
          "Unknown Bank";

        const finalStatus =
          result.match_status === "match" ? "verified" : "pending";

        const identifier = await saveKycProgress(user.uid, {
          status: finalStatus,
          bankData: {
            bank_code: result.bank_code,
            bank_name: resolvedBankName,
            account_number: result.account_number,
            account_name: result.account_name,
            verified: result.verified,
            match_status: result.match_status,
          },
          metadata: {
            stage: "bank",
            matchStatus: result.match_status,
          },
          completed: true,
        });

        if (!kycId) {
          setKycId(identifier);
        }

        const existingKycData = profile.kycData as KycDataShape | undefined;
        const updatedKycData: KycDataShape = {
          ...(existingKycData ?? {}),
          kycId: identifier,
          bvn: existingKycData?.bvn || bvn,
          bankAccount: {
            bank_code: result.bank_code,
            bank_name: resolvedBankName,
            account_number: result.account_number,
            account_name: result.account_name,
          },
        };

        if (finalStatus === "verified") {
          updatedKycData.verifiedAt = new Date();
        } else if (updatedKycData.verifiedAt) {
          delete updatedKycData.verifiedAt;
        }

        await updateUserProfile(user.uid, {
          kycStatus: finalStatus,
          kycData: updatedKycData,
        });

        await updateProfile({
          kycStatus: finalStatus,
          kycData: updatedKycData,
        });

        setStep("complete");
        toast({
          title: finalStatus === "verified" ? "KYC Complete" : "KYC Submitted",
          description:
            finalStatus === "verified"
              ? "Your identity has been successfully verified."
              : "Your details have been submitted for review. We'll notify you once verification is complete.",
        });

        const destination = finalStatus === "verified" ? "/kyc/success" : "/kyc/pending";
        const query = identifier ? `?kycId=${encodeURIComponent(identifier)}` : "";
        navigate(`${destination}${query}`);
      } else {
        toast({
          title: "Account Verification Failed",
          description: "Could not verify your bank account. Please check the details and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error verifying bank account:", error);
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify bank account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            KYC Verification Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please log in to complete your KYC verification.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          KYC Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === "bvn" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">Verify Your Identity</h3>
              <p className="text-sm text-muted-foreground">
                Enter your BVN to verify your identity
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                For testing purposes, enter any 11-digit number. In production, this will verify your actual BVN with Paystack.
              </p>
            </div>

            <form onSubmit={handleBvnSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bvn">Bank Verification Number (BVN)</Label>
                <Input
                  id="bvn"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={11}
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your 11-digit BVN"
                  disabled={isSubmitting}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your BVN is used to verify your identity. We don't store this information.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || bvn.length !== 11}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        )}

        {step === "bank" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Banknote className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Verify Bank Account</h3>
              <p className="text-sm text-muted-foreground">
                Enter your bank details for withdrawal purposes
              </p>
            </div>

            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your account number"
                  disabled={isSubmitting}
                  required
                />
                {isResolvingAccount && (
                  <p className="text-sm text-blue-500 mt-1">Detecting bank...</p>
                )}
              </div>

              <div>
                <Label htmlFor="bankMode">Bank Detection Mode</Label>
                <Select
                  value={bankDetectionMode}
                  onValueChange={(value) =>
                    setBankDetectionMode((value as "auto" | "manual") ?? "manual")
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="bankMode">
                    <SelectValue placeholder="Select detection mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatic mode tries to detect your bank from the account number; switch to manual if
                  you prefer to choose it yourself.
                </p>
              </div>

              <div>
                <Label htmlFor="bank">Bank</Label>
                <Select value={bankCode} onValueChange={setBankCode} disabled={isSubmitting || isResolvingAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedBanks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isResolvingAccount && (
                  <p className="text-sm text-blue-500 mt-1">Auto-detecting bank from account number...</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !accountNumber || !bankCode}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Verify Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        )}

        {step === "complete" && (
          <div className="text-center space-y-4">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-xl">KYC Verification Complete!</h3>
            <p className="text-muted-foreground">
              Your identity has been successfully verified. You can now access your wallet and withdrawal features.
            </p>
            <Button asChild>
              <a href={walletPath}>Go to Wallet</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
