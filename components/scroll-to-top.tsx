import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Don't scroll to top if we're navigating to search page and have stored scroll position
    // Let the search page handle its own scroll restoration
    const hasStoredScrollPosition = sessionStorage.getItem('marketplace-scroll-position');
    const isSearchPage = location === '/search' || location.startsWith('/search?');
    
    if (!(isSearchPage && hasStoredScrollPosition)) {
      // Add small delay to ensure page content has loaded
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 10);
    }
  }, [location]);

  return null;
}