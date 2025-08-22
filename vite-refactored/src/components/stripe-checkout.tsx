/**
 * TEMPORARILY DISABLED: This component is part of the Stripe integration that has been paused.
 * Do not use this component until the Stripe integration is re-enabled.
 */

;

import { useEffect, useState } from "react";
import { useNavigate } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import StripeProvider from "@/components/stripe-provider";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StripeCheckoutProps {
  amount: number; // Amount in cents
  orderId?: string;
  clientSecret?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
  returnUrl?: string;
  showCompletionMessage?: boolean;
}

export default function StripeCheckout({ 
  amount, 
  orderId, 
  clientSecret: initialClientSecret, 
  onSuccess,
  onError,
  returnUrl = "/order-confirmation",
  showCompletionMessage = true
}: StripeCheckoutProps) {
  const router = useNavigate();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | undefined>(initialClientSecret);
  const [isLoading, setIsLoading] = useState(!initialClientSecret);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have a client secret, no need to create a payment intent
    if (initialClientSecret) {
      setClientSecret(initialClientSecret);
      return;
    }

    const createPaymentIntent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            amount,
            metadata: { orderId } 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create payment intent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        if (onError) onError(err);
        toast({
          title: "Payment Error",
          description: err.message || "Failed to set up payment",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, initialClientSecret, onError, orderId, toast]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Setting up payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p className="font-medium">Payment setup failed</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Complete your purchase securely with Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          {clientSecret && <CheckoutForm 
            clientSecret={clientSecret} 
            amount={amount}
            returnUrl={returnUrl}
            onSuccess={onSuccess}
            onError={(err: Error) => {
              setError(err.message);
              if (onError) onError(err);
            }}
            showCompletionMessage={showCompletionMessage}
          />}
        </CardContent>
      </Card>
    </StripeProvider>
  );
}

// Separate checkout form component to be used within the Stripe provider
function CheckoutForm({ 
  clientSecret, 
  amount,
  returnUrl,
  onSuccess, 
  onError,
  showCompletionMessage = true
}: { 
  clientSecret: string; 
  amount: number;
  returnUrl: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
  showCompletionMessage?: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${returnUrl}`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Show error message
        setErrorMessage(error.message || "An unknown error occurred");
        if (onError) onError(new Error(error.message || "Payment confirmation failed"));
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        if (showCompletionMessage) {
          toast({
            title: "Payment Successful",
            description: "Your payment has been completed successfully",
          });
        }
        
        if (onSuccess) onSuccess(paymentIntent.id);
        
        // Navigate to confirmation page
        navigate(`${returnUrl}${returnUrl.includes("?") ? "&" : "?"}payment_intent=${paymentIntent.id}`);
      } else {
        // Handle other statuses or errors
        setErrorMessage("Payment processing failed. Please try again.");
        if (onError) onError(new Error("Payment processing failed"));
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      if (onError) onError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount / 100)}`
        )}
      </Button>
    </form>
  );
}
