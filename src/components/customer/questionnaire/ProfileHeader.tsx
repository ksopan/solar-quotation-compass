
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  isEditing: boolean;
  onEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  isEditing, 
  onEdit 
}) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Your Solar Profile</CardTitle>
          <CardDescription>Details about your solar requirements</CardDescription>
        </div>
        {!isEditing && (
          <Button onClick={onEdit}>Edit Profile</Button>
        )}
      </div>
    </CardHeader>
  );
};
