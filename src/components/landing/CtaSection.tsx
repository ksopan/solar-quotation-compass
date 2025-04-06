
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  onGetQuotes: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onGetQuotes }) => {
  const navigate = useNavigate();
  
  return (
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Ready to Harness the Power of the Sun?
        </h2>
        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
          Join thousands of homeowners who have found their perfect solar solution through Solar Quotation Compass.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={onGetQuotes}
          >
            Get Started Today
          </Button>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => navigate("/login")}>
            Login to Your Account
          </Button>
        </div>
      </div>
    </section>
  );
};
