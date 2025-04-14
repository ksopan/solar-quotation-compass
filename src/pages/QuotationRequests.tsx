
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVendorQuotations, PropertyQuestionnaireItem } from "@/hooks/vendor";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";

const QuotationRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15; // More items per page in the dedicated view
  
  const { fetchQuestionnaires, loading } = useVendorQuotations(user);
  const [questionnaires, setQuestionnaires] = useState<PropertyQuestionnaireItem[]>([]);

  // Fetch questionnaires with correct dependency array
  useEffect(() => {
    if (!user) return;

    console.log("QuotationRequests: Fetching questionnaires for page", currentPage);
    const loadData = async () => {
      const result = await fetchQuestionnaires(currentPage, itemsPerPage);
      if (result) {
        console.log("QuotationRequests: Received questionnaires", result.questionnaires);
        setQuestionnaires(result.questionnaires);
        setTotalPages(result.totalPages);
      }
    };
    
    loadData();
  }, [user, currentPage, fetchQuestionnaires]);

  if (!user) return null;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  );
};

export default QuotationRequests;
