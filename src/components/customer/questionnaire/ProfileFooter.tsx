
import React from "react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ProfileFooterProps {
  isEditing: boolean;
  isSaving: boolean;
  showSubmitButton: boolean;
  questionnaire: any;
  handleCancel: () => void;
  handleSave: () => void;
  handleSubmitProfile: () => void;
}

export const ProfileFooter: React.FC<ProfileFooterProps> = ({
  isEditing,
  isSaving,
  showSubmitButton,
  questionnaire,
  handleCancel,
  handleSave,
  handleSubmitProfile
}) => {
  if (isEditing) {
    return (
      <CardFooter className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    );
  } 
  
  if (showSubmitButton && questionnaire && !questionnaire.is_completed) {
    return (
      <CardFooter className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" />
              Submit Profile
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit your solar profile?</AlertDialogTitle>
              <AlertDialogDescription>
                Your profile will be submitted to receive solar installation quotes. Are you ready to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmitProfile}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    );
  }
  
  return null;
};
