import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationRequest {
  questionnaireId: string;
  customerName: string;
  customerEmail: string;
  propertyType: string;
  monthlyBill: number;
}

// Input validation and sanitization
const validateAndSanitize = (data: any): NotificationRequest => {
  const { questionnaireId, customerName, customerEmail, propertyType, monthlyBill } = data;

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!questionnaireId || typeof questionnaireId !== "string" || !uuidRegex.test(questionnaireId)) {
    throw new Error("Invalid questionnaire ID");
  }

  // Validate name
  if (!customerName || typeof customerName !== "string" || customerName.trim().length === 0 || customerName.length > 200) {
    throw new Error("Invalid customer name");
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customerEmail || typeof customerEmail !== "string" || !emailRegex.test(customerEmail) || customerEmail.length > 255) {
    throw new Error("Invalid email address");
  }

  // Validate property type
  if (!propertyType || typeof propertyType !== "string" || propertyType.trim().length === 0 || propertyType.length > 50) {
    throw new Error("Invalid property type");
  }

  // Validate monthly bill
  if (typeof monthlyBill !== "number" || monthlyBill < 0 || monthlyBill > 999999) {
    throw new Error("Invalid monthly bill amount");
  }

  // HTML escape function
  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return {
    questionnaireId: questionnaireId.trim(),
    customerName: escapeHtml(customerName.trim()),
    customerEmail: customerEmail.trim(),
    propertyType: escapeHtml(propertyType.trim()),
    monthlyBill,
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    const { questionnaireId, customerName, customerEmail, propertyType, monthlyBill } = validateAndSanitize(rawData);

    console.log("Notifying vendors about new questionnaire:", questionnaireId);

    // Create Supabase admin client to fetch vendor emails
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all vendor profiles
    const { data: vendors, error: vendorsError } = await supabase
      .from("vendor_profiles")
      .select("email, company_name");

    if (vendorsError) {
      console.error("Error fetching vendors:", vendorsError);
      throw vendorsError;
    }

    if (!vendors || vendors.length === 0) {
      console.log("No vendors found to notify");
      return new Response(
        JSON.stringify({ success: true, message: "No vendors to notify" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const appUrl = "https://5abb8aa6-16f5-4047-b465-705cb57ba542.lovableproject.com";

    // Send email to all vendors
    const emailPromises = vendors.map(async (vendor) => {
      try {
        const emailResponse = await resend.emails.send({
          from: "Solar Quotes <noreply@energiwise.ca>",
          to: [vendor.email],
          subject: "New Solar Quotation Request Available",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #2563eb;">New Solar Quotation Request</h1>
                  
                  <p>Hello ${vendor.company_name},</p>
                  
                  <p>A new solar quotation request is available on the platform.</p>
                  
                  <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Request Details:</h3>
                    <ul style="list-style: none; padding: 0;">
                      <li><strong>Customer Name:</strong> ${customerName}</li>
                      <li><strong>Property Type:</strong> ${propertyType}</li>
                      <li><strong>Monthly Electric Bill:</strong> $${monthlyBill}</li>
                    </ul>
                  </div>
                  
                  <p>
                    <a href="${appUrl}/questionnaire-details/${questionnaireId}" 
                       style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
                      View Request & Submit Proposal
                    </a>
                  </p>
                  
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    This is an automated notification. Please log in to the platform to view the complete request details and submit your proposal.
                  </p>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Email sent to vendor ${vendor.email}:`, emailResponse);
        return { success: true, vendor: vendor.email };
      } catch (error) {
        console.error(`Failed to send email to ${vendor.email}:`, error);
        return { success: false, vendor: vendor.email, error };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.success).length;

    console.log(`Notified ${successCount}/${vendors.length} vendors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${successCount}/${vendors.length} vendors` 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-vendor-questionnaire function:", error);
    
    // Return generic error message to client
    const isValidationError = error.message?.includes("Invalid");
    return new Response(
      JSON.stringify({ 
        error: isValidationError ? error.message : "Unable to send vendor notifications. Please try again later.",
        code: "NOTIFICATION_FAILED"
      }),
      {
        status: isValidationError ? 400 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);