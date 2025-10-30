import { Badge } from "@/components/ui/badge";

type ProposalStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'withdrawn';

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
}

export const ProposalStatusBadge = ({ status }: ProposalStatusBadgeProps) => {
  const statusConfig = {
    draft: {
      label: 'Draft',
      variant: 'secondary' as const,
    },
    submitted: {
      label: 'Submitted',
      variant: 'default' as const,
    },
    accepted: {
      label: 'Accepted',
      variant: 'default' as const,
    },
    rejected: {
      label: 'Rejected',
      variant: 'destructive' as const,
    },
    withdrawn: {
      label: 'Withdrawn',
      variant: 'outline' as const,
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};
