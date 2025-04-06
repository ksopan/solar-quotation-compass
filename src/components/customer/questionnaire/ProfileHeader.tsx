
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface ProfileHeaderProps {
  isEditing: boolean;
  onEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  isEditing, 
  onEdit 
}) => {
  const handleEditClick = () => {
    console.log("📝 Edit button clicked in ProfileHeader");
    onEdit();
  };

  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Your Solar Profile</CardTitle>
          <CardDescription>Details about your solar requirements</CardDescription>
        </div>
        {!isEditing && (
          <Button onClick={handleEditClick} className="bg-primary hover:bg-primary/90">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>
    </CardHeader>
  );
};
