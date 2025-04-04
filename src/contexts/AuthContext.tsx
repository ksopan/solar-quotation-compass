
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export type UserRole = "customer" | "vendor" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
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
  logout: () => void;
  register: (userData: Partial<User> & { password: string, role: UserRole }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth status on load and listen for changes
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        const userData = session.user.user_metadata as any;
        const userWithRole: User = {
          id: session.user.id,
          email: session.user.email || "",
          role: userData.role as UserRole,
          firstName: userData.firstName,
          lastName: userData.lastName,
          companyName: userData.companyName,
          address: userData.address,
          phone: userData.phone
        };
        setUser(userWithRole);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        const userData = session.user.user_metadata as any;
        const userWithRole: User = {
          id: session.user.id,
          email: session.user.email || "",
          role: userData.role as UserRole,
          firstName: userData.firstName,
          lastName: userData.lastName,
          companyName: userData.companyName,
          address: userData.address,
          phone: userData.phone
        };
        setUser(userWithRole);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Check if user role matches
        const userRole = data.user.user_metadata.role;
        if (userRole !== role) {
          // Sign out the user if role doesn't match
          await supabase.auth.signOut();
          throw new Error(`Invalid user role. Please sign in as a ${role}.`);
        }

        toast.success("Logged in successfully!");
        navigate("/");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string, role: UserRole }) => {
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

      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password,
        options: {
          data: userMetadata
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        toast.success("Registration successful!", {
          description: "You're now signed up. Please confirm your email if required."
        });
        navigate("/");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      toast.success("Logged out successfully!", {
        description: "See you soon!"
      });
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
