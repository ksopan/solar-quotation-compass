
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
      console.log("🔵 [useAuthSetup] Auth state changed:", event, session?.user?.id);
      
      // Use setTimeout to avoid blocking the auth state change callback
      setTimeout(async () => {
        try {
          if (session?.user) {
            // Check if custom email is verified (our Resend flow)
            const customVerified = session.user.user_metadata?.custom_email_verified;
            
            if (!customVerified) {
              console.log("⚠️ [useAuthSetup] Custom email not verified, not setting user");
              setUser(null);
              setLoading(false);
              return;
            }
            
            const userData = await transformUserData(session.user);
            console.log("✅ [useAuthSetup] User authenticated and custom email verified");
            setUser(userData);
          } else {
            console.log("🔵 [useAuthSetup] No session, clearing user");
            setUser(null);
          }
        } catch (error) {
          console.error("❌ [useAuthSetup] Error transforming user data:", error);
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
          // Check if custom email is verified (our Resend flow)
          const customVerified = session.user.user_metadata?.custom_email_verified;
          
          if (!customVerified) {
            console.log("⚠️ [useAuthSetup] Initial session: Custom email not verified");
            setUser(null);
            setLoading(false);
            return;
          }
          
          const userData = await transformUserData(session.user);
          console.log("✅ [useAuthSetup] Initial session: User authenticated with verified custom email");
          setUser(userData);
        }
      } catch (error) {
        console.error("❌ [useAuthSetup] Error getting initial session:", error);
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
