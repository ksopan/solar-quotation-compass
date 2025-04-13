
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useVendorQuotations } from "@/hooks/useVendorQuotations";
import { DashboardStats } from "@/components/vendor/DashboardStats";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";

const VendorDashboard = () => {
  const { user } = useAuth();
  const { questionnaires, loading, stats, fetchQuestionnaires } = useVendorQuotations(user);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch questionnaires with pagination
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        const result = await fetchQuestionnaires(currentPage, itemsPerPage);
        if (result) {
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
        <h1 className="text-3xl font-bold">Welcome, {user.companyName}!</h1>
        <Button onClick={() => window.location.href = "/quotation-requests"}>View All Requests</Button>
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
