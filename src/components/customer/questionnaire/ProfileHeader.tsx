
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import useQuestionnaireStore from "./hooks/useQuestionnaireStore";

interface ProfileHeaderProps {
  onEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onEdit }) => {
  const isEditing = useQuestionnaireStore(state => state.isEditing);
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling
    console.log("📝 Edit button clicked in ProfileHeader");
    
    // Call the edit handler
    onEdit();
    
    // Debug after clicking
    console.log("Edit button clicked - isEditing should change soon");
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
            variant="outline"
            type="button"
            className="z-10 bg-blue-50 hover:bg-blue-100"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>
    </CardHeader>
  );
};
