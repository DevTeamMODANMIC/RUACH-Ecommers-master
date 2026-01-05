import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2 } from "lucide-react";

export default function ReferralSystem() {
  const { user } = useAuth();
  const { referFriendByEmail } = useWallet();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate referral link
  const referralLink = user 
    ? `${window.location.origin}?ref=${user.uid}` 
    : "";

  const handleReferFriend = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to refer friends.",
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your friend's email address.",
        variant: "destructive",
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a referral record with the email
      await referFriendByEmail(email);
      
      toast({
        title: "Invitation Sent",
        description: `We've sent an invitation to ${email}. When they sign up and make their first purchase, you'll earn a 500 Naira bonus!`,
      });
      
      setEmail("");
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refer a Friend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Log in to start referring friends and earn bonuses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Refer a Friend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Earn 500 Naira Bonus</h3>
          <p className="text-sm text-gray-600 mb-4">
            Refer a friend to RUACH E-Store and earn 500 Naira when they make their first purchase.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
            <p className="font-medium text-yellow-800 mb-1">How it works:</p>
            <ul className="text-yellow-700 text-left list-disc pl-5 space-y-1">
              <li>Friend signs up using your referral link</li>
              <li>Friend makes their first purchase</li>
              <li>You automatically receive 500 Naira bonus</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="friendEmail">Friend's Email</Label>
            <div className="flex gap-2">
              <Input
                id="friendEmail"
                type="email"
                placeholder="Enter friend's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <Button 
                onClick={handleReferFriend}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </div>

          <div>
            <Label>Your Referral Link</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1"
              />
              <Button 
                onClick={copyReferralLink}
                variant="outline"
                size="icon"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Share this link with friends to earn bonuses.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}