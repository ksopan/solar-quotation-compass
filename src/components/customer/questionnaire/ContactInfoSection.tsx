
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QuestionnaireData } from "@/hooks/useQuestionnaire";

interface ContactInfoSectionProps {
  isEditing: boolean;
  data: Partial<QuestionnaireData> | null;
  handleChange: (field: keyof QuestionnaireData, value: any) => void;
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ 
  isEditing, 
  data, 
  handleChange 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label>First Name</Label>
          {isEditing ? (
            <Input 
              value={data?.first_name || ""} 
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
          ) : (
            <div className="mt-1 text-lg">{data?.first_name}</div>
          )}
        </div>
        
        <div>
          <Label>Last Name</Label>
          {isEditing ? (
            <Input 
              value={data?.last_name || ""} 
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
          ) : (
            <div className="mt-1 text-lg">{data?.last_name}</div>
          )}
        </div>
      </div>
      
      <div>
        <Label>Email</Label>
        {isEditing ? (
          <Input 
            type="email"
            value={data?.email || ""} 
            onChange={(e) => handleChange("email", e.target.value)}
          />
        ) : (
          <div className="mt-1 text-lg">{data?.email}</div>
        )}
      </div>
    </div>
  );
};
