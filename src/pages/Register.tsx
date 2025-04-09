
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layouts/MainLayout";
import { CustomerRegistrationForm } from "@/components/register/CustomerRegistrationForm";
import { VendorRegistrationForm } from "@/components/register/VendorRegistrationForm";
import { AdminRegistrationForm } from "@/components/register/AdminRegistrationForm";
import { customerSchema, vendorSchema, adminSchema, RegisterFormValues } from "@/components/register/registerSchemas";
import { Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const { register: authRegister, loginWithOAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"customer" | "vendor" | "admin">("customer");
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);

  // Get pre-filled values from location state
  const preFilledValues = location.state || {};

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
      email: preFilledValues.email || "",
      firstName: preFilledValues.firstName || "",
      lastName: preFilledValues.lastName || "",
      password: "",
      confirmPassword: ""
    }
  });

  // Check for a questionnaire ID in session storage on component mount
  useEffect(() => {
    const storedQuestionnaireId = sessionStorage.getItem("questionnaire_id");
    if (storedQuestionnaireId) {
      setQuestionnaireId(storedQuestionnaireId);
      
      // If no state was passed via navigation, fetch the questionnaire data to pre-fill the form
      if (!preFilledValues.email) {
        const fetchQuestionnaireData = async () => {
          try {
            const { data, error } = await supabase
              .from("property_questionnaires")
              .select("*")
              .eq("id", storedQuestionnaireId)
              .single();
              
            if (error) {
              console.error("Error fetching questionnaire data:", error);
              return;
            }
            
            if (data) {
              // Pre-fill the registration form with questionnaire data
              setValue("email", data.email);
              setValue("firstName", data.first_name);
              setValue("lastName", data.last_name);
              
              // Set active tab to customer since questionnaire is for customers
              setActiveTab("customer");
            }
          } catch (error) {
            console.error("Error in fetchQuestionnaireData:", error);
          }
        };
        
        fetchQuestionnaireData();
      }
    }
  }, [setValue, preFilledValues]);

  // Apply pre-filled values from location state when component mounts
  useEffect(() => {
    if (preFilledValues.email) {
      setValue("email", preFilledValues.email);
    }
    if (preFilledValues.firstName) {
      setValue("firstName", preFilledValues.firstName);
    }
    if (preFilledValues.lastName) {
      setValue("lastName", preFilledValues.lastName);
    }
    if (preFilledValues.email) {
      setActiveTab("customer"); // Force customer tab for questionnaire completions
    }
  }, [setValue, preFilledValues]);

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
      
      // If there's a questionnaire ID, association will be handled in the auth hook after registration
      if (questionnaireId) {
        // This will be handled in the auth hook after successful registration
        sessionStorage.removeItem("questionnaire_id");
      }
    } catch (error) {
      // Error is already handled in the register function
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    // If we're coming from a questionnaire, don't allow changing the tab
    if (questionnaireId || preFilledValues.email) {
      return;
    }
    
    setActiveTab(value as "customer" | "vendor" | "admin");
    reset({
      role: value as "customer" | "vendor" | "admin",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleOAuthRegister = (provider: "google" | "twitter") => {
    // Store questionnaire ID in localStorage before OAuth flow
    if (questionnaireId) {
      localStorage.setItem("questionnaire_id", questionnaireId);
    }
    
    // Store questionnaire data in localStorage for OAuth flow
    const questionnaireDataStr = sessionStorage.getItem("questionnaire_data");
    if (questionnaireDataStr) {
      localStorage.setItem("questionnaire_data", questionnaireDataStr);
    }
    
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
              {questionnaireId 
                ? "Complete your registration to view your solar quotes" 
                : "Create an account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="customer" 
              value={activeTab} 
              onValueChange={handleTabChange}
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger 
                  value="customer" 
                  disabled={!!questionnaireId || !!preFilledValues.email}
                >
                  Customer
                </TabsTrigger>
                <TabsTrigger 
                  value="vendor" 
                  disabled={!!questionnaireId || !!preFilledValues.email}
                >
                  Vendor
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  disabled={!!questionnaireId || !!preFilledValues.email}
                >
                  Admin
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TabsContent value="customer">
                  <CustomerRegistrationForm register={register} errors={errors} />
                </TabsContent>

                <TabsContent value="vendor">
                  <VendorRegistrationForm register={register} errors={errors} />
                </TabsContent>

                <TabsContent value="admin">
                  <AdminRegistrationForm register={register} errors={errors} />
                </TabsContent>

                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Register"}
                </Button>
              </form>
            </Tabs>

            {activeTab === "customer" && (
              <div>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
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
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 3.93 3.93 0 0 1-1.1.17 3.89 3.89 0 0 1-.77-.07 4.1 4.1 0 0 0 3.83 2.84A8.22 8.22 0 0 1 3 18.34a7.93 7.93 0 0 1-1-.06 11.57 11.57 0 0 0 6.29 1.85A11.59 11.59 0 0 0 20 8.47v-.53a8.43 8.43 0 0 0 2-2.14z" fill="currentColor"></path></svg>
                    Twitter
                  </Button>
                </div>
              </div>
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
