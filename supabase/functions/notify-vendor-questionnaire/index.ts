import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  questionnaireId: string;
  customerName: string;
  customerEmail: string;
  propertyType: string;
  monthlyBill: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionnaireId, customerName, customerEmail, propertyType, monthlyBill }: NotificationRequest = await req.json();

    console.log("New questionnaire submitted:", {
      questionnaireId,
      customerName,
      customerEmail,
      propertyType,
      monthlyBill
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch all vendor emails from the database
    const { data: vendors, error: vendorError } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("role", "vendor");

    if (vendorError) {
      console.error("Error fetching vendors:", vendorError);
      throw new Error("Failed to fetch vendor emails");
    }

    if (!vendors || vendors.length === 0) {
      console.log("No vendors found in the system");
      return new Response(JSON.stringify({ success: true, message: "No vendors to notify" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    const vendorEmails = vendors.map(v => v.email);
    console.log(`Sending notifications to ${vendorEmails.length} vendors`);

    // Send email to all vendors
    const emailResponse = await resend.emails.send({
      from: "Solar Quotation Compass <onboarding@resend.dev>",
      to: vendorEmails,
      subject: "New Solar Installation Request Available",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #059669;">New Solar Installation Request</h1>
          <p>A new customer has submitted a questionnaire for solar installation.</p>
          <h2>Customer Details:</h2>
          <ul>
            <li><strong>Name:</strong> ${customerName}</li>
            <li><strong>Email:</strong> ${customerEmail}</li>
            <li><strong>Property Type:</strong> ${propertyType}</li>
            <li><strong>Monthly Electric Bill:</strong> $${monthlyBill}</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${Deno.env.get('VITE_SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || 'https://your-app.lovableproject.com'}/questionnaires/${questionnaireId}" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Questionnaire & Submit Proposal
            </a>
          </div>
          <p><strong>Deadline:</strong> You have 14 days to submit your proposal.</p>
          <p>Log in to your vendor dashboard to review the full details and submit a competitive proposal.</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log("Notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-vendor-questionnaire function:", error);
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
