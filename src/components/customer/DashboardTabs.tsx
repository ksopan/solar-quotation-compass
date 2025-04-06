import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuotationList } from "./QuotationList";
import { QuotationForm } from "./QuotationForm";
import { Loader } from "lucide-react";

// Import the QuotationItem type from our hook
import { type QuotationItem } from "@/hooks/useCustomerQuotations";

interface DashboardTabsProps {
  quotations: any[]; // Use any[] to avoid type conflicts
  loading: boolean;
  onQuotationSubmitted: () => void;
  onRefresh: () => void;
  deleteQuotation: (id: string) => Promise<boolean>;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  quotations,
  loading,
  onQuotationSubmitted,
  onRefresh,
  deleteQuotation,
  activeTab,
  onTabChange
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full mb-6">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="quotations">My Quotations</TabsTrigger>
        <TabsTrigger value="documents">My Documents</TabsTrigger>
        <TabsTrigger value="profile">My Solar Profile</TabsTrigger>
      </TabsList>
      
      <TabsContent value="quotations" className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <QuotationList 
            quotations={quotations}
            loading={loading}
            onRefresh={onRefresh}
            deleteQuotation={deleteQuotation}
          />
        )}
      </TabsContent>
      
      <TabsContent value="documents">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Documents section</h3>
          <p className="text-muted-foreground">
            View and manage all your uploaded documents here.
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="profile">
        {/* Content for Profile tab is rendered in the parent component */}
      </TabsContent>
    </Tabs>
  );
};
