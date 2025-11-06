import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const userId = url.searchParams.get("userId");
    const origin = req.headers.get("origin") || "https://5abb8aa6-16f5-4047-b465-705cb57ba542.lovableproject.com";

    if (!token || !userId) {
      console.warn("Missing verification token or userId");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/login?error=invalid_token`,
          ...corsHeaders,
        },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !user) {
      console.error("Failed to find user:", userError);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/login?error=token_expired`,
          ...corsHeaders,
        },
      });
    }

    // Check if token matches and hasn't expired
    const storedToken = user.user_metadata?.verification_token;
    const expiresAt = user.user_metadata?.verification_token_expires_at;

    if (!storedToken || storedToken !== token) {
      console.warn("Invalid or mismatched token");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/login?error=invalid_token`,
          ...corsHeaders,
        },
      });
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      console.warn("Expired token");
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/login?error=token_expired`,
          ...corsHeaders,
        },
      });
    }

    // Mark email as verified with custom flag
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
      user_metadata: {
        ...user.user_metadata,
        email_verified: true,
        custom_email_verified: true, // Our custom verification flag
        verification_token: null,
        verification_token_expires_at: null,
      },
    });

    if (updateError) {
      console.error("Failed to verify user:", updateError);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/login?error=verification_failed`,
          ...corsHeaders,
        },
      });
    }

    console.log("User verified successfully:", userId);

    // CRITICAL: Redirect to login WITHOUT creating a session
    // User must manually log in
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/login?verified=true`,
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-registration function:", error);
    const origin = "https://5abb8aa6-16f5-4047-b465-705cb57ba542.lovableproject.com";
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/login?error=verification_failed`,
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
