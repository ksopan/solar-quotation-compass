
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useVendorQuotations, PropertyQuestionnaireItem } from "@/hooks/useVendorQuotations";
import { DashboardStats } from "@/components/vendor/DashboardStats";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { useNavigate } from "react-router-dom";

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5; // Show fewer items on dashboard
  
  // Destructure only what we need from the hook
  const { loading, stats, fetchQuestionnaires } = useVendorQuotations(user);
  const [questionnaires, setQuestionnaires] = useState<PropertyQuestionnaireItem[]>([]);

  // Fetch questionnaires with pagination only when needed
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        const result = await fetchQuestionnaires(currentPage, itemsPerPage);
        if (result) {
          setQuestionnaires(result.questionnaires);
          setTotalPages(result.totalPages);
        }
      };
      
      loadData();
    }
  }, [user, currentPage, fetchQuestionnaires]);

  if (!user) return null;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.companyName || 'Vendor'}!</h1>
        <Button onClick={() => navigate("/quotation-requests")}>View All Requests</Button>
      </div>

      <DashboardStats stats={stats} />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Property Questionnaires</h2>
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
  );
};

export default VendorDashboard;
