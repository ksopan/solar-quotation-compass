
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layouts/MainLayout";
import { User } from "@/contexts/auth/types";
import { transformUserData } from "@/contexts/auth/authUtils";
import { isProfileComplete } from "@/contexts/auth/authUtils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Processing login...");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setMessage("Completing authentication...");
        
        // Check URL parameters for error indications
        const urlParams = new URLSearchParams(window.location.search);
        const errorCode = urlParams.get('error_code');
        const errorDescription = urlParams.get('error_description');
        
        if (errorCode || errorDescription) {
          if (errorCode === 'email_already_in_use' || 
              (errorDescription && (
                errorDescription.includes('already in use') || 
                errorDescription.includes('already registered')
              ))) {
            toast.error("Email already in use", {
              description: "This email is already registered. Please log in or use a different email address."
            });
            setTimeout(() => navigate("/login"), 2000);
            return;
          } else {
            toast.error("Authentication failed", {
              description: errorDescription || "Could not complete the authentication process."
            });
            setTimeout(() => navigate("/login"), 2000);
            return;
          }
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          // Check if the error is related to email confirmation
          if (error.message.includes("Email not confirmed")) {
            setShowEmailConfirmation(true);
            setMessage("Please confirm your email address");
            toast.error("Email not confirmed", {
              description: "Please check your inbox and confirm your email before logging in."
            });
            setTimeout(() => navigate("/login"), 5000);
            return;
          }
          throw error;
        }
        
        if (!data.session) {
          // No session but also no error means likely an email confirmation flow
          // or another flow that doesn't immediately create a session
          toast.info("Authentication pending", {
            description: "Please follow the instructions in your email to complete the process."
          });
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        
        // Check for questionnaire data in localStorage from OAuth flow
        const questionnaireData = localStorage.getItem("questionnaire_data");
        if (questionnaireData && data.session.user) {
          setMessage("Processing your questionnaire data...");
          try {
            const parsedData = JSON.parse(questionnaireData);
            
            // Save questionnaire data with user ID
            const { error: insertError } = await supabase
              .from("property_questionnaires")
              .insert({
                property_type: parsedData.property_type,
                ownership_status: parsedData.ownership_status,
                monthly_electric_bill: parsedData.monthly_electric_bill,
                interested_in_batteries: parsedData.interested_in_batteries,
                battery_reason: parsedData.battery_reason,
                purchase_timeline: parsedData.purchase_timeline,
                willing_to_remove_trees: parsedData.willing_to_remove_trees,
                roof_age_status: parsedData.roof_age_status,
                first_name: parsedData.first_name,
                last_name: parsedData.last_name,
                email: parsedData.email,
                customer_id: data.session.user.id,
                is_completed: true
              });
              
            if (insertError) {
              console.error("Error saving questionnaire data after OAuth:", insertError);
              toast.error("Failed to process your questionnaire data");
            } else {
              console.log("Successfully saved questionnaire with user ID after OAuth");
              toast.success("Your questionnaire has been saved to your account");
              localStorage.removeItem("questionnaire_data");
            }
          } catch (err) {
            console.error("Error processing questionnaire data after OAuth:", err);
          }
        }
        
        const userData = transformUserData(data.session.user);
        
        setMessage("Login successful. Redirecting...");
        
        // Redirect based on profile completion
        setTimeout(() => {
          if (isProfileComplete(userData as User)) {
            navigate("/");
          } else {
            navigate("/complete-profile");
          }
        }, 1000);
        
      } catch (err) {
        console.error("Error during auth callback:", err);
        setMessage("Authentication failed. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <h1 className="text-2xl font-bold">{message}</h1>
          <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
          
          {showEmailConfirmation && (
            <Alert className="mt-8 max-w-md mx-auto">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                You need to confirm your email address before logging in. 
                Please check your inbox (and spam folder) for a confirmation email.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AuthCallback;
