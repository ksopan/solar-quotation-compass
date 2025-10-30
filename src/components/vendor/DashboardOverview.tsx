import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle, Users } from "lucide-react";

interface VendorStats {
  newRequests: number;
  submittedQuotes: number;
  conversionRate: number;
  potentialCustomers: number;
}

interface DashboardOverviewProps {
  stats: VendorStats;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats }) => {
  const statCards = [
    {
      title: "New Requests",
      value: stats.newRequests,
      description: "Waiting for your quotation",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Submitted Quotes",
      value: stats.submittedQuotes,
      description: "Last 30 days",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      description: `+5.2% from last month`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Potential Customers",
      value: stats.potentialCustomers,
      description: "In your service area",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
