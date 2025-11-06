import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layouts/MainLayout";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !userId) {
        setStatus("error");
        setErrorMessage("Invalid verification link. Missing token or user ID.");
        return;
      }

      try {
        // Call the edge function to verify
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-registration?token=${token}&userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok || response.redirected) {
          // Verification successful
          setStatus("success");
        } else {
          // Check for error in URL after redirect
          const errorParam = new URL(response.url || window.location.href).searchParams.get("error");
          if (errorParam) {
            throw new Error(errorParam);
          }
          setStatus("success"); // Assume success if no explicit error
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus("error");
        
        if (error.message.includes("token_expired")) {
          setErrorMessage("This verification link has expired. Please request a new verification email.");
        } else if (error.message.includes("invalid_token")) {
          setErrorMessage("This verification link is invalid or has already been used.");
        } else {
          setErrorMessage("Unable to verify your email. Please try again or contact support.");
        }
      }
    };

    verifyEmail();
  }, [token, userId]);

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          {status === "verifying" && (
            <>
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Verifying Your Email</h1>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Email Verified Successfully!
                </h1>
                <p className="text-muted-foreground">
                  Your email has been verified. You can now log in to your account.
                </p>
              </div>
              <Button
                onClick={() => navigate("/login?verified=true")}
                className="w-full"
                size="lg"
              >
                Continue to Login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Verification Failed
                </h1>
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full"
                  size="lg"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
