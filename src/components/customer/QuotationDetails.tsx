
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Define the quotation type
export interface QuotationDetails {
  id: string;
  status: string;
  createdAt: string;
  totalResponses: number;
  installationAddress?: string;
  roofType?: string;
  monthlyBill?: number;
  devices?: number;
  additionalInfo?: string;
}

interface QuotationDetailsProps {
  quotation: QuotationDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuotationDetails: React.FC<QuotationDetailsProps> = ({
  quotation,
  isOpen,
  onClose,
}) => {
  if (!quotation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Quotation #{quotation.id}</span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
          <DialogDescription>
            Created on {quotation.createdAt}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 font-medium">Status:</div>
            <div className="col-span-2">
              <span className={quotation.status === "Active" ? "text-green-600" : "text-amber-600"}>
                {quotation.status}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 font-medium">Responses:</div>
            <div className="col-span-2">{quotation.totalResponses}</div>
          </div>
          
          {quotation.installationAddress && (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 font-medium">Installation Address:</div>
              <div className="col-span-2">{quotation.installationAddress}</div>
            </div>
          )}
          
          {quotation.roofType && (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 font-medium">Roof Type:</div>
              <div className="col-span-2">{quotation.roofType}</div>
            </div>
          )}
          
          {quotation.monthlyBill && (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 font-medium">Monthly Bill:</div>
              <div className="col-span-2">${quotation.monthlyBill}</div>
            </div>
          )}
          
          {quotation.devices && (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 font-medium">Number of Devices:</div>
              <div className="col-span-2">{quotation.devices}</div>
            </div>
          )}
          
          {quotation.additionalInfo && (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 font-medium">Additional Info:</div>
              <div className="col-span-2">{quotation.additionalInfo}</div>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationDetails;
