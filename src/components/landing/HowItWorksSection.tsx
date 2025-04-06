
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    number: "1",
    title: "Submit Your Request",
    description: "Fill out a simple form with details about your property and energy needs",
    content: "Our smart system will analyze your requirements and match you with qualified solar installers in your area."
  },
  {
    number: "2",
    title: "Receive Customized Quotes",
    description: "Get detailed proposals from multiple verified vendors",
    content: "Compare installation costs, equipment options, warranty terms, and estimated savings all in one place."
  },
  {
    number: "3",
    title: "Choose Your Installer",
    description: "Select the best offer that meets your needs and budget",
    content: "Make an informed decision with our side-by-side comparison tools and start your solar journey."
  }
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Solar Quotation Compass makes it easy to find the best solar solution for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">{step.number}</span>
                </div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>
                  {step.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {step.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
