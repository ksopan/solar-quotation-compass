import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
  location: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionnaireId, customerName, customerEmail, location }: NotificationRequest = await req.json();

    // In production, you would fetch vendor emails from the database
    // For now, this is a placeholder for the notification system
    console.log("New questionnaire submitted:", {
      questionnaireId,
      customerName,
      customerEmail,
      location
    });

    // Send email to vendors (you would need to fetch vendor emails from your database)
    const emailResponse = await resend.emails.send({
      from: "Solar Quotes <onboarding@resend.dev>",
      to: ["vendor@example.com"], // Replace with actual vendor emails from database
      subject: "New Solar Installation Questionnaire Submitted",
      html: `
        <h1>New Solar Installation Request</h1>
        <p>A new customer has submitted a questionnaire for solar installation.</p>
        <h2>Customer Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${customerName}</li>
          <li><strong>Email:</strong> ${customerEmail}</li>
          <li><strong>Location:</strong> ${location}</li>
        </ul>
        <p>Log in to your vendor dashboard to review the full details and submit a proposal.</p>
        <p>You have 14 days to submit your proposal.</p>
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
