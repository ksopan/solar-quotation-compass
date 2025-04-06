
import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SharedFormFields } from "./SharedFormFields";
import { RegisterFormValues } from "./registerSchemas";

interface AdminFormProps {
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
}

export const AdminRegistrationForm: React.FC<AdminFormProps> = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <input type="hidden" {...register("role")} value="admin" />
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Full Name"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message as string}</p>
        )}
      </div>
      
      <SharedFormFields register={register} errors={errors} />
    </div>
  );
};
