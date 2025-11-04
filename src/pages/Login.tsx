import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Home } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const { loginWithOAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    // Show success message if email was verified
    if (searchParams.get("verified") === "success") {
      setShowSuccessBanner(true);
      toast.success("Email verified successfully!", {
        description: "You can now log in with your credentials."
      });
      searchParams.delete("verified");
      setSearchParams(searchParams, { replace: true });
      setTimeout(() => setShowSuccessBanner(false), 5000);
    }
    
    // Show error messages
    const error = searchParams.get("error");
    if (error) {
      if (error === "invalid_token") {
        toast.error("Invalid verification link", {
          description: "The verification link is invalid or has already been used."
        });
      } else if (error === "token_expired") {
        toast.error("Verification link expired", {
          description: "The verification link has expired. Please register again or request a new link."
        });
      } else if (error === "verification_failed") {
        toast.error("Verification failed", {
          description: "Failed to verify your email. Please try again or contact support."
        });
      }
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Handle social login
  const handleOAuthLogin = (provider: "google" | "twitter") => {
    loginWithOAuth(provider);
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md space-y-4">
          {/* Success Banner */}
          {showSuccessBanner && (
            <Alert className="border-green-500 bg-green-50">
              <AlertDescription className="text-green-800">
                ✓ Email verified successfully! You can now log in.
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/")}
                aria-label="Home"
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onRoleChange={setSelectedRole} />

            {selectedRole === "customer" && (
              <SocialLoginButtons 
                onOAuthLogin={handleOAuthLogin} 
                selectedRole={selectedRole} 
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
