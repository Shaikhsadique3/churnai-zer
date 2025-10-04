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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      customer_id,
      customer_name,
      churn_reason,
      risk_level,
      recommendations,
      usp_content,
      website_link
    } = await req.json();

    // Validate inputs
    if (!customer_id || !churn_reason || !usp_content || !website_link) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating retention email for customer: ${customer_id}`);

    // Create expert prompt for email generation
    const systemPrompt = `You are an expert retention email copywriter specializing in customer psychology and re-engagement strategies. Your emails are known for being:
- Empathetic and personalized
- Action-oriented with clear CTAs
- Based on behavioral psychology principles (loss aversion, social proof, reciprocity)
- Professional yet warm in tone
- Concise and scannable (under 150 words)`;

    const userPrompt = `Generate a personalized retention email for a ${risk_level}-risk customer.

Customer Context:
- Name: ${customer_name || 'there'}
- Churn Risk Reason: ${churn_reason}
- Recommended Actions: ${recommendations?.join(', ') || 'N/A'}

Product USP:
${usp_content}

Website CTA Link: ${website_link}

Requirements:
1. Subject line must be compelling and curiosity-driven
2. Opening must acknowledge their situation with empathy
3. Body must highlight relevant USP features that solve their pain points
4. Include social proof or urgency element
5. Clear CTA button text with website link
6. Closing must feel human and authentic

Return ONLY valid JSON with this exact structure:
{
  "subject": "subject line here",
  "body": "email body in HTML format with <p>, <strong>, <a> tags",
  "cta_text": "button text here",
  "cta_link": "${website_link}"
}`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const emailContent = JSON.parse(aiData.choices[0].message.content);

    console.log('Email generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        customer_id,
        email: {
          ...emailContent,
          generated_at: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Email generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});