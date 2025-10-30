import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  verificationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, verificationToken }: VerificationEmailRequest = await req.json();

    console.log("Sending verification email to:", email);

    const verificationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-questionnaire?token=${verificationToken}`;
    const appUrl = Deno.env.get("APP_URL") || "https://agmsvskzasrqnlijtwbg.supabase.co";

    const emailResponse = await resend.emails.send({
      from: "Solar Quotes <noreply@energywise.ca>",
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
    console.error("Error sending verification email:", error);
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
