import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard } from 'lucide-react';

interface DealerProtectedRouteProps {
  children: React.ReactNode;
}

export default function DealerProtectedRoute({ children }: DealerProtectedRouteProps) {
  const { isAuthenticated, isLoading, dealer } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/dealer/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !dealer) {
    return null;
  }

  // Free dealer accounts - subscription check removed

  return <>{children}</>;
}