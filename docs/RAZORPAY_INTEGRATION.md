# Razorpay Integration

This document explains how to set up and use the Razorpay Standard Checkout integration in GoTogetherRides.

## Overview

The application uses Razorpay for processing payments for weekly (₹19) and monthly (₹49) subscription plans. The integration consists of:

- **Frontend**: React components and hooks for payment flow
- **Backend**: Supabase Edge Functions for order creation and payment verification
- **Security**: Razorpay secret key is never exposed to the frontend

## Architecture

### Frontend Components

1. **`src/components/razorpay-checkout.tsx`**: Razorpay checkout modal component
2. **`src/hooks/use-razorpay.ts`**: Custom hook for Razorpay API calls
3. **`src/routes/pricing.tsx`**: Pricing page with integrated payment flow

### Backend Edge Functions

1. **`supabase/functions/create-order/index.ts`**: Creates Razorpay order
2. **`supabase/functions/verify-payment/index.ts`**: Verifies payment signature

## Setup Instructions

### 1. Get Razorpay Credentials

1. Sign up at [Razorpay](https://razorpay.com)
2. Navigate to Settings → API Keys
3. Generate Key ID and Key Secret (Test mode for development, Live mode for production)

### 2. Set Environment Variables

Add the following to your `.env` file:

```bash
# Frontend (Vite)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Backend (Supabase Edge Functions)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

For production deployment (Vercel/Supabase):
- Set `VITE_RAZORPAY_KEY_ID` in your hosting platform's environment variables
- Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Supabase project settings

### 3. Deploy Edge Functions

```bash
# Deploy to Supabase
supabase functions deploy create-order
supabase functions deploy verify-payment
```

## Payment Flow

### 1. User Initiates Payment

When a user clicks "Pay ₹19" or "Pay ₹49" on the pricing page:

1. Frontend calls `createOrder(amount, receipt)` via Supabase Edge Function
2. Edge Function creates order with Razorpay API
3. Razorpay returns order ID
4. Frontend opens Razorpay checkout modal with order ID

### 2. User Completes Payment

1. User enters payment details in Razorpay checkout
2. Razorpay processes payment
3. On success, Razorpay returns payment ID, order ID, and signature

### 3. Payment Verification

1. Frontend sends payment details to `verify-payment` Edge Function
2. Edge Function verifies signature using Razorpay secret key
3. If valid, Edge Function returns verification success
4. Frontend updates user's plan in database

## Security Considerations

- ✅ Razorpay Key Secret is never exposed to frontend
- ✅ All payment operations happen on backend
- ✅ Signature verification prevents tampering
- ✅ CORS headers configured for Edge Functions

## Test Plans

The integration supports test payments for:

- **Weekly Plan**: ₹19
- **Monthly Plan**: ₹49

Use Razorpay test cards for testing:
- Success: Any valid test card
- Failure: Use cards listed in [Razorpay test documentation](https://razorpay.com/docs/payment-gateway/test-mode/)

## Error Handling

The integration includes error handling for:

- Invalid order amounts
- Missing Razorpay credentials
- Payment failures
- Signature verification failures
- Network errors

Errors are displayed to users in the pricing page with clear messages.

## Development

### Local Development

For local development with Supabase:

```bash
# Start Supabase local development
supabase start

# Link to your project
supabase link --project-ref your-project-id

# Deploy functions locally
supabase functions serve
```

### Testing the Integration

1. Ensure Supabase is running locally
2. Set environment variables in `.env`
3. Navigate to `/pricing` page
4. Click on a paid plan
5. Complete test payment using Razorpay test mode

## Troubleshooting

### Order Creation Fails

- Check Razorpay credentials are correct
- Verify Edge Function is deployed
- Check Supabase logs for errors

### `Authentication failed` (400/401 from create-order)

Razorpay rejected the **Key ID + Key Secret** pair. This is not a Supabase login issue.

1. In [Razorpay Dashboard](https://dashboard.razorpay.com) → **Settings → API Keys**, generate or regenerate **Test** keys (or Live for production).
2. Copy **Key ID** and **Key Secret** (secret is shown only once when generated).
3. Update local `.env`:
   - `VITE_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_ID` = Key ID
   - `RAZORPAY_KEY_SECRET` = Key Secret
4. Push secrets to Supabase (must match `.env`):

```bash
npx supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=your_secret --project-ref kgpalsfmzxxfwuvtanks
```

5. Redeploy: `npx supabase functions deploy create-order verify-payment --project-ref kgpalsfmzxxfwuvtanks`

Verify credentials locally:

```bash
curl -u "$RAZORPAY_KEY_ID:$RAZORPAY_KEY_SECRET" -X POST https://api.razorpay.com/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"amount":1900,"currency":"INR","receipt":"test"}'
```

A successful response includes an `"id"` field (order id), not `"Authentication failed"`.

### Payment Verification Fails

- Verify signature generation logic
- Check Razorpay secret key matches
- Ensure payment ID and order ID are correct

### Checkout Modal Doesn't Open

- Check `VITE_RAZORPAY_KEY_ID` is set
- Verify Razorpay script loads
- Check browser console for errors

## Production Checklist

Before deploying to production:

- [ ] Switch from Test mode to Live mode in Razorpay
- [ ] Update Razorpay credentials to live keys
- [ ] Deploy Edge Functions to production
- [ ] Set environment variables in hosting platform
- [ ] Test live payment flow with small amount
- [ ] Enable webhooks for payment notifications (optional)
- [ ] Set up payment failure notifications
- [ ] Configure refund handling if needed

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payment-gateway/web-integration/standard-checkout/)
