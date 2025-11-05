
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { transformUserData } from "../authUtils";

export const useAuthSetup = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      // Use setTimeout to avoid blocking the auth state change callback
      setTimeout(async () => {
        try {
          if (session?.user) {
            const userData = await transformUserData(session.user);
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error transforming user data:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }, 0);
    });

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        if (session?.user) {
          const userData = await transformUserData(session.user);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, setUser, loading, setLoading };
};
