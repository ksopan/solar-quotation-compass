
import React from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";

const QuotationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Quotation Details</h1>
        <p>Viewing quotation ID: {id}</p>
        {/* Quotation details will be implemented here */}
      </div>
    </MainLayout>
  );
};

export default QuotationDetails;
