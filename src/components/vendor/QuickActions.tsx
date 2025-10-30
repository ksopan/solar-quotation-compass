import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Settings, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "View All Requests",
      description: "Browse all quotation requests",
      icon: FileText,
      color: "bg-blue-500",
      onClick: () => navigate("/quotation-requests"),
    },
    {
      title: "Find New Leads",
      description: "Discover potential customers",
      icon: Search,
      color: "bg-green-500",
      onClick: () => navigate("/quotation-requests"),
    },
    {
      title: "My Proposals",
      description: "Track submitted quotes",
      icon: BarChart,
      color: "bg-purple-500",
      onClick: () => navigate("/my-proposals"),
    },
    {
      title: "Company Profile",
      description: "Update your information",
      icon: Settings,
      color: "bg-orange-500",
      onClick: () => navigate("/vendor-profile"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump to common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto flex flex-col items-start p-4 hover:bg-accent"
                onClick={action.onClick}
              >
                <div className="flex items-center gap-3 w-full mb-2">
                  <div className={`${action.color} p-2 rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
