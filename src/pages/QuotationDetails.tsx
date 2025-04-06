
import React from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useQuotationDetail } from "@/hooks/useQuotationDetail";
import { QuotationDetailsLoading } from "@/components/customer/QuotationDetailsLoading";
import { QuotationNotFound } from "@/components/customer/QuotationNotFound";
import { QuotationDetailsContent } from "@/components/customer/QuotationDetailsContent";

const QuotationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { quotation, loading, isDeleting, handleDelete } = useQuotationDetail(id);

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        {loading ? (
          <QuotationDetailsLoading />
        ) : !quotation ? (
          <QuotationNotFound />
        ) : (
          <QuotationDetailsContent 
            quotation={quotation} 
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default QuotationDetails;
