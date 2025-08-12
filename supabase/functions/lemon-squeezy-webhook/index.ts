
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Lemon Squeezy webhook received:', body)

    const { meta, data } = body
    const eventName = meta?.event_name

    if (!eventName || !data) {
      throw new Error('Invalid webhook payload')
    }

    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(supabaseClient, data)
        break
      case 'order_refunded':
        await handleOrderRefunded(supabaseClient, data)
        break
      case 'subscription_created':
      case 'subscription_updated':
        await handleSubscriptionUpdate(supabaseClient, data)
        break
      default:
        console.log(`Unhandled event: ${eventName}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleOrderCreated(supabase: any, data: any) {
  const { attributes } = data
  const customData = attributes.first_order_item?.variant_name || ''
  
  // Extract user_id from custom data or order metadata
  const userId = attributes.user_email // You might want to map this differently
  
  // Create payment transaction record
  await supabase.from('payment_transactions').insert({
    lemon_squeezy_order_id: data.id,
    amount: attributes.total / 100, // Convert cents to dollars
    currency: attributes.currency,
    status: 'completed',
    is_test_mode: attributes.test_mode,
    transaction_data: data,
    user_id: userId // This needs proper user mapping
  })

  console.log('Order created:', data.id)
}

async function handleOrderRefunded(supabase: any, data: any) {
  const { attributes } = data
  
  // Update payment transaction status
  await supabase
    .from('payment_transactions')
    .update({ status: 'refunded' })
    .eq('lemon_squeezy_order_id', data.id)

  console.log('Order refunded:', data.id)
}

async function handleSubscriptionUpdate(supabase: any, data: any) {
  const { attributes } = data
  
  // Get plan info from variant name or custom data
  const planSlug = getPlanSlugFromVariant(attributes.variant_name)
  
  if (!planSlug) return

  // Get plan details
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('slug', planSlug)
    .single()

  if (!plan) return

  // Extract user_id (you'll need to implement proper user mapping)
  const userId = attributes.user_email // Placeholder - implement proper mapping
  
  // Update user subscription
  await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan_id: plan.id,
    lemon_squeezy_subscription_id: data.id,
    status: attributes.status,
    billing_cycle: attributes.billing_anchor ? 'yearly' : 'monthly',
    current_period_start: attributes.renews_at,
    current_period_end: attributes.ends_at,
    is_test_mode: attributes.test_mode
  })

  // Update user credits
  await supabase.from('user_credits').upsert({
    user_id: userId,
    credits_limit: plan.credits_per_month,
    credits_available: plan.credits_per_month,
    credits_used: 0
  })

  console.log('Subscription updated:', data.id)
}

function getPlanSlugFromVariant(variantName: string): string | null {
  if (variantName?.toLowerCase().includes('pro')) return 'pro'
  if (variantName?.toLowerCase().includes('growth')) return 'growth'
  return null
}
