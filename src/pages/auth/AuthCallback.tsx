
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check for questionnaire data in localStorage (used for OAuth flow)
        const questionnaireId = localStorage.getItem("questionnaire_id");
        const questionnaireDataStr = localStorage.getItem("questionnaire_data");
        
        if (session.user && questionnaireId) {
          try {
            // Update the questionnaire with the user ID
            const { error: updateError } = await supabase
              .from("property_questionnaires")
              .update({ 
                customer_id: session.user.id, 
                is_completed: true 
              })
              .eq("id", questionnaireId);
              
            if (updateError) {
              console.error("Error associating questionnaire with user:", updateError);
            } else {
              console.log("Successfully associated questionnaire with user");
              localStorage.removeItem("questionnaire_id");
            }
          } catch (error) {
            console.error("Error in handling questionnaire association:", error);
          }
        }
        
        // Check if we need to create a quotation request from questionnaire data
        if (session.user && questionnaireDataStr) {
          try {
            const questionnaireData = JSON.parse(questionnaireDataStr);
            console.log("Creating quotation request from questionnaire data:", questionnaireData);
            
            // Create a quotation request from the questionnaire data
            const { error: quotationError } = await supabase
              .from("quotation_requests")
              .insert({
                customer_id: session.user.id,
                location: questionnaireData.address || "Not specified",
                roof_type: "unknown", // Default value, could be improved with more questionnaire data
                roof_area: 0, // Default value, could be improved with more questionnaire data
                energy_usage: questionnaireData.monthly_electric_bill || 0,
                additional_notes: `Property type: ${questionnaireData.property_type}
Ownership status: ${questionnaireData.ownership_status}
Interested in batteries: ${questionnaireData.interested_in_batteries ? 'Yes' : 'No'}
${questionnaireData.battery_reason ? 'Battery reason: ' + questionnaireData.battery_reason : ''}
Purchase timeline: ${questionnaireData.purchase_timeline}
Willing to remove trees: ${questionnaireData.willing_to_remove_trees ? 'Yes' : 'No'}
Roof age status: ${questionnaireData.roof_age_status}`
              });
              
            if (quotationError) {
              console.error("Error creating quotation request:", quotationError);
            } else {
              console.log("Successfully created quotation request from questionnaire");
              localStorage.removeItem("questionnaire_data");
            }
          } catch (parseError) {
            console.error("Error parsing questionnaire data:", parseError);
          }
        }
        
        // Check user's role to redirect to appropriate dashboard
        const userMetadata = session.user.user_metadata;
        const role = userMetadata?.role;
        
        // Redirect based on user role
        toast.success("Successfully authenticated!");
        
        if (role === "customer") {
          navigate("/customer/dashboard");
        } else if (role === "vendor") {
          navigate("/vendor/dashboard");
        } else if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else if (event === 'SIGNED_OUT') {
        navigate("/login");
      }
    });

    // Cleanup function
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing authentication...</h1>
        <p className="text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
