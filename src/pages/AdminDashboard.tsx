
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Users, Building, Shield } from "lucide-react";

// Mock data for customers
const mockCustomers = [
  { id: "c1", name: "John Smith", email: "john@example.com", requestsCount: 2, joinDate: "2023-03-15" },
  { id: "c2", name: "Sarah Johnson", email: "sarah@example.com", requestsCount: 1, joinDate: "2023-03-20" },
  { id: "c3", name: "Michael Brown", email: "michael@example.com", requestsCount: 0, joinDate: "2023-03-25" },
];

// Mock data for vendors
const mockVendors = [
  { id: "v1", companyName: "Solar Solutions Inc", email: "contact@solarsolutions.com", quotationsCount: 5, joinDate: "2023-02-10" },
  { id: "v2", companyName: "EcoEnergy Systems", email: "info@ecoenergy.com", quotationsCount: 3, joinDate: "2023-02-15" },
  { id: "v3", companyName: "Sunshine Power Co", email: "sales@sunshinepower.com", quotationsCount: 7, joinDate: "2023-01-20" },
];

// Mock data for quotations
const mockQuotations = [
  { id: "q1", customer: "John Smith", vendor: "Solar Solutions Inc", status: "Pending", createdAt: "2023-03-28" },
  { id: "q2", customer: "Sarah Johnson", vendor: "EcoEnergy Systems", status: "Active", createdAt: "2023-03-25" },
  { id: "q3", customer: "John Smith", vendor: "Sunshine Power Co", status: "Completed", createdAt: "2023-03-20" },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administrator Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockCustomers.filter(c => new Date(c.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} new in last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVendors.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockVendors.filter(v => new Date(v.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} new in last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockQuotations.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockQuotations.filter(q => q.status === "Active").length} currently active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="mt-6">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Customers</CardTitle>
              <CardDescription>Manage customer accounts and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.joinDate}</TableCell>
                      <TableCell>{customer.requestsCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">Export Data</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="vendors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Vendors</CardTitle>
              <CardDescription>Manage vendor accounts and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Quotations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.companyName}</TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>{vendor.joinDate}</TableCell>
                      <TableCell>{vendor.quotationsCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">Export Data</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Quotations</CardTitle>
              <CardDescription>Track and manage quotation requests and submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">{quotation.id}</TableCell>
                      <TableCell>{quotation.customer}</TableCell>
                      <TableCell>{quotation.vendor}</TableCell>
                      <TableCell>{quotation.createdAt}</TableCell>
                      <TableCell>
                        <Badge className={
                          quotation.status === "Pending" ? "bg-amber-500" :
                          quotation.status === "Active" ? "bg-blue-500" :
                          "bg-green-500"
                        }>
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">Export Data</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </MainLayout>
  );
};

export default AdminDashboard;
