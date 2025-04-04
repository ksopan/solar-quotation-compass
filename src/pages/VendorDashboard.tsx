
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, BarChart, TrendingUp } from "lucide-react";

// Mock data for quotation requests
const mockQuotationRequests = [
  {
    id: "req1",
    customerName: "John Smith",
    location: "San Francisco, CA",
    createdAt: "2023-03-28",
    status: "New",
    monthlyBill: "$180",
    roofType: "Asphalt Shingle"
  },
  {
    id: "req2",
    customerName: "Maria Garcia",
    location: "Los Angeles, CA",
    createdAt: "2023-03-25",
    status: "Viewed",
    monthlyBill: "$220",
    roofType: "Metal"
  },
  {
    id: "req3",
    customerName: "Robert Johnson",
    location: "San Diego, CA",
    createdAt: "2023-03-20",
    status: "Quoted",
    monthlyBill: "$150",
    roofType: "Tile"
  }
];

const VendorDashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.companyName}!</h1>
        <Button onClick={() => window.location.href = "/quotation-requests"}>View All Requests</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockQuotationRequests.filter(req => req.status === "New").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting for your quotation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Quotes</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockQuotationRequests.filter(req => req.status === "Quoted").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockQuotationRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              In your service area
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-6">Recent Quotation Requests</h2>
      <div className="grid gap-6">
        {mockQuotationRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{request.customerName}</CardTitle>
                  <CardDescription>{request.location}</CardDescription>
                </div>
                <Badge className={
                  request.status === "New" ? "bg-blue-500" :
                  request.status === "Viewed" ? "bg-amber-500" :
                  "bg-green-500"
                }>
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Monthly Bill</p>
                  <p className="text-sm">{request.monthlyBill}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Roof Type</p>
                  <p className="text-sm">{request.roofType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Request Date</p>
                  <p className="text-sm">{request.createdAt}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Details</Button>
              {request.status !== "Quoted" && (
                <Button>Submit Quotation</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorDashboard;
