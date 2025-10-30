import { Badge } from "@/components/ui/badge";

type QuestionnaireStatus = 'draft' | 'submitted' | 'under_review' | 'proposals_received' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: QuestionnaireStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    draft: {
      label: 'Draft',
      variant: 'secondary' as const,
    },
    submitted: {
      label: 'Submitted',
      variant: 'default' as const,
    },
    under_review: {
      label: 'Under Review',
      variant: 'default' as const,
    },
    proposals_received: {
      label: 'Proposals Received',
      variant: 'default' as const,
    },
    completed: {
      label: 'Completed',
      variant: 'default' as const,
    },
    cancelled: {
      label: 'Cancelled',
      variant: 'destructive' as const,
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant={config.variant} className="ml-2">
      {config.label}
    </Badge>
  );
};
