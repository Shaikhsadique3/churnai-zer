import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('Send email request received');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get and verify authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token and get user
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: "Invalid token or user not found" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body - supabase.functions.invoke() sends JSON already
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Parsed request body:', requestBody);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { to, subject, html } = requestBody;
    
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending email to:', to, 'Subject:', subject);

    // Fetch user's email settings from integration_settings table
    const { data: emailSettings, error: settingsError } = await supabase
      .from("integration_settings")
      .select("sender_email, sender_name, email_api_key, email_provider")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching email settings:', settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch email settings" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine from email address
    let fromEmail = 'Churnaizer <notify@churnaizer.com>'; // Default fallback
    if (emailSettings?.sender_email) {
      fromEmail = emailSettings.sender_name 
        ? `${emailSettings.sender_name} <${emailSettings.sender_email}>`
        : emailSettings.sender_email;
    }

    // Get Resend API key (from user settings or environment)
    const resendApiKey = emailSettings?.email_api_key || Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Resend API key not configured" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create email log entry
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: user.id,
        target_email: to,
        status: 'pending',
        email_data: {
          subject,
          html,
          from: fromEmail,
          provider: 'resend'
        }
      })
      .select('id')
      .maybeSingle();

    if (logError) {
      console.error('Failed to create email log:', logError);
    }

    // Send email using Resend
    const resend = new Resend(resendApiKey);
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    });

    if (emailResponse.error) {
      console.error('Resend API error:', emailResponse.error);
      
      // Update email log with failure
      if (emailLog?.id) {
        await supabase
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: emailResponse.error.message
          })
          .eq('id', emailLog.id);
      }
      
      return new Response(
        JSON.stringify({ error: `Resend error: ${emailResponse.error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update email log with success
    if (emailLog?.id) {
      await supabase
        .from('email_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          email_data: {
            subject,
            html,
            from: fromEmail,
            provider: 'resend',
            email_id: emailResponse.data?.id
          }
        })
        .eq('id', emailLog.id);
    }

    console.log('Email sent successfully:', emailResponse.data?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        id: emailResponse.data?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('Unexpected error in send-email function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});