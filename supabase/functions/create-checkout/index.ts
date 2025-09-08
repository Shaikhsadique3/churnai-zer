import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { upload_id } = await req.json();

    if (!upload_id) {
      return new Response(
        JSON.stringify({ error: "Upload ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get upload details
    const { data: upload, error: uploadError } = await supabase
      .from("churn_uploads")
      .select("*")
      .eq("id", upload_id)
      .maybeSingle();

    if (uploadError || !upload) {
      return new Response(
        JSON.stringify({ error: "Upload not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: upload.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Full Churn Audit Report",
              description: "Complete churn analysis with detailed insights and recommendations"
            },
            unit_amount: 9900, // $99.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/report/${upload_id}?payment=success`,
      cancel_url: `${req.headers.get("origin")}/report/${upload_id}?payment=cancelled`,
      metadata: {
        upload_id: upload_id
      }
    });

    // Save payment record (using service role for secure insert)
    const { error: paymentError } = await supabase
      .from("churn_payments")
      .insert({
        upload_id: upload_id,
        status: "created",
        amount: 9900,
        currency: "usd",
        stripe_session_id: session.id,
        user_id: null // Will be set by webhook when payment is processed
      });

    if (paymentError) {
      console.error("Payment record error:", paymentError);
    }

    return new Response(
      JSON.stringify({ checkout_url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});