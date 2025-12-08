// src/hooks/useNavigationFix.ts
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigationFix = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fix for navigation getting stuck
    const handleNavigationError = () => {
      console.log('Navigation error detected, attempting to fix...');
      // Force a re-render of current route
      navigate(location.pathname, { replace: true });
    };

    // Listen for navigation issues
    window.addEventListener('popstate', handleNavigationError);
    
    // Clean up scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    return () => {
      window.removeEventListener('popstate', handleNavigationError);
    };
  }, [location, navigate]);

  // Reset scroll on location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return { location, navigate };
};