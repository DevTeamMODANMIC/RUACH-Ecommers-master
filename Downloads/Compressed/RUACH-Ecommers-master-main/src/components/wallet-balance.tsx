import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Plus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getUserWallet } from "@/lib/firebase-wallet";
import { formatCurrency } from "@/lib/utils";

export default function WalletBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) {
        setBalance(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const wallet = await getUserWallet(user.uid);
        setBalance(wallet?.balance || 0);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Link to="/wallet" className="flex items-center text-sm font-medium text-gray-700 hover:text-green-600">
        <Wallet className="h-4 w-4 mr-1" />
        {loading ? (
          <span className="w-16 h-4 bg-gray-200 rounded animate-pulse"></span>
        ) : (
          <span>{formatCurrency(balance || 0)}</span>
        )}
      </Link>
      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
        <Link to="/wallet">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add funds</span>
        </Link>
      </Button>
    </div>
  );
}