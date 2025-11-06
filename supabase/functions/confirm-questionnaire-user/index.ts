import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  userId: string;
  questionnaireId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, questionnaireId }: RequestBody = await req.json();

    if (!userId || !questionnaireId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create admin client with service role key to bypass RLS
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

    // Verify the questionnaire exists and is verified
    const { data: questionnaire, error: fetchError } = await supabaseAdmin
      .from('property_questionnaires')
      .select('id, customer_id, verified_at, email')
      .eq('id', questionnaireId)
      .maybeSingle();

    if (fetchError || !questionnaire) {
      console.error('Failed to find questionnaire:', fetchError);
      return new Response(
        JSON.stringify({ error: "Questionnaire not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if already linked
    if (questionnaire.customer_id) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Questionnaire already linked",
          alreadyLinked: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Link questionnaire to user and set to draft status for editing
    const { error: updateError } = await supabaseAdmin
      .from('property_questionnaires')
      .update({ 
        customer_id: userId,
        status: 'draft', // Allow user to edit and upload documents
        is_completed: false
      })
      .eq('id', questionnaireId);

    if (updateError) {
      console.error('Failed to link questionnaire:', updateError);
      return new Response(
        JSON.stringify({ error: "Failed to link questionnaire" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log('Successfully linked questionnaire:', questionnaireId, 'to user:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Questionnaire linked successfully" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('Error in confirm-questionnaire-user:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
