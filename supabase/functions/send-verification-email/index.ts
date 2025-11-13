import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  verificationToken: string;
}

// Input validation and sanitization
const validateAndSanitize = (data: any): VerificationEmailRequest => {
  const { email, firstName, lastName, verificationToken } = data;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 255) {
    throw new Error("Invalid email address");
  }

  // Validate name fields
  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0 || firstName.length > 100) {
    throw new Error("Invalid first name");
  }
  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0 || lastName.length > 100) {
    throw new Error("Invalid last name");
  }

  // Validate token is a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!verificationToken || typeof verificationToken !== "string" || !uuidRegex.test(verificationToken)) {
    throw new Error("Invalid verification token");
  }

  // HTML escape function to prevent XSS
  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return {
    email: email.trim(),
    firstName: escapeHtml(firstName.trim()),
    lastName: escapeHtml(lastName.trim()),
    verificationToken: verificationToken.trim(),
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    const { email, firstName, lastName, verificationToken } = validateAndSanitize(rawData);

    console.log("Sending verification email to:", email);

    const verificationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-questionnaire?token=${verificationToken}`;
    const appUrl = Deno.env.get("APP_URL") || "https://energiwise.ca";

    const emailResponse = await resend.emails.send({
      from: "Solar Quotes <noreply@energiwise.ca>",
      to: [email],
      subject: "Verify Your Solar Quotation Request",
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
                <h1>☀️ Verify Your Solar Quote Request</h1>
              </div>
              
              <div class="content">
                <p>Hello ${firstName} ${lastName},</p>
                
                <p>Thank you for requesting solar panel quotations! To activate your request and connect you with qualified solar vendors, please verify your email address.</p>
                
                <div class="highlight">
                  <strong>What happens after verification?</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Your quotation request becomes active</li>
                    <li>Vendors will be notified and can submit their proposals</li>
                    <li>You'll receive email notifications when proposals arrive</li>
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">
                    ✓ Verify & Activate Quotation
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <span style="word-break: break-all;">${verificationUrl}</span>
                </p>
                
                <p style="margin-top: 30px;">
                  <strong>Next Steps:</strong><br>
                  After verification, you can register an account to:
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Track your quotation status</li>
                    <li>View and compare vendor proposals</li>
                    <li>Communicate with vendors directly</li>
                  </ul>
                </p>
              </div>
              
              <div class="footer">
                <p>If you didn't request this quotation, you can safely ignore this email.</p>
                <p style="margin-top: 15px;">
                  <a href="${appUrl}" style="color: #2563eb; text-decoration: none;">Visit Solar Quotes Platform</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

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
    console.error("Error in send-verification-email function:", error);
    
    // Return generic error message to client, log details server-side
    const isValidationError = error.message?.includes("Invalid");
    return new Response(
      JSON.stringify({ 
        error: isValidationError ? error.message : "Unable to send verification email. Please try again later.",
        code: "EMAIL_SEND_FAILED"
      }),
      {
        status: isValidationError ? 400 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);