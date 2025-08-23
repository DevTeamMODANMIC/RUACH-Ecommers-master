# Stripe Integration for BorderlessBuy

This document describes how to set up and use Stripe for payment processing in BorderlessBuy.

## Setup

1. Create a Stripe account at [stripe.com](https://stripe.com) if you don't have one already.
2. Get your API keys from the Stripe Dashboard (Dashboard > Developers > API keys).
3. Add your keys to the `.env.local` file:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   ```
   
   Note: Use `pk_test_` and `sk_test_` keys for development, and `pk_live_` and `sk_live_` for production.

## Features

- Secure payment processing using Stripe Elements
- Card payments support
- Payment intents API for modern payment flows
- Webhook-ready architecture for payment status updates

## Payment Flow

1. Customer fills out shipping and billing information
2. Order is created in Firebase with "pending" payment status
3. Stripe payment form is displayed
4. Customer enters payment information
5. Stripe processes payment
6. On success, customer is redirected to order confirmation page
7. Order is updated with payment details

## Testing Payments

Use Stripe's test card numbers for testing:

- **Success**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 0002

Use any future expiration date, any 3-digit CVC, and any postal code.

## Webhooks (Future Implementation)

For full integration, set up Stripe webhooks to handle asynchronous payment events:

1. Create a webhook in the Stripe Dashboard pointing to:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```

2. Configure it to listen to payment events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

3. Add the webhook secret to your environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
   ```

## Production Considerations

- Switch to live API keys
- Implement proper error handling
- Add additional payment methods as needed
- Set up webhooks for reliable payment status updates
