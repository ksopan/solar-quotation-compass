
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);

  const sendPasswordResetEmail = async (email: string) => {
    setLoading(true);
    try {
      // Use the current origin (whether local or deployed) for the redirect
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log("Setting password reset redirect to:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) throw error;

      toast.success("Password reset email sent", {
        description: "Please check your email for the reset link"
      });
      return true;
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message || "Please try again later"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      return true;
    } catch (error: any) {
      toast.error("Failed to update password", {
        description: error.message || "Please try again"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendPasswordResetEmail,
    updatePassword,
    loading
  };
};
