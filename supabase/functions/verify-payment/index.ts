import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('Verify payment error: Missing required payment details', { razorpay_order_id, razorpay_payment_id, razorpay_signature })
      return new Response(
        JSON.stringify({ error: 'Missing required payment details' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!planType) {
      console.error('Verify payment error: Missing planType')
      return new Response(
        JSON.stringify({ error: 'Missing plan type' }),
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

    console.log('Verifying Razorpay payment', { razorpay_order_id, razorpay_payment_id, planType })

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

    // Fetch payment details from Razorpay to double-check
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

    // Get authenticated user
    const token = req.headers.get('Authorization')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        global: {
          headers: {
            Authorization: token || '',
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Verify payment error: User not authenticated', { userError })
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Updating plan for user:', user.id, 'Selected plan:', planType)

    // Compute plan expiry
    const now = new Date()
    let expiryDate = new Date()

    if (planType === 'weekly') {
      expiryDate.setDate(now.getDate() + 7)
    } else if (planType === 'monthly') {
      expiryDate.setDate(now.getDate() + 30)
    } else {
      console.error('Verify payment error: Invalid plan type', { planType })
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update profiles table
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        plan: planType,
        plan_expiry: expiryDate.toISOString(),
        ever_paid: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update failed:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Profile updated successfully', { userId: user.id, plan: planType, expiry: expiryDate.toISOString() })

    return new Response(
      JSON.stringify({ 
        success: true,
        verified: true, 
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        plan: planType,
        expiry: expiryDate.toISOString()
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
