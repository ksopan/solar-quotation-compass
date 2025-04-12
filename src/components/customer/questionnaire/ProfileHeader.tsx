
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface ProfileHeaderProps {
  isEditing: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ isEditing }) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling
    console.log("📝 Edit button clicked in ProfileHeader");
    
    // Use direct dispatch to QuestionnaireProfileContent via a custom event
    const event = new CustomEvent('questionnaire:edit', { bubbles: true });
    document.dispatchEvent(event);
  };

  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Your Solar Profile</CardTitle>
          <CardDescription>Details about your solar requirements</CardDescription>
        </div>
        {!isEditing && (
          <Button 
            onClick={handleEditClick} 
            variant="default"
            type="button"
            className="z-10"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>
    </CardHeader>
  );
};
