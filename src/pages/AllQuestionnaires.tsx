
import React from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAllQuestionnaires } from "@/hooks/questionnaire/useAllQuestionnaires";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

const AllQuestionnaires = () => {
  const navigate = useNavigate();
  const { questionnaires, loading, error, refetch } = useAllQuestionnaires();

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">All Property Questionnaires</h1>
          </div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : questionnaires.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No property questionnaires found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Property Type</TableHead>
                    <TableHead>Monthly Bill</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Submission Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionnaires.map((questionnaire) => (
                    <TableRow key={questionnaire.id}>
                      <TableCell className="font-medium">
                        {questionnaire.first_name} {questionnaire.last_name}
                      </TableCell>
                      <TableCell>{questionnaire.email}</TableCell>
                      <TableCell>{formatPropertyType(questionnaire.property_type)}</TableCell>
                      <TableCell>${questionnaire.monthly_electric_bill}</TableCell>
                      <TableCell>{questionnaire.is_completed ? "Yes" : "No"}</TableCell>
                      <TableCell>{format(parseISO(questionnaire.created_at), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default AllQuestionnaires;
