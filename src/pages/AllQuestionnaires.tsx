
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useVendorQuotations } from "@/hooks/vendor";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AllQuestionnaires = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    questionnaires, 
    loading, 
    fetchQuestionnaires,
    currentPage,
    totalPages,
    refresh,
  } = useVendorQuotations(user);

  // Fetch all questionnaires when the component mounts
  useEffect(() => {
    if (user) {
      loadAllQuestionnaires();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all questionnaires with a high limit
  const loadAllQuestionnaires = async () => {
    setIsLoading(true);
    await fetchQuestionnaires(1, 100); // Show up to 100 items
    setIsLoading(false);
  };

  const handleRefresh = () => {
    toast.info("Refreshing all questionnaires...");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Property Questionnaires</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>

      <QuestionnairesTable 
        questionnaires={questionnaires}
        loading={loading || isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchQuestionnaires(page, 100)}
      />
      
      {!loading && questionnaires.length === 0 && (
        <div className="text-center p-8">
          <p>No questionnaires found. The database may be empty or you may not have permission to view them.</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllQuestionnaires;
