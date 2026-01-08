/**
 * TEMPORARILY DISABLED: This API route is part of the Stripe integration that has been paused.
 * This route will not function correctly until the Stripe integration is re-enabled.
 */

import { NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/stripe/stripe-server";

export async function POST(request: Request) {
  return NextResponse.json(
    { error: "Stripe payment processing is temporarily disabled" },
    { status: 503 }
  );
  
  // Original implementation below - uncomment when re-enabling Stripe
  /*
  try {
    const { amount, currency = "usd", metadata = {} } = await request.json();

    // Validate required fields
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // Create a payment intent with the order amount and currency
    const paymentIntent = await createPaymentIntent(
      amount,
      currency,
      metadata
    );

    return NextResponse.json({ 
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
  */
}
