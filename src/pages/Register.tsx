import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layouts/MainLayout";
import { CustomerRegistrationForm } from "@/components/register/CustomerRegistrationForm";
import { VendorRegistrationForm } from "@/components/register/VendorRegistrationForm";
import { customerSchema, vendorSchema, adminSchema, RegisterFormValues } from "@/components/register/registerSchemas";
import { Home, Twitter } from "lucide-react";

const Register = () => {
  const { register: authRegister, loginWithOAuth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"customer" | "vendor" | "admin">("customer");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(
      activeTab === "customer" 
        ? customerSchema 
        : activeTab === "vendor" 
          ? vendorSchema 
          : adminSchema
    ),
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
    } catch (error) {
      // Error is already handled in the register function
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "customer" | "vendor" | "admin");
    reset({
      role: value as "customer" | "vendor" | "admin",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleOAuthRegister = (provider: "google" | "twitter") => {
    loginWithOAuth(provider);
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
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="vendor">Vendor</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TabsContent value="customer">
                  <CustomerRegistrationForm register={register} errors={errors} />
                </TabsContent>

                <TabsContent value="vendor">
                  <VendorRegistrationForm register={register} errors={errors} />
                </TabsContent>

                <TabsContent value="admin">
                  <div className="space-y-4">
                    <input type="hidden" {...register("role")} value="admin" />
                    
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block text-sm font-medium">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Full Name"
                        {...register("fullName")}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">
                          {activeTab === "admin" ? errors.fullName?.message as string : ""}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="name@example.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message as string}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium">
                          Password
                        </label>
                        <input
                          id="password"
                          type="password"
                          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="••••••••"
                          {...register("password")}
                        />
                        {errors.password && (
                          <p className="text-sm text-destructive">{errors.password.message as string}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium">
                          Confirm Password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="••••••••"
                          {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-destructive">{errors.confirmPassword.message as string}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Register"}
                </Button>
              </form>
            </Tabs>

            {activeTab === "customer" && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleOAuthRegister("google")}
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleOAuthRegister("twitter")}
                  >
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </Button>
                </div>
              </>
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
