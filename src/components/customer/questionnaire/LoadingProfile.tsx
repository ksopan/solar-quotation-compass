
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

export const LoadingProfile: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-8 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 animate-spin" />
          <p>Loading your profile information...</p>
        </div>
      </CardContent>
    </Card>
  );
};
