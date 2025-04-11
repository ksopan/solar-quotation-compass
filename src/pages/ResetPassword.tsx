
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePasswordReset } from "@/contexts/auth/hooks";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword } = usePasswordReset();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  useEffect(() => {
    // Verify that we have the necessary parameters in the URL
    const verifyPasswordResetRequest = async () => {
      setIsVerifying(true);
      
      try {
        console.log("Checking for recovery session...");
        
        // First check for error params in the URL - this happens when the link has expired
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (errorParam) {
          throw new Error(errorDescription || `Password reset error: ${errorParam}`);
        }
        
        // Check URL for fragments - this is how Supabase provides the tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        
        // Also check for errors in hash params
        const errorHash = hashParams.get("error");
        const errorDescHash = hashParams.get("error_description");
        
        if (errorHash) {
          throw new Error(errorDescHash || `Password reset error: ${errorHash}`);
        }
        
        // Log for debugging (don't log full tokens in production)
        console.log("URL hash params:", { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type,
          error: errorHash
        });
        
        // If we have tokens in the URL fragment, set the session
        if (accessToken && type === "recovery") {
          console.log("Found recovery token in URL, setting session");
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            throw new Error("Invalid or expired recovery link: " + error.message);
          }
          
          // Remove the URL fragments for security
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        // Check if we have a valid session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw new Error("Invalid or expired reset link. Please request a new one.");
        }
        
        if (!data.session) {
          throw new Error("No valid session found. Please request a new password reset link.");
        }
        
        // Good to go - we have a valid session
        setError(null);
        console.log("Valid recovery session confirmed");
      } catch (err: any) {
        console.error("Password reset verification error:", err);
        setError(err.message || "Failed to verify password reset request");
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPasswordResetRequest();
  }, [searchParams]);
  
  const onSubmit = async (values: ResetPasswordValues) => {
    setIsLoading(true);
    
    try {
      console.log("Updating password...");
      const success = await updatePassword(values.password);
      
      if (success) {
        // Sign out after password reset
        await supabase.auth.signOut();
        
        // Redirect to login page
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate("/login");
  };
  
  if (isVerifying) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[80vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>Verifying your reset link...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[80vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription className="text-destructive">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCancel} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4 pt-2">
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ResetPassword;
