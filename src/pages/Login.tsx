
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Home } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const { loginWithOAuth } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showConfirmationAlert] = useState(() => {
    // Check if there's a URL parameter indicating registration complete
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("registered") === "true";
  });

  // Handle social login
  const handleOAuthLogin = (provider: "google" | "twitter") => {
    loginWithOAuth(provider);
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md">
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
            {showConfirmationAlert && (
              <Alert variant="default" className="mb-4 border-green-200 bg-green-50 text-green-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription>
                  Please confirm your email address before logging in. Check your inbox and spam/junk folders.
                </AlertDescription>
              </Alert>
            )}
            
            <LoginForm onRoleChange={setSelectedRole} />

            {selectedRole === "customer" && (
              <SocialLoginButtons 
                onOAuthLogin={handleOAuthLogin} 
                selectedRole={selectedRole} 
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-col justify-center space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary underline">
                Register
              </Link>
            </p>
            <p className="text-xs text-center text-muted-foreground">
              If you've registered but haven't received a confirmation email, please check your spam/junk folder.
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Login;
