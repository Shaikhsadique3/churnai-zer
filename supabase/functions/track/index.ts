
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TrackRequest {
  user_id: string;
  plan: string;
  usage_score: number;
  last_login: string;
}

interface ChurnResponse {
  churn_score: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get API key from header (case-sensitive)
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing X-API-Key header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify API key and get owner
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      console.log('API key validation failed:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const ownerId = keyData.user_id;
    console.log('Valid API key for user:', ownerId);

    // Parse request body
    const body: TrackRequest = await req.json();
    const { user_id, plan, usage_score, last_login } = body;

    // Validate all required fields
    if (!user_id || !plan || usage_score === undefined || !last_login) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, plan, usage_score, last_login' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing tracking request for user:', user_id);

    // Call external churn prediction API
    const churnApiUrl = Deno.env.get('CHURN_API_URL');
    const churnApiKey = Deno.env.get('CHURN_API_KEY');

    if (!churnApiUrl || !churnApiKey) {
      console.error('Missing CHURN_API_URL or CHURN_API_KEY');
      return new Response(
        JSON.stringify({ error: 'External API configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const churnResponse = await fetch(churnApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${churnApiKey}`,
      },
      body: JSON.stringify({
        plan,
        usage_score,
        last_login,
      }),
    });

    if (!churnResponse.ok) {
      console.error('Churn API request failed:', await churnResponse.text());
      return new Response(
        JSON.stringify({ error: 'External churn prediction API failed' }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const churnData: ChurnResponse = await churnResponse.json();
    const churnScore = churnData.churn_score;

    console.log('Received churn score:', churnScore);

    // Calculate risk level based on specifications
    let riskLevel: 'low' | 'medium' | 'high';
    if (churnScore >= 0.7) {
      riskLevel = 'high';
    } else if (churnScore >= 0.4) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    console.log('Calculated risk level:', riskLevel);

    // Save to user_data table
    const { error: saveError } = await supabase
      .from('user_data')
      .upsert({
        user_id,
        owner_id: ownerId,
        plan: plan as 'Free' | 'Pro' | 'Enterprise',
        usage: usage_score,
        last_login: new Date(last_login).toISOString(),
        churn_score: churnScore,
        risk_level: riskLevel,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'owner_id,user_id'
      });

    if (saveError) {
      console.error('Failed to save user data:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save tracking data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully saved user data for:', user_id);

    // Return success response as specified
    return new Response(
      JSON.stringify({
        status: 'ok',
        churn_score: churnScore,
        risk_level: riskLevel,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
