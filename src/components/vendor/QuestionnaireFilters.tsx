
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";

interface QuestionnaireFiltersProps {
  className?: string;
}

export const QuestionnaireFilters: React.FC<QuestionnaireFiltersProps> = ({ className }) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-1" /> Filter
      </Button>
      <Button variant="outline" size="sm">
        <Search className="h-4 w-4 mr-1" /> Search
      </Button>
    </div>
  );
};
