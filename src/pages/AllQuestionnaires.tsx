
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useVendorQuotations } from "@/hooks/vendor";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, DatabaseIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AllQuestionnaires = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [allQuestionnaires, setAllQuestionnaires] = useState([]);
  
  const { 
    loading: hookLoading,
    fetchQuestionnaires,
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
    try {
      const { fetchQuestionnaires } = await import('@/hooks/vendor/api');
      const result = await fetchQuestionnaires(user, 1, 100); // Show up to 100 items
      if (result && result.questionnaires) {
        setAllQuestionnaires(result.questionnaires);
      }
    } catch (error) {
      console.error("Error loading all questionnaires:", error);
      toast.error("Failed to load questionnaires");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing all questionnaires...");
    loadAllQuestionnaires();
  };

  // Load questionnaires without debug mode
  const handleToggleDebugMode = () => {
    toast.info("Debug mode is not available");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Property Questionnaires</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleDebugMode}>
            <DatabaseIcon className="h-4 w-4 mr-2" /> 
            {debugMode ? "Normal Mode" : "Debug Mode"}
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>

      <QuestionnairesTable 
        questionnaires={allQuestionnaires}
        loading={isLoading || hookLoading}
        currentPage={1}
        totalPages={1}
        onPageChange={() => loadAllQuestionnaires()}
        showPagination={false}
      />
      
      {!isLoading && allQuestionnaires.length === 0 && (
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
