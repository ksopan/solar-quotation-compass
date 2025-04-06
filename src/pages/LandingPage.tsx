
import React, { useState } from "react";
import { QuestionnaireModal } from "@/components/questionnaire/QuestionnaireModal";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { FooterSection } from "@/components/landing/FooterSection";

const LandingPage = () => {
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  
  const handleGetQuotesClick = () => {
    setIsQuestionnaireOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
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
