import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("AUTH_WEBHOOK_SECRET") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log("Received auth webhook:", payload);

    // If webhook secret is configured, verify the signature
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      try {
        wh.verify(payload, headers);
      } catch (error) {
        console.error("Webhook verification failed:", error);
        return new Response(
          JSON.stringify({ error: "Webhook verification failed" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    const webhookData = JSON.parse(payload);
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = webhookData;

    console.log("Email action type:", email_action_type);
    console.log("User email:", user.email);

    const appUrl = "https://5abb8aa6-16f5-4047-b465-705cb57ba542.lovableproject.com";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    let emailSubject = "";
    let emailHtml = "";

    // Handle different email types
    switch (email_action_type) {
      case "signup":
      case "email_change":
        const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || appUrl}`;
        
        emailSubject = "Confirm Your Email Address";
        emailHtml = `
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
                .code { display: inline-block; padding: 16px 4.5%; width: 90.5%; background: #f4f4f4; border-radius: 5px; border: 1px solid #eee; color: #333; font-family: monospace; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>☀️ Confirm Your Email</h1>
                </div>
                
                <div class="content">
                  <p>Hello,</p>
                  
                  <p>Thank you for registering! Please confirm your email address to complete your account setup.</p>
                  
                  <div style="text-align: center;">
                    <a href="${confirmationUrl}" class="button">
                      ✓ Confirm Email Address
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <span style="word-break: break-all;">${confirmationUrl}</span>
                  </p>
                  
                  <p style="margin-top: 30px;">Or use this confirmation code:</p>
                  <div class="code">${token}</div>
                </div>
                
                <div class="footer">
                  <p>If you didn't create this account, you can safely ignore this email.</p>
                  <p style="margin-top: 15px;">
                    <a href="${appUrl}" style="color: #2563eb; text-decoration: none;">Visit Solar Quotes Platform</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case "recovery":
      case "magiclink":
        const resetUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || appUrl}`;
        
        emailSubject = email_action_type === "recovery" ? "Reset Your Password" : "Login to Your Account";
        emailHtml = `
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
                .code { display: inline-block; padding: 16px 4.5%; width: 90.5%; background: #f4f4f4; border-radius: 5px; border: 1px solid #eee; color: #333; font-family: monospace; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>☀️ ${email_action_type === "recovery" ? "Reset Your Password" : "Login Link"}</h1>
                </div>
                
                <div class="content">
                  <p>Hello,</p>
                  
                  <p>${email_action_type === "recovery" 
                    ? "You requested to reset your password. Click the button below to set a new password:" 
                    : "Click the button below to log in to your account:"}</p>
                  
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">
                      ${email_action_type === "recovery" ? "Reset Password" : "Login Now"}
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <span style="word-break: break-all;">${resetUrl}</span>
                  </p>
                  
                  <p style="margin-top: 30px;">Or use this code:</p>
                  <div class="code">${token}</div>
                  
                  <p style="color: #ef4444; margin-top: 30px;">
                    This link will expire in 1 hour for security reasons.
                  </p>
                </div>
                
                <div class="footer">
                  <p>If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
                  <p style="margin-top: 15px;">
                    <a href="${appUrl}" style="color: #2563eb; text-decoration: none;">Visit Solar Quotes Platform</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      default:
        console.error("Unknown email action type:", email_action_type);
        return new Response(
          JSON.stringify({ error: "Unknown email action type" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Solar Quotes <noreply@energiwise.ca>",
      to: [user.email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Auth email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Auth email sent" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending auth email:", error);
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
