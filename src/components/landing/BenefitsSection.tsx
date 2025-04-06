
import React from "react";
import { Calendar, DollarSign, Users, Check, Zap } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Energy Independence",
    description: "Break free from rising utility costs and produce your own clean, renewable energy with a custom solar solution."
  },
  {
    icon: DollarSign,
    title: "Cost Savings",
    description: "Save up to 30% on your electricity bills and increase your property value with solar panel installation."
  },
  {
    icon: Users,
    title: "Verified Vendors",
    description: "All solar providers on our platform are thoroughly vetted and maintain high customer satisfaction ratings."
  },
  {
    icon: Check,
    title: "Simplified Process",
    description: "Our platform handles all the details, making your solar journey smooth from initial quote to final installation."
  }
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="bg-accent py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Solar Quotation Compass</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We connect you with trustworthy solar professionals who will help you save money and reduce your carbon footprint
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
