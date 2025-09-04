import { useMutation } from '@tanstack/react-query';

// Hook for tracking analytics events
export function useAnalytics() {
  const trackEvent = useMutation({
    mutationFn: async ({ truckId, eventType, metadata }: {
      truckId: number;
      eventType: 'view' | 'phone_click' | 'email_click' | 'share' | 'inquiry';
      metadata?: any;
    }) => {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          truckId,
          eventType,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to track event');
      }

      return response.json();
    },
    onError: (error) => {
      // Silently fail for analytics - don't disrupt user experience
      console.warn('Analytics tracking failed:', error);
    }
  });

  const createInquiry = useMutation({
    mutationFn: async ({ 
      truckId, 
      inquiryType, 
      customerName, 
      customerEmail, 
      customerPhone, 
      message, 
      priority 
    }: {
      truckId: number;
      inquiryType: 'general' | 'pricing' | 'availability' | 'inspection' | 'financing';
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      message?: string;
      priority?: 'low' | 'medium' | 'high';
    }) => {
      const response = await fetch('/api/analytics/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          truckId,
          inquiryType,
          customerName,
          customerEmail,
          customerPhone,
          message,
          priority
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create inquiry');
      }

      return response.json();
    }
  });

  return {
    trackEvent: trackEvent.mutate,
    createInquiry: createInquiry.mutate,
    isTracking: trackEvent.isPending,
    isCreatingInquiry: createInquiry.isPending
  };
}