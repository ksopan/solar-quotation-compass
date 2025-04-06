
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { handleAuthError, transformUserData } from "../authUtils";

export const useProfileManagement = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      // Create metadata update object
      const metadataUpdates: Record<string, any> = {};
      
      // Only include fields that are provided
      if (userData.fullName !== undefined) metadataUpdates.fullName = userData.fullName;
      if (userData.firstName !== undefined) metadataUpdates.firstName = userData.firstName;
      if (userData.lastName !== undefined) metadataUpdates.lastName = userData.lastName;
      if (userData.companyName !== undefined) metadataUpdates.companyName = userData.companyName;
      if (userData.address !== undefined) metadataUpdates.address = userData.address;
      if (userData.phone !== undefined) metadataUpdates.phone = userData.phone;
      
      // Update email if provided (separate call)
      if (userData.email && userData.email !== userData.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: userData.email
        });
        
        if (emailError) throw new Error(`Failed to update email: ${emailError.message}`);
      }
      
      // Update metadata
      const { data, error } = await supabase.auth.updateUser({
        data: metadataUpdates
      });
      
      if (error) throw new Error(error.message);
      
      // Update local state with new user data
      if (data.user) {
        const updatedUser = transformUserData(data.user);
        setUser(updatedUser);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      handleAuthError(err, "Profile update failed");
      throw err;
    }
  };

  return { updateProfile };
};
