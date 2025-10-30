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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProposalDetailsModalProps {
  questionnaireId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Proposal {
  id: string;
  vendor_id: string;
  total_price: number;
  warranty_period: string;
  installation_timeframe: string;
  proposal_details: string;
  status: string;
  created_at: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
}

interface VendorProfile {
  company_name: string;
  email: string;
  phone: string | null;
}

const ProposalDetailsModal: React.FC<ProposalDetailsModalProps> = ({
  questionnaireId,
  isOpen,
  onClose,
}) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && questionnaireId) {
      fetchProposals();
    }
  }, [isOpen, questionnaireId]);

  useEffect(() => {
    if (selectedProposal) {
      fetchAttachments(selectedProposal.id);
      fetchVendorProfile(selectedProposal.vendor_id);
    }
  }, [selectedProposal]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotation_proposals")
        .select("*")
        .eq("property_questionnaire_id", questionnaireId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProposals(data || []);
      if (data && data.length > 0) {
        setSelectedProposal(data[0]);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttachments = async (proposalId: string) => {
    try {
      const { data, error } = await supabase
        .from("quotation_proposal_attachments")
        .select("*")
        .eq("proposal_id", proposalId);

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      setAttachments([]);
    }
  };

  const fetchVendorProfile = async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("company_name, email, phone")
        .eq("id", vendorId)
        .single();

      if (error) throw error;
      setVendorProfile(data);
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      setVendorProfile(null);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("proposal_documents")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (proposals.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Quotation Proposals</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            No proposals received yet.
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quotation Proposals ({proposals.length})</DialogTitle>
          <DialogDescription>
            Review proposals from vendors
          </DialogDescription>
        </DialogHeader>

        {proposals.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {proposals.map((proposal, index) => (
              <Button
                key={proposal.id}
                size="sm"
                variant={selectedProposal?.id === proposal.id ? "default" : "outline"}
                onClick={() => setSelectedProposal(proposal)}
              >
                Proposal {index + 1}
              </Button>
            ))}
          </div>
        )}

        {selectedProposal && (
          <div className="space-y-4">
            {vendorProfile && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Vendor Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Company:</span> {vendorProfile.company_name}</p>
                    <p><span className="font-medium">Email:</span> {vendorProfile.email}</p>
                    {vendorProfile.phone && (
                      <p><span className="font-medium">Phone:</span> {vendorProfile.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Proposal Details</h3>
                  <Badge>{selectedProposal.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="text-2xl font-bold text-primary">
                      ${selectedProposal.total_price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Warranty Period</p>
                    <p className="font-semibold">{selectedProposal.warranty_period} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Installation Timeframe</p>
                    <p className="font-semibold">{selectedProposal.installation_timeframe} weeks</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-semibold">
                      {new Date(selectedProposal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Proposal Description</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedProposal.proposal_details}</p>
                </div>
              </CardContent>
            </Card>

            {attachments.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Attached Documents</h3>
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{attachment.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.file_size)} • {attachment.file_type}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadFile(attachment.file_path, attachment.file_name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalDetailsModal;
