import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckVerificationRequest {
  questionnaireId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionnaireId }: CheckVerificationRequest = await req.json();

    if (!questionnaireId) {
      return new Response(
        JSON.stringify({ error: "questionnaireId is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use service role to bypass RLS
    const { data, error } = await supabase
      .from("property_questionnaires")
      .select("id, verified_at, email")
      .eq("id", questionnaireId)
      .single();

    if (error) {
      console.error("Error checking questionnaire:", error);
      return new Response(
        JSON.stringify({ verified: false, questionnaireId: null }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const isVerified = !!data.verified_at;

    return new Response(
      JSON.stringify({
        verified: isVerified,
        questionnaireId: isVerified ? data.id : null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-questionnaire-verified function:", error);
    return new Response(
      JSON.stringify({ error: error.message, verified: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
