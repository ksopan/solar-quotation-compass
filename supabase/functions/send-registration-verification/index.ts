import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationVerificationRequest {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, firstName, lastName, role }: RegistrationVerificationRequest = await req.json();

    console.log("📧 Creating registration verification for:", email);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        verification_token: verificationToken,
        verification_token_expires_at: expiresAt.toISOString(),
        email_verified: false,
        firstName,
        lastName,
        role,
      },
    });

    if (updateError) {
      console.error("❌ Failed to store verification token:", updateError);
      throw new Error("Failed to create verification");
    }

    // Build verification URL - this will verify the email WITHOUT logging in
    const verificationUrl = `${supabaseUrl}/functions/v1/verify-registration?token=${verificationToken}&userId=${userId}`;
    const displayName = firstName && lastName ? `${firstName} ${lastName}` : email.split("@")[0];

    // Send verification email via Resend
    const emailResponse = await resend.emails.send({
      from: "Solar Quotation Compass <noreply@energiwise.ca>",
      to: [email],
      subject: "Verify Your Solar Quotation Compass Account",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
              .content { margin-bottom: 30px; }
              .content p { margin: 15px 0; font-size: 16px; }
              .button { display: inline-block; padding: 16px 32px; background: #2563eb; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
              .button:hover { background: #1d4ed8; }
              .footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
              .highlight { background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>☀️ Welcome to Solar Quotation Compass</h1>
              </div>
              
              <div class="content">
                <p>Hello ${displayName},</p>
                
                <p>Thank you for registering as a ${role}! Please verify your email address to activate your account.</p>
                
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">
                    ✓ Verify Email Address
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <span style="word-break: break-all;">${verificationUrl}</span>
                </p>
                
                <div class="highlight">
                  <strong>This link will expire in 24 hours.</strong><br>
                  After verification, you can log in to access your dashboard.
                </div>
              </div>
              
              <div class="footer">
                <p>If you didn't create this account, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("✅ Registration verification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-registration-verification function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Unable to send verification email. Please try again later.",
        code: "EMAIL_SEND_FAILED"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
