import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface WaitlistEmailRequest {
  name: string;
  email: string;
  company?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { name, email, company }: WaitlistEmailRequest = await req.json();

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already on waitlist' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Insert into waitlist
    const { error: insertError } = await supabase
      .from('waitlist')
      .insert([{
        name,
        email,
        company: company || null,
        email_sent: false
      }]);

    if (insertError) {
      console.error('Error inserting into waitlist:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to join waitlist' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send confirmation email
    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">You're on the Churnaizer waitlist! 🎉</h1>
            
            <p>Hi ${name},</p>
            
            <p>Thanks for joining the Churnaizer waitlist! We're excited to have you on board.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">What happens next?</h3>
              <ul style="color: #475569;">
                <li>We'll keep you updated on our product development</li>
                <li>You'll be among the first to know when we launch</li>
                <li>Early access to exclusive features and pricing</li>
              </ul>
            </div>
            
            <p>In the meantime, feel free to reach out if you have any questions or feedback.</p>
            
            <p>Best regards,<br>
            The Churnaizer Team</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
              <p>You're receiving this email because you signed up for the Churnaizer waitlist.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'Churnaizer <nexa@churnaizer.com>',
      to: [email],
      subject: "You're on the Churnaizer waitlist! 🎉",
      html: emailContent,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails, just log it
    } else {
      // Update the record to mark email as sent
      await supabase
        .from('waitlist')
        .update({ email_sent: true })
        .eq('email', email);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully joined waitlist and confirmation email sent' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-waitlist-email function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});