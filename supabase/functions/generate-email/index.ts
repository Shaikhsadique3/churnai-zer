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
      prediction_id,
      customer_id,
      churn_reason,
      risk_level,
      usp_text,
      website_link
    } = await req.json();

    // Validation
    if (!prediction_id || !customer_id || !churn_reason || !usp_text || !website_link) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate inputs (security)
    if (typeof usp_text !== 'string' || usp_text.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'USP text exceeds maximum length' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(website_link)) {
      return new Response(
        JSON.stringify({ error: 'Invalid website URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating retention email');

    // Create expert retention email prompt
    const systemPrompt = `You are an expert retention email copywriter specializing in SaaS customer psychology. Your emails are:
- Empathetic and personalized based on churn signals
- Action-oriented with psychology-driven CTAs (loss aversion, reciprocity, social proof)
- Concise and scannable (under 150 words)
- Professional yet warm in tone
- Focused on solving customer pain points`;

    const userPrompt = `Generate a personalized retention email for a ${risk_level}-risk customer.

Churn Risk Signals:
${churn_reason}

Product Value Proposition:
${usp_text}

Requirements:
1. **Subject Line**: Compelling, curiosity-driven, under 50 characters
2. **Opening**: Acknowledge their situation with empathy (no generic greetings)
3. **Body**: Highlight specific USP features that directly solve their pain points
4. **Psychology**: Use one psychological principle (loss aversion, social proof, or reciprocity)
5. **CTA**: Clear action button linking to ${website_link}
6. **Tone**: Human, authentic, not salesy

Return ONLY valid JSON:
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

    // Store generated email in database
    const { data: emailRecord, error: insertError } = await supabase
      .from('generated_emails')
      .insert({
        prediction_id,
        user_id: user.id,
        customer_id,
        subject: emailContent.subject,
        body: emailContent.body,
        cta_text: emailContent.cta_text,
        cta_link: emailContent.cta_link
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing email:', insertError);
      throw insertError;
    }

    console.log('Email generation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        email: {
          id: emailRecord.id,
          customer_id,
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
