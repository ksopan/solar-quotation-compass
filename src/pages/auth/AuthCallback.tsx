
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layouts/MainLayout";
import { User } from "@/contexts/auth/types";
import { transformUserData } from "@/contexts/auth/authUtils";
import { isProfileComplete } from "@/contexts/auth/authUtils";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Processing login...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setMessage("Completing authentication...");
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (!data.session) {
          throw new Error("No session found");
        }
        
        // Check for questionnaire ID in localStorage from OAuth flow
        const questionnaireId = localStorage.getItem("questionnaire_id");
        if (questionnaireId && data.session.user) {
          setMessage("Associating your questionnaire data...");
          try {
            // First check if the questionnaire exists and is not already associated
            const { data: questionnaireData, error: fetchError } = await supabase
              .from("property_questionnaires")
              .select("customer_id")
              .eq("id", questionnaireId)
              .single();
              
            if (fetchError) {
              console.error("Error fetching questionnaire:", fetchError);
            } else if (!questionnaireData.customer_id) {
              // Only update if the customer_id is null
              const { error: updateError } = await supabase
                .from("property_questionnaires")
                .update({ 
                  customer_id: data.session.user.id,
                  is_completed: true
                })
                .eq("id", questionnaireId);
                
              if (updateError) {
                console.error("Error associating questionnaire after OAuth:", updateError);
                toast.error("Failed to associate your questionnaire data");
              } else {
                console.log("Associated questionnaire with user after OAuth");
                toast.success("Your questionnaire has been saved to your account");
                localStorage.removeItem("questionnaire_id");
              }
            }
          } catch (err) {
            console.error("Error associating questionnaire after OAuth:", err);
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
        </div>
      </div>
    </MainLayout>
  );
};

export default AuthCallback;
