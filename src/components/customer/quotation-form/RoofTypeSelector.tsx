
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoofTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RoofTypeSelector: React.FC<RoofTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="roofType">Roof Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select roof type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="flat">Flat</SelectItem>
          <SelectItem value="sloped">Sloped</SelectItem>
          <SelectItem value="metal">Metal</SelectItem>
          <SelectItem value="tile">Tile</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
