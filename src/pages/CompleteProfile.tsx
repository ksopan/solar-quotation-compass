
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layouts/MainLayout";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const CompleteProfile = () => {
  const { user, updateProfile, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already complete or not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (isProfileComplete()) {
      navigate("/");
    }
  }, [user, navigate, isProfileComplete]);

  if (!user) return null;

  // Create schema based on user role
  const getProfileSchema = (role: UserRole) => {
    const baseSchema = {
      address: z.string().min(1, "Address is required"),
      phone: z.string().min(1, "Phone number is required"),
    };

    if (role === "customer") {
      return z.object({
        ...baseSchema,
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
      });
    } else if (role === "vendor") {
      return z.object({
        ...baseSchema,
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        companyName: z.string().min(1, "Company name is required"),
      });
    } else {
      return z.object({
        fullName: z.string().min(1, "Full name is required"),
      });
    }
  };

  const profileSchema = getProfileSchema(user.role);
  type ProfileFormValues = z.infer<typeof profileSchema>;

  // Initialize form with defaults from user object
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      companyName: user.companyName || "",
      address: user.address || "",
      phone: user.phone || "",
      fullName: user.fullName || "",
    } as any,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data);
      toast.success("Profile completed successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-lg py-10">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              We need a few more details before you can continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Render fields based on user role */}
                {user.role === "admin" ? (
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {user.role === "vendor" && (
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City, State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button type="submit" className="w-full">
                  Complete Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CompleteProfile;
