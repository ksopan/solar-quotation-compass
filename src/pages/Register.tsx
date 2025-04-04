
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layouts/MainLayout";
import { CustomerRegistrationForm } from "@/components/register/CustomerRegistrationForm";
import { VendorRegistrationForm } from "@/components/register/VendorRegistrationForm";
import { SocialLogin } from "@/components/register/SocialLogin";
import { customerSchema, vendorSchema, RegisterFormValues } from "@/components/register/registerSchemas";
import { Home } from "lucide-react";

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"customer" | "vendor">("customer");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(activeTab === "customer" ? customerSchema : vendorSchema),
    defaultValues: {
      role: "customer" as const,
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registrationData } = data;
      // Ensure password is passed as string and is required
      await authRegister({
        ...registrationData,
        password: registrationData.password,
        role: registrationData.role
      });
      navigate("/");
    } catch (error) {
      // Error is already handled in the register function
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "customer" | "vendor");
    reset({
      role: value as "customer" | "vendor",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleGoogleRegister = () => {
    toast.info("Google registration is for customers only. Redirecting to Google...", {
      description: "This is a demo feature."
    });
    // In a real app, this would redirect to Google OAuth
    setTimeout(() => {
      toast.error("Google authentication is not implemented in this demo", {
        description: "This would connect to a real OAuth provider in production."
      });
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center py-8">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Register</CardTitle>
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
              Create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="vendor">Vendor</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TabsContent value="customer">
                  <CustomerRegistrationForm register={register} errors={errors} />
                </TabsContent>

                <TabsContent value="vendor">
                  <VendorRegistrationForm register={register} errors={errors} />
                </TabsContent>

                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Register"}
                </Button>
              </form>
            </Tabs>

            {activeTab === "customer" && (
              <SocialLogin onGoogleRegister={handleGoogleRegister} />
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Register;
