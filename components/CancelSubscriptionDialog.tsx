import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Calendar } from "lucide-react";

interface CancelSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionType: 'user' | 'dealer';
  currentPlan: string;
  nextBillingDate?: string;
}

export function CancelSubscriptionDialog({
  isOpen,
  onClose,
  subscriptionType,
  currentPlan,
  nextBillingDate
}: CancelSubscriptionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const endpoint = subscriptionType === 'user' 
        ? '/api/users/cancel-subscription' 
        : '/api/dealers/cancel-subscription';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Canceled",
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
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              Are you sure you want to cancel your <strong>{currentPlan}</strong> subscription?
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Calendar className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Important:</p>
                  <p className="text-amber-700">
                    Your subscription will remain active until {formatDate(nextBillingDate)}. 
                    You'll continue to have access to all features until then.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">After cancellation:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {subscriptionType === 'user' ? (
                  <>
                    <li>• You won't be able to post new truck listings</li>
                    <li>• Existing listings will be deactivated</li>
                    <li>• Access to premium features will be removed</li>
                  </>
                ) : (
                  <>
                    <li>• Your dealer account will be downgraded</li>
                    <li>• All truck listings will be deactivated</li>
                    <li>• CRM and analytics features will be disabled</li>
                  </>
                )}
                <li>• You can reactivate anytime before the billing period ends</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {cancelMutation.isPending ? 'Canceling...' : 'Cancel Subscription'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}