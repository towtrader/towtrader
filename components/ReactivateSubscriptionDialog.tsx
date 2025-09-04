import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

interface ReactivateSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionType: 'user' | 'dealer';
  currentPlan: string;
}

export function ReactivateSubscriptionDialog({
  isOpen,
  onClose,
  subscriptionType,
  currentPlan
}: ReactivateSubscriptionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reactivateMutation = useMutation({
    mutationFn: async () => {
      const endpoint = subscriptionType === 'user' 
        ? '/api/users/reactivate-subscription' 
        : '/api/dealers/reactivate-subscription';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reactivate subscription');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Reactivated",
        description: data.message,
      });
      
      // Invalidate relevant queries
      if (subscriptionType === 'user') {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/dealers/profile'] });
      }
      
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Reactivation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertDialogTitle>Reactivate Subscription</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              Reactivate your <strong>{currentPlan}</strong> subscription?
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm">
                <p className="font-medium text-green-800 mb-1">Benefits of reactivating:</p>
                <ul className="text-green-700 space-y-1">
                  {subscriptionType === 'user' ? (
                    <>
                      <li>• Continue posting truck listings</li>
                      <li>• Access to premium features</li>
                      <li>• Keep your existing listings active</li>
                    </>
                  ) : (
                    <>
                      <li>• Full dealer account access</li>
                      <li>• All truck listings reactivated</li>
                      <li>• CRM and analytics features restored</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Your subscription will continue with the current billing cycle and you'll have immediate access to all features.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => reactivateMutation.mutate()}
            disabled={reactivateMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {reactivateMutation.isPending ? 'Reactivating...' : 'Reactivate Subscription'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}