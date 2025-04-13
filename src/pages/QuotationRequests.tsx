
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVendorQuotations } from "@/hooks/useVendorQuotations";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";

const QuotationRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15; // More items per page in the dedicated view
  
  const { fetchQuestionnaires, loading } = useVendorQuotations(user);
  const [questionnaires, setQuestionnaires] = useState([]);

  // Fetch questionnaires
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const result = await fetchQuestionnaires(currentPage, itemsPerPage);
      if (result) {
        setQuestionnaires(result.questionnaires);
        setTotalPages(result.totalPages);
      }
    };
    
    loadData();
  }, [user, currentPage, fetchQuestionnaires]);

  if (!user) return null;

  const handlePageChange = (page) => {
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
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-1" /> Search
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : questionnaires.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No property questionnaires found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <QuestionnairesTable 
            questionnaires={questionnaires}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default QuotationRequests;
