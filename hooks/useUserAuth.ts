import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@shared/schema';

interface UserAuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
}

export function useUserAuthProvider(): UserAuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check server session first, then fallback to localStorage
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
          // Server session expired - clear everything and require fresh login
          console.log('Server session expired, clearing local auth state');
          localStorage.removeItem('currentUser');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Fallback to localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem('currentUser');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if this is a dealer login response
        if (data.accountType === 'dealer') {
          // Store dealer token and redirect to home page
          localStorage.setItem('dealerToken', data.token);
          localStorage.setItem('currentDealer', JSON.stringify(data.dealer));
          if (data.user) {
            localStorage.setItem('currentDealerUser', JSON.stringify(data.user));
          }
          // Redirect to home page
          window.location.href = '/';
          return true;
        }
        
        // Handle individual user login
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('currentUser');
    // Force page reload to clear any cached session state
    window.location.href = '/';
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };
}

export { UserAuthContext };