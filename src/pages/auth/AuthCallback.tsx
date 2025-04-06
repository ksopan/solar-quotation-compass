
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isProfileComplete } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get session from URL
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setError(error.message);
        toast.error("Authentication failed");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }
      
      if (data.session) {
        // Update user metadata with role=customer if not set
        // Since only customers can use OAuth
        const user = data.session.user;
        const metadata = user.user_metadata || {};
        
        if (!metadata.role) {
          await supabase.auth.updateUser({
            data: { role: "customer" }
          });
        }
        
        // Check if profile needs completion
        const redirectTo = isProfileComplete() ? "/" : "/complete-profile";
        toast.success("Successfully authenticated!");
        navigate(redirectTo);
      } else {
        setError("No session found");
        toast.error("Authentication failed");
        setTimeout(() => navigate("/login"), 3000);
      }
    };
    
    handleAuthCallback();
  }, [navigate, isProfileComplete]);
  
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {error ? (
          <div className="text-destructive">
            <h2 className="text-xl font-semibold">Authentication Error</h2>
            <p>{error}</p>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Completing authentication...</h2>
            <p className="text-muted-foreground">Please wait while we validate your credentials.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AuthCallback;
