import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface DecideRequest {
  customer_id?: string;
  session_id: string;
  context?: {
    plan?: string;
    subscription_value?: number;
    usage_data?: any;
    cancellation_reason?: string;
  };
}

interface Offer {
  id: string;
  offer_type: string;
  title: string;
  description: string;
  config: any;
  priority: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate the API key and get project
    const { data: project, error: authError } = await supabase
      .from('cancel_guard_projects')
      .select('*')
      .eq('api_key_hash', await hashApiKey(apiKey))
      .eq('is_active', true)
      .single();

    if (authError || !project) {
      console.log('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate domain (if allowlist exists)
    const origin = req.headers.get('origin');
    const { data: settings } = await supabase
      .from('cancel_guard_settings')
      .select('domain_allowlist')
      .eq('project_id', project.id)
      .single();

    if (settings?.domain_allowlist?.length > 0 && origin) {
      const domain = new URL(origin).hostname;
      if (!settings.domain_allowlist.includes(domain)) {
        return new Response(
          JSON.stringify({ error: 'Domain not allowed' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const body: DecideRequest = await req.json();
    
    if (!body.session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the event
    await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: project.id,
        session_id: body.session_id,
        customer_id: body.customer_id,
        event_type: 'cancel_attempt',
        event_data: body.context || {}
      });

    // Get active offers for the project, ordered by priority
    const { data: offers, error: offersError } = await supabase
      .from('cancel_guard_offers')
      .select('*')
      .eq('project_id', project.id)
      .eq('is_active', true)
      .order('priority');

    if (offersError) {
      console.error('Error fetching offers:', offersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch offers' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Simple decision logic - in production, this would be more sophisticated
    const selectedOffer = selectBestOffer(offers || [], body.context);

    if (!selectedOffer) {
      return new Response(
        JSON.stringify({ 
          offer: null,
          message: 'No suitable offer found',
          session_id: body.session_id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the offer decision
    await supabase
      .from('cancel_guard_events')
      .insert({
        project_id: project.id,
        session_id: body.session_id,
        customer_id: body.customer_id,
        event_type: 'offer_presented',
        event_data: { offer_id: selectedOffer.id, offer_type: selectedOffer.offer_type }
      });

    return new Response(
      JSON.stringify({
        offer: {
          id: selectedOffer.id,
          type: selectedOffer.offer_type,
          title: selectedOffer.title,
          description: selectedOffer.description,
          config: selectedOffer.config
        },
        session_id: body.session_id,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in cancel-guard-decide:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function selectBestOffer(offers: Offer[], context?: any): Offer | null {
  if (offers.length === 0) return null;

  // Simple priority-based selection
  // In production, this would include sophisticated ML-based decision logic
  
  // If customer has high subscription value, prioritize discount offers
  if (context?.subscription_value && context.subscription_value > 100) {
    const discountOffer = offers.find(o => o.offer_type === 'discount');
    if (discountOffer) return discountOffer;
  }

  // If on a higher plan, offer downgrade
  if (context?.plan && ['premium', 'pro'].includes(context.plan.toLowerCase())) {
    const downgradeOffer = offers.find(o => o.offer_type === 'downgrade');
    if (downgradeOffer) return downgradeOffer;
  }

  // If reason is price-related, offer discount
  if (context?.cancellation_reason?.toLowerCase().includes('price')) {
    const discountOffer = offers.find(o => o.offer_type === 'discount');
    if (discountOffer) return discountOffer;
  }

  // Default to highest priority (lowest number) offer
  return offers[0];
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey + 'churnaizer_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}