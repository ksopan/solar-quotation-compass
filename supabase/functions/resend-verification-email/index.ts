import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendVerificationRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ResendVerificationRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🔍 [resend-verification] Looking up user by email:", email);

    // Find user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ [resend-verification] Error listing users:", listError);
      throw listError;
    }

    const user = users?.find(u => u.email === email);

    if (!user) {
      console.log("⚠️ [resend-verification] User not found for email:", email);
      // Return success even if user not found (security: don't reveal if email exists)
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already verified
    if (user.user_metadata?.custom_email_verified) {
      console.log("ℹ️ [resend-verification] User already verified:", user.id);
      return new Response(
        JSON.stringify({ error: "Email already verified" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("📧 [resend-verification] Resending verification for user:", user.id);

    // Generate new verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update user metadata with new token
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        verification_token: verificationToken,
        verification_token_expires_at: expiresAt.toISOString(),
      },
    });

    if (updateError) {
      console.error("❌ [resend-verification] Failed to update user:", updateError);
      throw updateError;
    }

    // Build verification URL
    const verificationUrl = `${supabaseUrl}/functions/v1/verify-registration?token=${verificationToken}&userId=${user.id}`;

    // Send email via Resend
    const firstName = user.user_metadata?.firstName || "User";
    const lastName = user.user_metadata?.lastName || "";
    const role = user.user_metadata?.role || "customer";

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Solar Quotation Compass <onboarding@resend.dev>",
      to: [email],
      subject: "Verify Your Email - Solar Quotation Compass",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">☀️ Welcome to Solar Quotation Compass</h1>
            </div>
            
            <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for registering as a ${role}! Please verify your email address to activate your account.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  ✓ Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                If the button doesn't work, copy and paste this link into your browser:
                <br>
                <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;">
                  <strong>This link will expire in 24 hours.</strong><br>
                  After verification, you can log in to access your dashboard.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 30px;">
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p style="margin-top: 10px;">© ${new Date().getFullYear()} Solar Quotation Compass. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("❌ [resend-verification] Failed to send email:", emailError);
      throw emailError;
    }

    console.log("✅ [resend-verification] Verification email resent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("❌ [resend-verification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to resend verification email" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
