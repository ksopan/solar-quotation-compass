
import React, { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SharedFormFields } from "./SharedFormFields";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";

interface CustomerFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue?: UseFormSetValue<any>;
}

export const CustomerRegistrationForm: React.FC<CustomerFormProps> = ({ register, errors, setValue }) => {
  const [address, setAddress] = useState("");
  
  const handleAddressChange = (newAddress: string, lat: number, lng: number) => {
    setAddress(newAddress);
    if (setValue) {
      setValue("address", newAddress);
    }
  };

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

      <div className="mt-4">
        <AddressAutocomplete
          value={address}
          onChange={handleAddressChange}
          error={errors.address?.message as string}
        />
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
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

