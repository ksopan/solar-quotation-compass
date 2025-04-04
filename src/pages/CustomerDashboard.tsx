
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Home, LightbulbIcon, Zap } from "lucide-react";
import QuotationDetails, { QuotationDetails as QuotationDetailsType } from "@/components/customer/QuotationDetails";

// Mock data for quotations with more details
const mockQuotations = [
  {
    id: "q1",
    status: "Pending",
    createdAt: "2023-04-01",
    totalResponses: 0,
    installationAddress: "123 Solar St, Sunny City, CA 92123",
    roofType: "Asphalt Shingle",
    monthlyBill: 180,
    devices: 12,
    additionalInfo: "Looking for energy-efficient options for a 2-story house."
  },
  {
    id: "q2",
    status: "Active",
    createdAt: "2023-03-15",
    totalResponses: 3,
    installationAddress: "456 Green Ave, Eco Town, CA 90210",
    roofType: "Metal",
    monthlyBill: 230,
    devices: 15,
    additionalInfo: "Interested in battery storage options as well."
  }
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationDetailsType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const handleQuotationSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.success("Quotation request submitted successfully!");
    setIsDialogOpen(false);
  };

  const viewQuotationDetails = (quotation: QuotationDetailsType) => {
    setSelectedQuotation(quotation);
    setIsDetailsOpen(true);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.firstName}!</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Request a Quotation</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request a Solar Quotation</DialogTitle>
              <DialogDescription>
                Fill in the details below to request a quotation from our vendors
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleQuotationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="installation-address">Installation Address</Label>
                <Input
                  id="installation-address"
                  defaultValue={user.address}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roof-type">Roof Type</Label>
                <Select defaultValue="asphalt">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a roof type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asphalt">Asphalt Shingle</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="tile">Tile</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthly-bill">Average Monthly Electricity Bill ($)</Label>
                <Input
                  id="monthly-bill"
                  type="number"
                  placeholder="150"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="devices">Number of Electronic Devices</Label>
                <Input
                  id="devices"
                  type="number"
                  placeholder="10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additional-info">Additional Information</Label>
                <Textarea
                  id="additional-info"
                  placeholder="Any special requirements or questions you have..."
                />
              </div>
              
              <DialogFooter>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotation Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockQuotations.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockQuotations.filter(q => q.status === "Active").length} active requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received Proposals</CardTitle>
            <LightbulbIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              From 2 different vendors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$482/mo</div>
            <p className="text-xs text-muted-foreground">
              Based on your usage patterns
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-6">Your Quotation Requests</h2>
      <div className="grid gap-6">
        {mockQuotations.length > 0 ? (
          mockQuotations.map((quotation) => (
            <Card key={quotation.id}>
              <CardHeader>
                <CardTitle className="text-lg">Quotation #{quotation.id}</CardTitle>
                <CardDescription>Created on {quotation.createdAt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Status: <span className={
                      quotation.status === "Active" ? "text-green-600" : "text-amber-600"
                    }>{quotation.status}</span></p>
                    <p className="text-sm">Total Responses: {quotation.totalResponses}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => viewQuotationDetails(quotation)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <p className="text-muted-foreground">You haven't requested any quotations yet.</p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>Request Your First Quotation</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quotation Details Dialog */}
      <QuotationDetails 
        quotation={selectedQuotation}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default CustomerDashboard;
