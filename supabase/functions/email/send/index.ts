
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRequest: EmailRequest = await req.json();

    // Get user's integration settings
    const { data: settings, error: settingsError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: 'No email integration configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Note: With the new encryption system, we cannot decrypt credentials in edge functions
    // for security reasons. This would require a different approach, such as:
    // 1. Using a server-side proxy that handles decryption
    // 2. Storing credentials in Supabase Vault (recommended for production)
    // 3. Using environment variables for service-level credentials

    // For now, we'll return an error indicating this limitation
    return new Response(
      JSON.stringify({ 
        error: 'Email sending temporarily unavailable due to security upgrade',
        message: 'Credentials are now encrypted and require server-side processing',
        recommendation: 'Use Supabase Vault or server-side email service'
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in email send function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
