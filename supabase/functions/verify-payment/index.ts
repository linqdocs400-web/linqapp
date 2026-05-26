import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('Verify payment error: Missing required payment details', { razorpay_order_id, razorpay_payment_id, razorpay_signature })
      return new Response(
        JSON.stringify({ error: 'Missing required payment details' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeySecret) {
      console.error('Verify payment error: Razorpay credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Verifying Razorpay payment', { razorpay_order_id, razorpay_payment_id })

    // Generate signature for verification
    const generatedSignature = await createHmac(
      'sha256',
      new TextEncoder().encode(razorpayKeySecret),
    )
      .encode(`${razorpay_order_id}|${razorpay_payment_id}`)
      .then((hash) => {
        const hexArray = Array.from(new Uint8Array(hash))
        return hexArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      })

    // Verify signature
    const isValid = generatedSignature === razorpay_signature

    if (!isValid) {
      console.error('Verify payment error: Invalid payment signature', { generatedSignature, razorpay_signature })
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Optionally: Fetch payment details from Razorpay to double-check
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    
    console.log('Fetching payment details from Razorpay', { razorpay_payment_id })
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    const paymentData = await paymentResponse.json()

    if (!paymentResponse.ok) {
      console.error('Verify payment error: Failed to fetch payment details', { status: paymentResponse.status, paymentData })
      return new Response(
        JSON.stringify({ error: 'Failed to fetch payment details' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Payment verified successfully', { payment_id: razorpay_payment_id, order_id: razorpay_order_id, status: paymentData.status })
    return new Response(
      JSON.stringify({ 
        verified: true, 
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Verify payment unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
