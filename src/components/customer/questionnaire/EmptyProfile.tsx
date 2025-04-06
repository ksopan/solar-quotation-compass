
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyProfileProps {
  handleCreateProfile: () => void;
}

export const EmptyProfile: React.FC<EmptyProfileProps> = ({ handleCreateProfile }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Solar Profile</CardTitle>
        <CardDescription>You haven't created a solar profile yet</CardDescription>
      </CardHeader>
      <CardContent className="p-8 flex justify-center">
        <Button onClick={handleCreateProfile}>Create Your Solar Profile</Button>
      </CardContent>
    </Card>
  );
};
