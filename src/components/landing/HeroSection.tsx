
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";

interface HeroSectionProps {
  onGetQuotes: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetQuotes }) => {
  const navigate = useNavigate();
  
  return (
    <section className="hero-pattern">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Find the Perfect Solar Solution for Your Home
            </h1>
            <p className="text-xl">
              Get multiple quotes from top-rated solar installers and save up to 30% on your energy bills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={onGetQuotes}>
                Get Free Quotes
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
            <div className="relative w-full max-w-md aspect-square bg-primary/10 rounded-full flex items-center justify-center">
              <Sun className="w-32 h-32 text-primary animate-pulse" />
              <div className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
