import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyCustomerRequest {
  customerEmail: string;
  customerName: string;
  proposalId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, proposalId }: NotifyCustomerRequest = await req.json();

    console.log("Sending notification to:", customerEmail, "for proposal:", proposalId);

    const emailResponse = await resend.emails.send({
      from: "Solar Quotation Compass <onboarding@resend.dev>",
      to: [customerEmail],
      subject: "New Solar Quote Received!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">New Solar Quote Available!</h1>
          <p>Dear ${customerName},</p>
          <p>Great news! A solar vendor has submitted a quote for your property.</p>
          <p>To review the quote details, please log in to your Solar Quotation Compass account.</p>
          <div style="margin: 30px 0;">
            <a href="${Deno.env.get('VITE_SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || 'https://your-app.lovableproject.com'}" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Quote
            </a>
          </div>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>Solar Quotation Compass Team</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-customer-quote function:", error);
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
