
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export type UserRole = "customer" | "vendor" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginWithOAuth: (provider: "google" | "twitter") => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string, role: UserRole }) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isProfileComplete: () => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Transform Supabase user data to our User interface
  const transformUserData = (supabaseUser: any): User => {
    const metadata = supabaseUser.user_metadata || {};
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      role: metadata.role || "customer",
      fullName: metadata.fullName,
      firstName: metadata.firstName,
      lastName: metadata.lastName,
      companyName: metadata.companyName,
      address: metadata.address,
      phone: metadata.phone
    };
  };

  // Check if user profile is complete based on their role
  const isProfileComplete = () => {
    if (!user) return false;

    const { role, fullName, firstName, lastName, address, phone, companyName } = user;

    if (role === "customer") {
      return !!(firstName && lastName && address && phone);
    } else if (role === "vendor") {
      return !!(firstName && lastName && companyName && address && phone);
    } else if (role === "admin") {
      return !!(fullName || (firstName && lastName));
    }

    return false;
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (session?.user) {
        const userData = transformUserData(session.user);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = transformUserData(session.user);
        setUser(userData);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      if (!isProfileComplete()) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
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
      toast.error("Social login failed. Please try again.");
      console.error("OAuth error:", error);
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
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length > 0) {
          // For email/password signups
          toast.success("Registration successful!", {
            description: "Please check your email to confirm your account before logging in."
          });
          
          // Sign out immediately for email/password registration
          await supabase.auth.signOut();
          setUser(null);
          
          navigate("/login");
        } else {
          // OAuth signup (unlikely to hit this case but included for completeness)
          toast.success("Registration successful!", {
            description: "You're now signed up and logged in."
          });
          
          // Set user in state for OAuth signups
          const newUser = transformUserData(data.user);
          setUser(newUser);
          
          if (!isProfileComplete()) {
            navigate("/complete-profile");
          } else {
            navigate("/");
          }
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
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
      if (userData.email && userData.email !== user?.email) {
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
      toast.error(err instanceof Error ? err.message : "Profile update failed");
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithOAuth,
      logout, 
      register, 
      updateProfile,
      isProfileComplete
    }}>
      {children}
    </AuthContext.Provider>
  );
};
