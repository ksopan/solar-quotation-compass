
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  file_ids?: string[]; // file paths in Supabase Storage
}

interface QuotationDetailsProps {
  quotation: QuotationDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const QuotationDetails: React.FC<QuotationDetailsProps> = ({
  quotation,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!quotation?.file_ids || quotation.file_ids.length === 0) return;

      const fetched = await Promise.all(
        quotation.file_ids.map(async (path) => {
          const { data } = supabase.storage.from("quotation_files").getPublicUrl(path);
          return { name: path.split("/").pop() || path, url: data.publicUrl };
        })
      );

      setFiles(fetched);
    };

    fetchFiles();
  }, [quotation]);

  if (!quotation) return null;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      try {
        setIsDeleting(true);
        console.log("Starting deletion process for quotation:", quotation.id);
        
        // Check if there's a handler provided by the parent component
        if (onDelete) {
          console.log("Using provided onDelete handler");
          await onDelete(quotation.id);
          toast.success("Quotation deleted successfully");
          onClose();
        } else {
          // Fallback direct deletion if no handler is provided
          console.log("No onDelete handler provided, performing direct deletion");
          const { error } = await supabase
            .from("quotation_requests")
            .delete()
            .eq("id", quotation.id);
            
          if (error) {
            console.error("Error deleting quotation:", error);
            toast.error("Failed to delete quotation");
            throw error;
          }
          
          console.log("Deletion successful");
          toast.success("Quotation deleted successfully");
          onClose();
        }
      } catch (error) {
        console.error("Delete quotation error:", error);
        toast.error("Failed to delete quotation");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Quotation #{quotation.id}</span>
          </DialogTitle>
          <DialogDescription>
            Created on {quotation.createdAt}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <InfoRow label="Status">
            <span className={quotation.status === "Active" ? "text-green-600" : "text-amber-600"}>
              {quotation.status}
            </span>
          </InfoRow>

          <InfoRow label="Responses">{quotation.totalResponses}</InfoRow>
          {quotation.installationAddress && <InfoRow label="Installation Address">{quotation.installationAddress}</InfoRow>}
          {quotation.roofType && <InfoRow label="Roof Type">{quotation.roofType}</InfoRow>}
          {quotation.monthlyBill && <InfoRow label="Monthly Bill">${quotation.monthlyBill}</InfoRow>}
          {quotation.devices && <InfoRow label="Number of Devices">{quotation.devices}</InfoRow>}
          {quotation.additionalInfo && <InfoRow label="Additional Info">{quotation.additionalInfo}</InfoRow>}

          <div>
            <div className="font-medium">Uploaded Files:</div>
            {files.length > 0 ? (
              <ul className="list-disc ml-5 mt-1">
                {files.map((file) => (
                  <li key={file.url}>
                    <a href={file.url} target="_blank" className="text-blue-600 underline" rel="noreferrer">
                      {file.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No files uploaded.</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Quotation"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-3 gap-4">
    <div className="col-span-1 font-medium">{label}:</div>
    <div className="col-span-2">{children}</div>
  </div>
);

export default QuotationDetails;
