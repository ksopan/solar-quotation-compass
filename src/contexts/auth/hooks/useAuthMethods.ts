import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";
import { transformUserData, handleAuthError, isProfileComplete } from "../authUtils";

export const useAuthMethods = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const navigate = useNavigate();

  const login = async (email: string, password: string, expectedRole: UserRole) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("No user returned.");

      // Check if email is confirmed for password auth
      if (!data.user.email_confirmed_at && data.user.app_metadata.provider === 'email') {
        await supabase.auth.signOut();
        throw new Error("Please confirm your email before logging in.");
      }

      // Check if user role matches expected role
      const userRole = data.user.user_metadata?.role;
      if (userRole !== expectedRole) {
        await supabase.auth.signOut();
        throw new Error(`Invalid role. Please log in as a ${expectedRole}.`);
      }

      toast.success("Logged in successfully!");
      
      // Transform data
      const userData = transformUserData(data.user);
      setUser(userData);
      
      // Redirect based on completion and role
      if (!isProfileComplete(userData)) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      handleAuthError(err, "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = async (provider: "google" | "twitter") => {
    try {
      // Only allow customers to use OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      // The redirect happens automatically, this runs after return
    } catch (error) {
      handleAuthError(error, "Social login failed. Please try again.");
    }
  };

  const register = async (userData: Partial<User> & { password: string; role: UserRole }) => {
    setLoading(true);
    try {
      // Prepare metadata based on role
      const userMetadata: Record<string, any> = {
        role: userData.role
      };

      // Add appropriate fields based on role
      if (userData.role === "customer" || userData.role === "vendor") {
        userMetadata.firstName = userData.firstName || "";
        userMetadata.lastName = userData.lastName || "";
        userMetadata.address = userData.address || "";
        userMetadata.phone = userData.phone || "";
      }
      
      // Add company name for vendors
      if (userData.role === "vendor") {
        userMetadata.companyName = userData.companyName || "";
      }

      // Admin fields
      if (userData.role === "admin") {
        userMetadata.fullName = userData.fullName || "";
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Email/password signup (always requires email confirmation)
        toast.success("Registration successful!", {
          description: "Please check your email to confirm your account before logging in."
        });
        
        // Sign out immediately for email/password registration
        await supabase.auth.signOut();
        setUser(null);
        
        navigate("/login");
      }
    } catch (err) {
      handleAuthError(err, "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      toast.error("Error logging out.");
      console.error(err);
    }
  };

  return {
    login,
    loginWithOAuth,
    register,
    updateProfile,
    logout
  };
};
