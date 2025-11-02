import { useLocation, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const getKycId = (search: string, fallback?: string | null) => {
  const params = new URLSearchParams(search);
  return params.get("kycId") || fallback || "Unavailable";
};

export default function KycPendingPage() {
  const location = useLocation();
  const { profile } = useAuth();

  const kycId = getKycId(location.search, profile?.kycData?.kycId);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-amber-100 rounded-full w-20 h-20 flex items-center justify-center">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            KYC Submitted For Review
          </CardTitle>
          <p className="text-muted-foreground">
            Thanks for submitting your verification details. We are reviewing the information and will
            update your status shortly.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">KYC Reference</p>
            <p className="font-mono font-semibold text-lg">{kycId}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>We&apos;ll notify you by email once the KYC review is complete.</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row sm:justify-center gap-3">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/profile">View Profile</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/contact">Contact Support</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
