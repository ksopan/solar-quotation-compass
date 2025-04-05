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
import { X } from "lucide-react";
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

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      onDelete?.(quotation.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Quotation #{quotation.id}</span>
            {/* <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose> */}
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
          <Button variant="destructive" onClick={handleDelete}>
            Delete Quotation
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


// import React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogClose
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { X } from "lucide-react";

// // Define the quotation type
// export interface QuotationDetails {
//   id: string;
//   status: string;
//   createdAt: string;
//   totalResponses: number;
//   installationAddress?: string;
//   roofType?: string;
//   monthlyBill?: number;
//   devices?: number;
//   additionalInfo?: string;
// }

// interface QuotationDetailsProps {
//   quotation: QuotationDetails | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// const QuotationDetails: React.FC<QuotationDetailsProps> = ({
//   quotation,
//   isOpen,
//   onClose,
// }) => {
//   if (!quotation) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle className="flex justify-between items-center">
//             <span>Quotation #{quotation.id}</span>
//             <DialogClose asChild>
//               <Button variant="ghost" size="icon">
//                 <X className="h-4 w-4" />
//               </Button>
//             </DialogClose>
//           </DialogTitle>
//           <DialogDescription>
//             Created on {quotation.createdAt}
//           </DialogDescription>
//         </DialogHeader>
//         <div className="space-y-4 py-4">
//           <div className="grid grid-cols-3 gap-4">
//             <div className="col-span-1 font-medium">Status:</div>
//             <div className="col-span-2">
//               <span className={quotation.status === "Active" ? "text-green-600" : "text-amber-600"}>
//                 {quotation.status}
//               </span>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-3 gap-4">
//             <div className="col-span-1 font-medium">Responses:</div>
//             <div className="col-span-2">{quotation.totalResponses}</div>
//           </div>
          
//           {quotation.installationAddress && (
//             <div className="grid grid-cols-3 gap-4">
//               <div className="col-span-1 font-medium">Installation Address:</div>
//               <div className="col-span-2">{quotation.installationAddress}</div>
//             </div>
//           )}
          
//           {quotation.roofType && (
//             <div className="grid grid-cols-3 gap-4">
//               <div className="col-span-1 font-medium">Roof Type:</div>
//               <div className="col-span-2">{quotation.roofType}</div>
//             </div>
//           )}
          
//           {quotation.monthlyBill && (
//             <div className="grid grid-cols-3 gap-4">
//               <div className="col-span-1 font-medium">Monthly Bill:</div>
//               <div className="col-span-2">${quotation.monthlyBill}</div>
//             </div>
//           )}
          
//           {quotation.devices && (
//             <div className="grid grid-cols-3 gap-4">
//               <div className="col-span-1 font-medium">Number of Devices:</div>
//               <div className="col-span-2">{quotation.devices}</div>
//             </div>
//           )}
          
//           {quotation.additionalInfo && (
//             <div className="grid grid-cols-3 gap-4">
//               <div className="col-span-1 font-medium">Additional Info:</div>
//               <div className="col-span-2">{quotation.additionalInfo}</div>
//             </div>
//           )}
//         </div>
//         <div className="flex justify-end">
//           <DialogClose asChild>
//             <Button variant="outline">Close</Button>
//           </DialogClose>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default QuotationDetails;
