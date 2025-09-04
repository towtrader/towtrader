import { useState, useEffect, createContext, useContext } from 'react';
import { Dealer } from '@shared/schema';

interface AuthContextType {
  dealer: Dealer | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithToken: (token: string, dealer: Dealer) => void;
  logout: () => void;
  clearAuthState: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('dealerToken');
    console.log('useAuth initialization - savedToken:', savedToken ? 'exists' : 'none');
    
    if (savedToken) {
      console.log('Found saved token, setting token state');
      setToken(savedToken);
    } else {
      console.log('No saved token, setting isLoading to false');
      setIsLoading(false);
    }
  }, []); // Only run on mount

  // Separate effect for when token changes
  useEffect(() => {
    if (token && !dealer) {
      console.log('Token exists but no dealer data, fetching profile...');
      setIsLoading(true);
      fetchDealerProfile();
    }
  }, [token]);

  const fetchDealerProfile = async () => {
    if (!token) {
      console.log('fetchDealerProfile: No token, setting loading to false');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching dealer profile with token:', token?.substring(0, 8) + '...');
      const response = await fetch('/api/dealers/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const dealerData = await response.json();
        console.log('Successfully fetched dealer profile:', dealerData.companyName);
        setDealer(dealerData);
      } else {
        console.log('Failed to fetch dealer profile, response status:', response.status);
        // Token invalid, clear everything
        clearAuthState();
      }
    } catch (error) {
      console.error('Failed to fetch dealer profile:', error);
      // Clear everything on error
      clearAuthState();
    } finally {
      console.log('fetchDealerProfile: Setting loading to false');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      const response = await fetch('/api/dealers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, received data:', { 
          hasToken: !!data.token, 
          hasDealer: !!data.dealer,
          dealerName: data.dealer?.companyName 
        });
        
        // Set token and dealer data simultaneously
        localStorage.setItem('dealerToken', data.token);
        
        setToken(data.token);
        setDealer(data.dealer);
        setIsLoading(false);
        return true;
      } else {
        console.log('Login failed with status:', response.status);
        const errorData = await response.json();
        console.log('Error response:', errorData);
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const loginWithToken = (newToken: string, dealerData: Dealer) => {
    console.log('loginWithToken called with:', { token: newToken.substring(0, 8) + '...', dealer: dealerData.companyName });
    localStorage.setItem('dealerToken', newToken);
    setToken(newToken);
    setDealer(dealerData);
    console.log('Auth state updated - isAuthenticated should be:', !!dealerData);
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/dealers/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setDealer(null);
    setToken(null);
    setIsLoading(false);
    localStorage.removeItem('dealerToken');
  };

  // Helper function to clear all auth state
  const clearAuthState = () => {
    console.log('Clearing all authentication state');
    setDealer(null);
    setToken(null);
    setIsLoading(false);
    localStorage.removeItem('dealerToken');
  };

  return {
    dealer,
    token,
    login,
    loginWithToken,
    logout,
    clearAuthState,
    isAuthenticated: !!dealer,
    isLoading,
  };
}

export { AuthContext };