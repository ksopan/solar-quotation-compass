
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Zap, DollarSign, Users, Check } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
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
                <Button size="lg" onClick={() => navigate("/register")}>
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

      {/* How It Works */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Solar Quotation Compass makes it easy to find the best solar solution for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <CardTitle>Submit Your Request</CardTitle>
                <CardDescription>
                  Fill out a simple form with details about your property and energy needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our smart system will analyze your requirements and match you with qualified solar installers in your area.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <CardTitle>Receive Customized Quotes</CardTitle>
                <CardDescription>
                  Get detailed proposals from multiple verified vendors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Compare installation costs, equipment options, warranty terms, and estimated savings all in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <CardTitle>Choose Your Installer</CardTitle>
                <CardDescription>
                  Select the best offer that meets your needs and budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Make an informed decision with our side-by-side comparison tools and start your solar journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-accent py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Solar Quotation Compass</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We connect you with trustworthy solar professionals who will help you save money and reduce your carbon footprint
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Energy Independence</h3>
                <p className="text-muted-foreground">
                  Break free from rising utility costs and produce your own clean, renewable energy with a custom solar solution.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Cost Savings</h3>
                <p className="text-muted-foreground">
                  Save up to 30% on your electricity bills and increase your property value with solar panel installation.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Verified Vendors</h3>
                <p className="text-muted-foreground">
                  All solar providers on our platform are thoroughly vetted and maintain high customer satisfaction ratings.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Simplified Process</h3>
                <p className="text-muted-foreground">
                  Our platform handles all the details, making your solar journey smooth from initial quote to final installation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Harness the Power of the Sun?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of homeowners who have found their perfect solar solution through Solar Quotation Compass.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate("/register")}>
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => navigate("/login")}>
              Login to Your Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center mb-4">
                <Sun className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-xl">Solar Quotation Compass</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Connecting homeowners with trusted solar installation professionals since 2023.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-semibold mb-4">For Customers</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-primary">How It Works</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Get Quotes</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">For Vendors</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Join as Vendor</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Vendor Benefits</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Success Stories</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-primary">About Us</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Contact</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-muted-foreground/20 mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2023 Solar Quotation Compass. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
