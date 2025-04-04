
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/layouts/MainLayout";

// Base schema with common fields
const baseSchema = {
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
};

// Customer specific schema
const customerSchema = z.object({
  ...baseSchema,
  role: z.literal("customer"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Vendor specific schema
const vendorSchema = z.object({
  ...baseSchema,
  role: z.literal("vendor"),
  companyName: z.string().min(1, "Company name is required"),
  firstName: z.string().min(1, "Owner's first name is required"),
  lastName: z.string().min(1, "Owner's last name is required"),
  address: z.string().min(1, "Company address is required"),
  phone: z.string().min(1, "Contact phone is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Define type for the union schema
type RegisterFormValues = z.infer<typeof customerSchema> | z.infer<typeof vendorSchema>;

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"customer" | "vendor">("customer");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
            <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        {...register("firstName")}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        {...register("lastName")}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message as string}</p>
                      )}
                    </div>
                  </div>

                  <input type="hidden" {...register("role")} value="customer" />

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Solar Street, City"
                      {...register("address")}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">{errors.address.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="(555) 123-4567"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message as string}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="vendor">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Solar Solutions Inc."
                      {...register(activeTab === "vendor" ? "companyName" : undefined as any)}
                    />
                    {activeTab === "vendor" && errors.companyName && (
                      <p className="text-sm text-destructive">{(errors as any).companyName?.message}</p>
                    )}
                  </div>

                  <input type="hidden" {...register("role")} value="vendor" />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Owner's First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Jane"
                        {...register("firstName")}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">{errors.firstName.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Owner's Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Smith"
                        {...register("lastName")}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">{errors.lastName.message as string}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="address">Company Address</Label>
                    <Input
                      id="address"
                      placeholder="456 Business Ave, City"
                      {...register("address")}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">{errors.address.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input
                      id="phone"
                      placeholder="(555) 987-6543"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message as string}</p>
                    )}
                  </div>
                </TabsContent>

                {/* Common fields for both tabs */}
                <div className="space-y-2 mt-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message as string}</p>
                    )}
                  </div>
                </div>

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
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={handleGoogleRegister}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                  Register with Google
                </Button>
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
