import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData } = await req.json();
    
    if (!csvData || !Array.isArray(csvData)) {
      throw new Error('Invalid CSV data format');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log(`Processing ${csvData.length} rows for user ${user.id}`);

    // Expected columns: user_id, feature_name, event_date, plan (optional)
    const processedEvents = [];
    const errors = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      try {
        // Validate required fields
        if (!row.user_id || !row.feature_name) {
          errors.push(`Row ${i + 1}: Missing required fields (user_id, feature_name)`);
          continue;
        }

        // Parse event_date
        let eventDate: Date;
        if (row.event_date) {
          eventDate = new Date(row.event_date);
          if (isNaN(eventDate.getTime())) {
            errors.push(`Row ${i + 1}: Invalid date format`);
            continue;
          }
        } else {
          eventDate = new Date();
        }

        // Prepare metadata for extra fields
        const metadata: any = {};
        for (const [key, value] of Object.entries(row)) {
          if (!['user_id', 'feature_name', 'event_date', 'plan'].includes(key)) {
            metadata[key] = value;
          }
        }

        const featureEvent = {
          user_id: row.user_id,
          feature_name: row.feature_name,
          event_date: eventDate.toISOString(),
          plan: row.plan || null,
          metadata: Object.keys(metadata).length > 0 ? metadata : null,
          owner_id: user.id
        };

        processedEvents.push(featureEvent);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    // Batch insert the processed events
    if (processedEvents.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('feature_events')
        .insert(processedEvents);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to insert events: ${insertError.message}`);
      }
    }

    console.log(`Successfully processed ${processedEvents.length} events with ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedEvents.length,
        errors: errors.length,
        errorDetails: errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Process feature events error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});