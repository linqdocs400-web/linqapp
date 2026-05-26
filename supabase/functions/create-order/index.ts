import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { amount, currency = 'INR', receipt } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')?.trim()
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')?.trim()

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amount, // Frontend already sends amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          key1: 'value3',
          key2: 'value2'
        }
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const description = data.error?.description || 'Failed to create order'
      const isAuthError =
        response.status === 401 ||
        description.toLowerCase().includes('authentication')

      const error = isAuthError
        ? 'Invalid Razorpay API credentials. Regenerate Key ID and Key Secret in Razorpay Dashboard (Settings → API Keys), then update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Supabase secrets and VITE_RAZORPAY_KEY_ID in your frontend env.'
        : description

      return new Response(
        JSON.stringify({ error }),
        { status: isAuthError ? 401 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
