
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface ProfileHeaderProps {
  isEditing: boolean;
  questionnaire?: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ isEditing, questionnaire }) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default form behavior
    e.stopPropagation(); // Stop event bubbling
    console.log("📝 Edit button clicked in ProfileHeader");
    
    // Use direct dispatch to QuestionnaireProfileContent via a custom event
    const event = new CustomEvent('questionnaire:edit', { bubbles: true });
    document.dispatchEvent(event);
  };

  const canEdit = questionnaire?.status === 'draft' || !questionnaire?.status;

  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div>
            <CardTitle>Your Solar Profile</CardTitle>
            <CardDescription>Details about your solar requirements</CardDescription>
          </div>
          {questionnaire?.status && <StatusBadge status={questionnaire.status} />}
        </div>
        {!isEditing && canEdit && (
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
        {!canEdit && questionnaire && (
          <div className="text-sm text-muted-foreground">
            Profile locked
          </div>
        )}
      </div>
    </CardHeader>
  );
};
