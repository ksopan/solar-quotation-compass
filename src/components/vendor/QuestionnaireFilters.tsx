
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";

export const QuestionnaireFilters: React.FC = () => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-1" /> Filter
      </Button>
      <Button variant="outline" size="sm">
        <Search className="h-4 w-4 mr-1" /> Search
      </Button>
    </div>
  );
};
