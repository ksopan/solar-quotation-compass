
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useVendorQuotations } from "@/hooks/vendor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, Target, Award } from "lucide-react";
import { DashboardOverview } from "@/components/vendor/DashboardOverview";
import { QuickActions } from "@/components/vendor/QuickActions";
import { RecentActivity } from "@/components/vendor/RecentActivity";

const VendorDashboard = () => {
  const { user } = useAuth();
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  
  const { 
    stats, 
    refresh,
    error
  } = useVendorQuotations(user);

  const [recentQuestionnaires, setRecentQuestionnaires] = useState([]);
  
  const fetchRecentQuestionnaires = async () => {
    if (!user) return;
    
    try {
      setIsLoadingRecent(true);
      const { fetchQuestionnaires } = await import('@/hooks/vendor/api');
      const result = await fetchQuestionnaires(user, 1, 5);
      
      if (result && result.questionnaires) {
        setRecentQuestionnaires(result.questionnaires);
      } else {
        setRecentQuestionnaires([]);
      }
    } catch (error) {
      console.error("Error fetching recent questionnaires:", error);
      setRecentQuestionnaires([]);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentQuestionnaires();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {user.companyName || "Solar Hoops"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your business overview and latest opportunities
          </p>
        </div>

        {/* Stats Overview */}
        <DashboardOverview stats={stats} />

        {error && (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="py-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions and Recent Activity Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <QuickActions />
          <RecentActivity 
            questionnaires={recentQuestionnaires}
            loading={isLoadingRecent}
          />
        </div>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Insights
            </CardTitle>
            <CardDescription>Key metrics to grow your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50">
                <Zap className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-sm">Response Time</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Respond quickly to increase your conversion rate
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
                <Target className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-sm">Win More Leads</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submit competitive quotes to stand out
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50">
                <Award className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <p className="font-medium text-sm">Build Reputation</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quality proposals lead to more customers
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VendorDashboard;
