
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const QuotationNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quotation Not Found</h1>
      <p>The quotation you're looking for doesn't exist or you don't have permission to view it.</p>
      <Button onClick={() => navigate("/")} className="mt-4">
        Return to Dashboard
      </Button>
    </div>
  );
};
