import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionnaireId } = await req.json();

    if (!questionnaireId) {
      return new Response(
        JSON.stringify({ verified: false, error: "Missing questionnaire ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if questionnaire exists and is verified
    const { data: questionnaire, error } = await supabaseAdmin
      .from("property_questionnaires")
      .select("id, verified_at, email")
      .eq("id", questionnaireId)
      .maybeSingle();

    if (error) {
      console.error("Error checking questionnaire:", error);
      return new Response(
        JSON.stringify({ verified: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isVerified = !!questionnaire?.verified_at;

    return new Response(
      JSON.stringify({
        verified: isVerified,
        questionnaireId: questionnaire?.id,
        email: questionnaire?.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-questionnaire-verified:", error);
    return new Response(
      JSON.stringify({ verified: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
