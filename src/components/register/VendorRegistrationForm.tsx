
import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SharedFormFields } from "./SharedFormFields";

interface VendorFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export const VendorRegistrationForm: React.FC<VendorFormProps> = ({ register, errors }) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          placeholder="Solar Solutions Inc."
          {...register("companyName")}
        />
        {errors.companyName && (
          <p className="text-sm text-destructive">{errors.companyName.message as string}</p>
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

      <SharedFormFields register={register} errors={errors} />
    </>
  );
};

