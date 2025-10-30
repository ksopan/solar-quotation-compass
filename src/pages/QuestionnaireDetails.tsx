import React from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useQuestionnaireDetail } from "@/hooks/useQuestionnaireDetail";
import { QuotationDetailsLoading } from "@/components/customer/QuotationDetailsLoading";
import { QuotationNotFound } from "@/components/customer/QuotationNotFound";
import { QuestionnaireDetailsContent } from "@/components/vendor/QuestionnaireDetailsContent";

const QuestionnaireDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { questionnaire, loading } = useQuestionnaireDetail(id);

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        {loading ? (
          <QuotationDetailsLoading />
        ) : !questionnaire ? (
          <QuotationNotFound />
        ) : (
          <QuestionnaireDetailsContent questionnaire={questionnaire} />
        )}
      </div>
    </MainLayout>
  );
};

export default QuestionnaireDetails;
