
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

export const useLogout = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      console.log("Starting logout process");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during logout:", error);
        throw error;
      }
      
      console.log("Logout successful, clearing user state");
      setUser(null);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error("Error logging out.");
    }
  };

  return { logout };
};
