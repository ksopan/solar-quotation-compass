
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { QuestionnaireModal } from "@/components/questionnaire/QuestionnaireModal";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail } from "lucide-react";

const LandingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  
  useEffect(() => {
    if (searchParams.get("submitted") === "success") {
      setShowSuccessBanner(true);
      // Remove the query param
      searchParams.delete("submitted");
      setSearchParams(searchParams, { replace: true });
      
      // Auto-hide after 10 seconds
      setTimeout(() => setShowSuccessBanner(false), 10000);
    }
  }, [searchParams, setSearchParams]);
  
  const handleGetQuotesClick = () => {
    setIsQuestionnaireOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 py-4 px-4">
          <div className="container mx-auto max-w-4xl">
            <Alert className="border-green-300 bg-transparent shadow-none">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="ml-2 text-green-800">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Request Submitted Successfully!</p>
                    <p className="text-sm mt-1">
                      We've sent a verification email to your inbox. Please check your email and click the verification link to activate your quotation request and connect with solar vendors.
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection onGetQuotes={handleGetQuotesClick} />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Benefits */}
      <BenefitsSection />

      {/* CTA */}
      <CtaSection onGetQuotes={handleGetQuotesClick} />

      {/* Footer */}
      <FooterSection />

      {/* Questionnaire Modal */}
      <QuestionnaireModal 
        open={isQuestionnaireOpen} 
        onOpenChange={setIsQuestionnaireOpen} 
      />
    </div>
  );
};

export default LandingPage;
