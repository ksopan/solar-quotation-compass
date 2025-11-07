
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import QuotationDetails from "./pages/QuotationDetails";
import CompleteProfile from "./pages/CompleteProfile";
import AuthCallback from "./pages/auth/AuthCallback";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";
import QuotationRequests from "./pages/QuotationRequests";
import AllQuestionnaires from "./pages/AllQuestionnaires";
import QuestionnaireDetails from "./pages/QuestionnaireDetails";
import SubmitQuote from "./pages/SubmitQuote";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProfile from "./pages/VendorProfile";
import VerificationSuccess from "./pages/VerificationSuccess";
import VerifyEmail from "./pages/VerifyEmail";

import GetFreeQuotes from "./pages/GetFreeQuotes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/get-free-quotes" element={<GetFreeQuotes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verification-success" element={<VerificationSuccess />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* Protected routes */}
            <Route path="/complete-profile" element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            } />
            <Route path="/quotation/:id" element={
              <ProtectedRoute>
                <QuotationDetails />
              </ProtectedRoute>
            } />
            <Route path="/quotation-requests" element={
              <ProtectedRoute>
                <QuotationRequests />
              </ProtectedRoute>
            } />
            <Route path="/vendor-profile" element={
              <ProtectedRoute>
                <VendorProfile />
              </ProtectedRoute>
            } />
            <Route path="/all-questionnaires" element={
              <ProtectedRoute>
                <AllQuestionnaires />
              </ProtectedRoute>
            } />
            <Route path="/questionnaire/:id" element={
              <ProtectedRoute>
                <QuestionnaireDetails />
              </ProtectedRoute>
            } />
            <Route path="/submit-quote/:id" element={
              <ProtectedRoute>
                <SubmitQuote />
              </ProtectedRoute>
            } />
            <Route path="/vendor-dashboard" element={
              <ProtectedRoute>
                <VendorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
