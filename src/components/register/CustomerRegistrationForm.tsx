
import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SharedFormFields } from "./SharedFormFields";

interface CustomerFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export const CustomerRegistrationForm: React.FC<CustomerFormProps> = ({ register, errors }) => {
  return (
    <>
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

      <SharedFormFields register={register} errors={errors} />
    </>
  );
};

