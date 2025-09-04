import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

interface CertifiedDealerBadgeProps {
  isVerified?: boolean;
  className?: string;
}

export default function CertifiedDealerBadge({ isVerified, className = "" }: CertifiedDealerBadgeProps) {
  if (!isVerified) {
    return null;
  }

  return (
    <Badge 
      className={`bg-blue-600 hover:bg-blue-700 text-white border-blue-600 inline-flex items-center gap-1 text-xs font-medium ${className}`}
      data-testid="badge-certified-dealer"
    >
      <ShieldCheck className="w-3 h-3" />
      Certified Dealer
    </Badge>
  );
}