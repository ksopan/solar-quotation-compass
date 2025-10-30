import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { QuestionnaireDetailData } from "@/hooks/useQuestionnaireDetail";
import { format, parseISO } from "date-fns";
import { 
  Home, 
  DollarSign, 
  Calendar, 
  Battery, 
  TreePine,
  Mail,
  User
} from "lucide-react";

interface QuestionnaireDetailsContentProps {
  questionnaire: QuestionnaireDetailData;
}

export const QuestionnaireDetailsContent: React.FC<QuestionnaireDetailsContentProps> = ({ 
  questionnaire 
}) => {
  const navigate = useNavigate();

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number | boolean }) => (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</p>
      </div>
    </div>
  );

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  const formatTimeline = (timeline: string) => {
    return timeline.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatBatteryReason = (reason: string | null) => {
    if (!reason) return 'N/A';
    return reason.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Questionnaire Details</h1>
          <p className="text-muted-foreground mt-1">
            Submitted on {format(parseISO(questionnaire.created_at), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <Badge variant={questionnaire.is_completed ? "default" : "secondary"}>
          {questionnaire.is_completed ? "Completed" : "Incomplete"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow 
              icon={User} 
              label="Name" 
              value={`${questionnaire.first_name} ${questionnaire.last_name}`} 
            />
            <InfoRow 
              icon={Mail} 
              label="Email" 
              value={questionnaire.email} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow 
              icon={Home} 
              label="Property Type" 
              value={formatPropertyType(questionnaire.property_type)} 
            />
            <InfoRow 
              icon={Home} 
              label="Ownership Status" 
              value={questionnaire.ownership_status === 'own' ? 'Owner' : 'Renter'} 
            />
            <InfoRow 
              icon={Home} 
              label="Roof Age Status" 
              value={questionnaire.roof_age_status === 'yes' ? 'Over 10 years' : 'Under 10 years'} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Energy & Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow 
              icon={DollarSign} 
              label="Monthly Electric Bill" 
              value={`$${questionnaire.monthly_electric_bill}`} 
            />
            <InfoRow 
              icon={Calendar} 
              label="Purchase Timeline" 
              value={formatTimeline(questionnaire.purchase_timeline)} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5" />
              Additional Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow 
              icon={Battery} 
              label="Interested in Batteries" 
              value={questionnaire.interested_in_batteries} 
            />
            {questionnaire.interested_in_batteries && (
              <InfoRow 
                icon={Battery} 
                label="Battery Reason" 
                value={formatBatteryReason(questionnaire.battery_reason)} 
              />
            )}
            <InfoRow 
              icon={TreePine} 
              label="Willing to Remove Trees" 
              value={questionnaire.willing_to_remove_trees} 
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => navigate(-1)} variant="outline">
          Back
        </Button>
        <Button onClick={() => navigate(`/submit-quote/${questionnaire.id}`)}>
          Submit Quote
        </Button>
      </div>
    </div>
  );
};
