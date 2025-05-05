
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

  // Toggle debug mode to use the RPC function directly
  const handleToggleDebugMode = async () => {
    if (!debugMode) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_debug_questionnaires');
        if (error) {
          throw error;
        }
        console.log("Debug RPC direct call returned:", data?.length || 0, "questionnaires");
        toast.success(`Debug mode: Found ${data?.length || 0} questionnaires directly from RPC`);
        setDebugMode(true);
      } catch (error) {
        console.error("Error using debug RPC function:", error);
        toast.error("Failed to use debug mode");
      } finally {
        setIsLoading(false);
      }
    } else {
      setDebugMode(false);
      loadAllQuestionnaires();
    }
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
