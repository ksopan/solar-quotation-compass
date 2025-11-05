
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
  isNewProfile?: boolean;  // Flag for newly created profiles
}

export const ProfileFooter: React.FC<ProfileFooterProps> = ({
  isEditing,
  isSaving,
  showSubmitButton,
  questionnaire,
  handleCancel,
  handleSave,
  handleSubmitProfile,
  isNewProfile = false
}) => {
  const canSubmit = questionnaire?.status === 'draft' || !questionnaire?.status;
  
  if (isEditing) {
    // For new profiles (from Register route), show Save as Draft OR Submit options
    if (isNewProfile && !questionnaire) {
      return (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                await handleSave();
                // After save, stay on page in edit mode
              }} 
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save as Draft"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
                  <Check className="mr-2 h-4 w-4" />
                  Submit to Marketplace
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit to marketplace?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your solar profile will be submitted to vendors who will review it and provide quotes within 14 days.
                    <strong className="block mt-2">You can still edit your profile after saving as draft, but not after submission.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={async () => {
                      await handleSave();
                      await handleSubmitProfile();
                    }}
                  >
                    Submit Now
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      );
    }
    
    // For existing profiles, regular save/cancel
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
  
  if (showSubmitButton && questionnaire && !questionnaire.is_completed && canSubmit) {
    return (
      <CardFooter className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" />
              Submit Profile to Vendors
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit your solar profile?</AlertDialogTitle>
              <AlertDialogDescription>
                Your profile will be submitted to vendors who will have 14 days to review it and provide quotes.
                <strong className="block mt-2">Important: You won't be able to edit your profile after submission.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmitProfile}>Submit Profile</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    );
  }
  
  if (questionnaire?.status && questionnaire.status !== 'draft') {
    return (
      <CardFooter className="flex justify-end">
        <div className="text-sm text-muted-foreground">
          {questionnaire.status === 'submitted' && 'Profile submitted - Waiting for vendor proposals'}
          {questionnaire.status === 'proposals_received' && 'Proposals received! Check your dashboard'}
          {questionnaire.status === 'under_review' && 'Vendors are reviewing your profile'}
          {questionnaire.status === 'completed' && 'Profile completed'}
        </div>
      </CardFooter>
    );
  }
  
  return null;
};
