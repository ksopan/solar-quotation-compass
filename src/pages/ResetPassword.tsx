
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
        // When a user clicks the reset link in their email, Supabase adds the token to the URL
        // The SDK will automatically extract and use these tokens
        
        // Just check if we have a basic user session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw new Error("Invalid or expired reset link. Please request a new one.");
        }
        
        if (!data.session) {
          throw new Error("No valid session found. Please request a new password reset link.");
        }
        
        // Good to go - the URL contains valid tokens
        setError(null);
      } catch (err: any) {
        console.error("Password reset verification error:", err);
        setError(err.message || "Failed to verify password reset request");
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPasswordResetRequest();
  }, []);
  
  const onSubmit = async (values: ResetPasswordValues) => {
    setIsLoading(true);
    
    try {
      // We only need the new password, Supabase will handle the rest based on the auth tokens
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Password updated successfully", {
        description: "You can now log in with your new password",
      });
      
      // Sign out after password reset
      await supabase.auth.signOut();
      
      // Redirect to login page
      navigate("/login");
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error("Failed to reset password", {
        description: err.message || "Please try again or request a new reset link",
      });
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
