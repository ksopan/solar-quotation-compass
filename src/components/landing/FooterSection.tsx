
import React from "react";
import { Sun } from "lucide-react";

export const FooterSection: React.FC = () => {
  return (
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
  );
};
