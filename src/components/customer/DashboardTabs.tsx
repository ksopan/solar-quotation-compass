
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuotationForm } from "@/components/customer/QuotationForm";
import { QuotationList } from "@/components/customer/QuotationList";
import { QuotationItem } from "@/hooks/useCustomerQuotations";

interface DashboardTabsProps {
  quotations: QuotationItem[];
  loading: boolean;
  onQuotationSubmitted: () => void;
  onRefresh: () => void;
  deleteQuotation?: (id: string) => Promise<boolean>;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  quotations, 
  loading, 
  onQuotationSubmitted,
  onRefresh,
  deleteQuotation
}) => {
  const [activeTab, setActiveTab] = useState<string>("quotations");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-6">
        <TabsTrigger value="quotations">My Quotation Requests</TabsTrigger>
        <TabsTrigger value="new">Request New Quotation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="quotations">
        <QuotationList
          quotations={quotations}
          loading={loading}
          onRefresh={onRefresh}
          deleteQuotation={deleteQuotation}
        />
      </TabsContent>
      
      <TabsContent value="new">
        <QuotationForm onSuccess={onQuotationSubmitted} />
      </TabsContent>
    </Tabs>
  );
};
