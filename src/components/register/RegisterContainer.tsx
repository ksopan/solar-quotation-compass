
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerRegistrationForm } from "@/components/register/CustomerRegistrationForm";
import { VendorRegistrationForm } from "@/components/register/VendorRegistrationForm";
import { AdminRegistrationForm } from "@/components/register/AdminRegistrationForm";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { customerSchema, vendorSchema, adminSchema, RegisterFormValues } from "@/components/register/registerSchemas";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const RegisterContainer = () => {
  const { register: authRegister, loginWithOAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"customer" | "vendor" | "admin">("customer");
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [showEmailInfoAlert, setShowEmailInfoAlert] = useState(false);

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
    setShowEmailInfoAlert(true);
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
      setShowEmailInfoAlert(false);
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
        {showEmailInfoAlert && (
          <Alert variant="default" className="mb-4 border-green-200 bg-green-50 text-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Check your email</AlertTitle>
            <AlertDescription>
              A confirmation email has been sent to your email address. Please check your inbox (and spam/junk folder) to confirm your account.
            </AlertDescription>
          </Alert>
        )}
        
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
          <SocialLoginButtons onOAuthRegister={handleOAuthRegister} />
        )}
      </CardContent>
      <CardFooter className="flex flex-col justify-center space-y-2">
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline">
            Login
          </Link>
        </p>
        <p className="text-xs text-center text-muted-foreground">
          After registering, please check your email (including spam/junk folder) to confirm your account.
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterContainer;
