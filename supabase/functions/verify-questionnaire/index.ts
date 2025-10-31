import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Verification token is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Verifying questionnaire with token:", token);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the questionnaire by verification token
    const { data: questionnaire, error: fetchError } = await supabase
      .from("property_questionnaires")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (fetchError || !questionnaire) {
      console.error("Questionnaire not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification token" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if already verified
    if (questionnaire.verified_at) {
      console.log("Questionnaire already verified");
      // Redirect to success page - use origin from request or fallback to env
      const origin = req.headers.get("origin") || Deno.env.get("SUPABASE_URL")?.replace(/https:\/\/\w+\.supabase\.co/, "https://5abb8aa6-16f5-4047-b465-705cb57ba542.lovableproject.com") || "https://5abb8aa6-16f5-4047-b465-705cb57ba542.lovableproject.com";
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/verification-success?verified=already`,
          ...corsHeaders,
        },
      });
    }

    // Update questionnaire to verified and active
    const { error: updateError } = await supabase
      .from("property_questionnaires")
      .update({
        status: "active",
        verified_at: new Date().toISOString(),
      })
      .eq("id", questionnaire.id);

    if (updateError) {
      console.error("Error updating questionnaire:", updateError);
      throw updateError;
    }

    console.log("Questionnaire verified successfully:", questionnaire.id);

    // Notify vendors about the new active questionnaire
    const { error: notifyError } = await supabase.functions.invoke(
      "notify-vendor-questionnaire",
      {
        body: {
          questionnaireId: questionnaire.id,
          customerName: `${questionnaire.first_name} ${questionnaire.last_name}`,
          customerEmail: questionnaire.email,
          propertyType: questionnaire.property_type,
          monthlyBill: questionnaire.monthly_electric_bill,
          interestedInBatteries: questionnaire.interested_in_batteries,
        },
      }
    );

    if (notifyError) {
      console.error("Error notifying vendors:", notifyError);
      // Don't fail the verification if vendor notification fails
    }

    // Redirect to success page - use origin from request or fallback to env
    const origin = req.headers.get("origin") || Deno.env.get("SUPABASE_URL")?.replace(/https:\/\/\w+\.supabase\.co/, "https://5abb8aa6-16f5-4047-b465-705cb57ba542.lovableproject.com") || "https://5abb8aa6-16f5-4047-b465-705cb57ba542.lovableproject.com";
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/verification-success?verified=success&email=${encodeURIComponent(questionnaire.email)}`,
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-questionnaire:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
