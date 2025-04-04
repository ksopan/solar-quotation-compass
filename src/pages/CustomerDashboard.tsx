
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuotationForm } from "@/components/customer/QuotationForm";
import { QuotationList } from "@/components/customer/QuotationList";

interface QuotationItem {
  id: string;
  status: string;
  created_at: string;
  location: string;
  roof_type: string;
  energy_usage: number | null;
  roof_area: number;
  additional_notes: string | null;
  quotation_proposals: { count: number }[];
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("quotations");
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQuotations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get customer's quotation requests
      const { data, error } = await supabase
        .from("quotation_requests")
        .select(`
          id,
          status,
          created_at,
          location,
          roof_type,
          energy_usage,
          roof_area,
          additional_notes,
          quotation_proposals (count)
        `)
        .eq("customer_id", user.id);
      
      if (error) {
        throw new Error(`Error fetching quotations: ${error.message}`);
      }
      
      if (data) {
        // Type assertion to ensure we have the right structure
        setQuotations(data as QuotationItem[]);
      }
    } catch (error) {
      console.error("Error fetching customer quotations:", error);
      toast.error("Failed to load your quotation requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [user]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleQuotationSubmitted = () => {
    // Refresh the quotations list and switch to that tab
    fetchQuotations();
    setActiveTab("quotations");
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="quotations">My Quotation Requests</TabsTrigger>
          <TabsTrigger value="new">Request New Quotation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quotations">
          <QuotationList quotations={quotations} loading={loading} />
        </TabsContent>
        
        <TabsContent value="new">
          <QuotationForm onSuccess={handleQuotationSubmitted} />
        </TabsContent>
      </Tabs>
      
      {/* Dashboard Statistics and Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.filter(q => q.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Received Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.reduce((total, q) => total + q.quotation_proposals.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
