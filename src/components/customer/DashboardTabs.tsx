
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { QuotationList } from "./QuotationList";

interface DashboardTabsProps {
  quotations: any[];
  loading: boolean;
  onQuotationSubmitted: () => void;
  onRefresh: () => void;
  deleteQuotation: (id: string) => Promise<void>;
  activeTab: string;
  onTabChange: (value: string) => void;
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
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="quotations">My Quotations</TabsTrigger>
          <TabsTrigger value="profile">My Solar Profile</TabsTrigger>
        </TabsList>
        
        <div className="flex space-x-2">
          {activeTab === "quotations" && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>
      
      <TabsContent value="quotations">
        <Card>
          <CardHeader>
            <CardTitle>My Quotation Requests</CardTitle>
            <CardDescription>
              View and manage your solar installation quotation requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuotationList
              quotations={quotations}
              loading={loading}
              deleteQuotation={deleteQuotation}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="profile">
        {/* Profile content is rendered in the CustomerDashboard component */}
      </TabsContent>
    </Tabs>
  );
};
