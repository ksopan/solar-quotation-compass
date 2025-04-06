
import React from "react";
import { Sun } from "lucide-react";

export const SidebarBranding: React.FC = () => {
  return (
    <>
      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
        <Sun className="h-5 w-5 text-white" />
      </div>
      <span className="ml-2 font-bold">Solar Compass</span>
    </>
  );
};
