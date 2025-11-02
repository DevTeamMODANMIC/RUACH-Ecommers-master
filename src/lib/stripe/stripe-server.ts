/**
 * TEMPORARILY DISABLED: This library is part of the Stripe integration that has been paused.
 * Do not use these functions until the Stripe integration is re-enabled.
 */

import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: '2023-10-16', // Use the latest API version
});

// Create a payment intent for a new order
export async function createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Retrieve an existing payment intent
export async function retrievePaymentIntent(id: string) {
  try {
    return await stripe.paymentIntents.retrieve(id);
  } catch (error) {
    console.error(`Error retrieving payment intent ${id}:`, error);
    throw error;
  }
}

// Update an existing payment intent
export async function updatePaymentIntent(id: string, data: Stripe.PaymentIntentUpdateParams) {
  try {
    return await stripe.paymentIntents.update(id, data);
  } catch (error) {
    console.error(`Error updating payment intent ${id}:`, error);
    throw error;
  }
}

// Cancel an existing payment intent
export async function cancelPaymentIntent(id: string) {
  try {
    return await stripe.paymentIntents.cancel(id);
  } catch (error) {
    console.error(`Error canceling payment intent ${id}:`, error);
    throw error;
  }
}

export default stripe;
