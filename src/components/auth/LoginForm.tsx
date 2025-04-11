
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/contexts/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "vendor", "admin"] as const)
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onRoleChange: (role: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onRoleChange }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "customer"
    }
  });

  const handleRoleChange = (value: string) => {
    setValue("role", value as "customer" | "vendor" | "admin");
    onRoleChange(value);
  };

  const handlePasswordReset = async () => {
    const email = watch("email");
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    
    try {
      setIsResetLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Password reset email sent", {
        description: "Please check your email for the reset link"
      });
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.role as UserRole);
    } catch (error) {
      // Error is already handled in the login function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <div className="text-right">
          <Button 
            variant="link" 
            className="px-0 text-sm" 
            type="button"
            onClick={handlePasswordReset}
            disabled={isResetLoading}
          >
            {isResetLoading ? "Sending..." : "Forgot password?"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>I am a:</Label>
        <RadioGroup
          defaultValue="customer"
          onValueChange={handleRoleChange}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="customer" id="customer" />
            <Label htmlFor="customer">Customer</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vendor" id="vendor" />
            <Label htmlFor="vendor">Vendor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="admin" id="admin" />
            <Label htmlFor="admin">Admin</Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};
