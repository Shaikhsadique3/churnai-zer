import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check Supabase connection
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test database connection
    const { data, error } = await supabase
      .from('churn_uploads')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Check storage buckets
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      throw new Error(`Storage connection failed: ${storageError.message}`);
    }

    const requiredBuckets = ['csv-uploads', 'reports'];
    const existingBuckets = buckets?.map(b => b.name) || [];
    const missingBuckets = requiredBuckets.filter(bucket => !existingBuckets.includes(bucket));

    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      services: {
        database: 'connected',
        storage: 'connected',
        buckets: {
          available: existingBuckets,
          missing: missingBuckets
        }
      },
      limits: {
        max_file_size: '10MB',
        supported_formats: ['CSV'],
        processing_timeout: '300s'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});