
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVendorQuotations, PropertyQuestionnaireItem } from "@/hooks/vendor";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { toast } from "sonner";

const QuotationRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use the hook directly
  const { questionnaires, loading, fetchQuestionnaires, stats } = useVendorQuotations(user);
  
  // Log rendering
  useEffect(() => {
    console.log("QuotationRequests rendering with questionnaires:", questionnaires);
  }, [questionnaires]);

  if (!user) {
    toast.error("User not authenticated");
    return null;
  }

  const handlePageChange = (page: number) => {
    fetchQuestionnaires(page, 15);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">All Property Questionnaires</h1>
          </div>
          <QuestionnaireFilters />
        </div>

        <QuestionnairesTable 
          questionnaires={questionnaires}
          loading={loading}
          currentPage={1}
          totalPages={Math.max(1, Math.ceil(stats.potentialCustomers / 15))}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
};

export default QuotationRequests;
