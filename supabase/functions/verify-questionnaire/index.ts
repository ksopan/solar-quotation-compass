import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    // Get the origin from referer or construct from host
    const referer = req.headers.get("referer");
    const origin = referer ? new URL(referer).origin : 
                   req.headers.get("origin") || 
                   `https://${url.hostname}`;

    if (!token) {
      console.warn("Missing verification token");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/?error=invalid_token`,
          ...corsHeaders,
        },
      });
    }

    // Validate token format (must be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      console.warn(`Invalid token format attempted: ${token.substring(0, 8)}...`);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/?error=invalid_token`,
          ...corsHeaders,
        },
      });
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find the questionnaire by verification token
    const { data: questionnaire, error: fetchError } = await supabaseAdmin
      .from('property_questionnaires')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (fetchError || !questionnaire) {
      console.error('Failed to find questionnaire:', fetchError);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/?error=token_expired`,
          ...corsHeaders,
        },
      });
    }

    // Check token expiration
    if (questionnaire.verification_token_expires_at) {
      const expiresAt = new Date(questionnaire.verification_token_expires_at);
      if (expiresAt < new Date()) {
        console.warn(`Expired token attempted: ${questionnaire.id}`);
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${origin}/?error=token_expired`,
            ...corsHeaders,
          },
        });
      }
    }

    // Check if already verified
    if (questionnaire.verified_at) {
      console.log('Questionnaire already verified');
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/verification-success?verified=already`,
          ...corsHeaders,
        },
      });
    }

    // Update the questionnaire status to active and mark as verified
    // Keep it in pending state until user registers, then it becomes draft for editing
    const { error: updateError } = await supabaseAdmin
      .from('property_questionnaires')
      .update({ 
        status: 'pending_verification', // Keep pending until user creates account
        verified_at: new Date().toISOString(),
        verification_token: null, // Invalidate token after use
        verification_token_expires_at: null
      })
      .eq('id', questionnaire.id);

    if (updateError) {
      console.error('Error updating questionnaire:', updateError);
      throw updateError;
    }

    console.log('Questionnaire verified successfully:', questionnaire.id);

    // Notify vendors about the new active questionnaire
    const { error: notifyError } = await supabaseAdmin.functions.invoke(
      'notify-vendor-questionnaire',
      {
        body: {
          questionnaireId: questionnaire.id,
          customerName: `${questionnaire.first_name} ${questionnaire.last_name}`,
          customerEmail: questionnaire.email,
          propertyType: questionnaire.property_type,
          monthlyBill: questionnaire.monthly_electric_bill
        },
      }
    );

    if (notifyError) {
      console.error('Error notifying vendors:', notifyError);
      // Don't fail the verification if vendor notification fails
    }

    // Redirect to success page
    console.log('Redirecting to verification success page');
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/verification-success?verified=success&email=${encodeURIComponent(questionnaire.email)}&questionnaireId=${questionnaire.id}`,
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error in verify-questionnaire:', error);
    
    // Generic error message to client
    return new Response("An error occurred during verification. Please try again later.", { 
      status: 500,
      headers: corsHeaders 
    });
  }
};

serve(handler);