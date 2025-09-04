import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SaveListingParams {
  truckId?: number;
  trailerId?: number;
  listingType: 'truck' | 'trailer';
  title: string;
  isIndividual?: boolean;
}

export function useSaveListings({ truckId, trailerId, listingType, title, isIndividual = false }: SaveListingParams) {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const storageKey = isIndividual ? `saved-individual-${truckId || trailerId}` : `saved-${listingType}-${truckId || trailerId}`;

  // Check authentication status
  const { data: authUser } = useQuery<{ id: number } | null>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const isAuthenticated = !!authUser;

  // Check if listing is saved (authenticated users)
  const { data: savedStatus } = useQuery<{ isSaved: boolean }>({
    queryKey: ['/api/saved-listings/check', truckId || trailerId, listingType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (truckId) params.set('truckId', truckId.toString());
      if (trailerId) params.set('trailerId', trailerId.toString());
      params.set('listingType', listingType);
      
      const response = await fetch(`/api/saved-listings/check?${params}`);
      if (!response.ok) {
        throw new Error('Failed to check saved status');
      }
      return response.json();
    },
    enabled: isAuthenticated && (!!truckId || !!trailerId),
  });

  // Check localStorage for anonymous users
  useEffect(() => {
    if (isAuthenticated) {
      if (savedStatus) {
        setIsSaved(savedStatus.isSaved);
      }
    } else {
      // Check localStorage for anonymous users
      const saved = localStorage.getItem(storageKey) === 'true';
      setIsSaved(saved);
    }
  }, [savedStatus, isAuthenticated, storageKey]);

  // Save/unsave mutation for authenticated users
  const authenticatedSaveMutation = useMutation({
    mutationFn: async (save: boolean) => {
      if (save) {
        const response = await fetch('/api/saved-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            truckId,
            trailerId,
            listingType
          })
        });
        if (!response.ok) throw new Error('Failed to save listing');
        return response.json();
      } else {
        const response = await fetch('/api/saved-listings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ truckId, trailerId })
        });
        if (!response.ok) throw new Error('Failed to remove listing');
        return response.json();
      }
    },
    onSuccess: (_, save) => {
      setIsSaved(save);
      toast({
        title: save ? "Saved" : "Removed",
        description: save ? `${title} saved to your list` : `${title} removed from saved list`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-listings/check'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update saved status",
        variant: "destructive",
      });
    },
  });

  // Handle save toggle
  const handleSaveToggle = () => {
    if (isAuthenticated) {
      authenticatedSaveMutation.mutate(!isSaved);
    } else {
      // Handle anonymous users with localStorage
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      if (newSavedState) {
        localStorage.setItem(storageKey, 'true');
        toast({
          title: "Saved Locally",
          description: `${title} saved to your browser. Sign in to sync across devices.`,
        });
      } else {
        localStorage.removeItem(storageKey);
        toast({
          title: "Removed",
          description: `${title} removed from your local saves.`,
        });
      }
    }
  };

  return {
    isSaved,
    handleSaveToggle,
    isPending: authenticatedSaveMutation.isPending,
    isAuthenticated
  };
}