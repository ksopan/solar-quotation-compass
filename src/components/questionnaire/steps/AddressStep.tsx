import React from "react";
import { Button } from "@/components/ui/button";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";
import { InteractiveMap } from "@/components/maps/InteractiveMap";

interface AddressStepProps {
  address: string;
  latitude: number;
  longitude: number;
  onChange: (field: string, value: string | number) => void;
  onNext: () => void;
  onPrevious?: () => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({
  address,
  latitude,
  longitude,
  onChange,
  onNext,
  onPrevious
}) => {
  const handleAddressChange = (addr: string, lat: number, lng: number) => {
    onChange("address", addr);
    if (lat && lng) {
      onChange("latitude", lat);
      onChange("longitude", lng);
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    onChange("latitude", lat);
    onChange("longitude", lng);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Where is your property located?</h3>
      
      <AddressAutocomplete
        value={address}
        onChange={handleAddressChange}
        error={!address ? "Address is required" : ""}
      />

      {latitude && longitude && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Drag the pin to adjust the exact location of your property
          </p>
          <InteractiveMap
            lat={latitude}
            lng={longitude}
            onLocationChange={handleLocationChange}
          />
        </div>
      )}

      <div className="flex justify-between pt-4">
        {onPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            Back
          </Button>
        )}
        <Button 
          onClick={onNext} 
          disabled={!address || !latitude || !longitude}
          className="ml-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
