// src/hooks/usePageTimeTracker.ts
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGoogleAnalytics } from './useGoogleAnalytics';

export const usePageTimeTracker = (pageName: string) => {
  const location = useLocation();
  const { trackTimeSpent } = useGoogleAnalytics();
  const startTimeRef = useRef(Date.now());
  const pageNameRef = useRef(pageName);
  const isActiveRef = useRef(true);

  useEffect(() => {
    // Reset timer when page changes
    pageNameRef.current = pageName;
    startTimeRef.current = Date.now();
    isActiveRef.current = true;

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop tracking
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent > 2 && isActiveRef.current) {
          trackTimeSpent(pageNameRef.current + ' (hidden)', timeSpent, 'page_hidden');
        }
      } else {
        // Page is visible again, restart timer
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      const endTime = Date.now();
      const timeSpent = Math.round((endTime - startTimeRef.current) / 1000); // in seconds
      
      if (timeSpent > 2 && isActiveRef.current) { // Only track if user spent more than 2 seconds
        trackTimeSpent(pageNameRef.current, timeSpent);
        
        // Also store in localStorage for analytics dashboard
        const today = new Date().toISOString().split('T')[0];
        const key = `time_spent_${pageNameRef.current.replace(/\s+/g, '_').toLowerCase()}_${today}`;
        const existingData = JSON.parse(localStorage.getItem(key) || '{"count":0,"total":0,"sessions":[]}');
        const newData = {
          count: existingData.count + 1,
          total: existingData.total + timeSpent,
          avg: Math.round((existingData.total + timeSpent) / (existingData.count + 1)),
          sessions: [...existingData.sessions, {
            start: new Date(startTimeRef.current).toISOString(),
            end: new Date().toISOString(),
            duration: timeSpent
          }]
        };
        localStorage.setItem(key, JSON.stringify(newData));
        
        // Track total time spent on site
        const totalTimeKey = 'total_time_spent_site';
        const totalTime = parseInt(localStorage.getItem(totalTimeKey) || '0');
        localStorage.setItem(totalTimeKey, (totalTime + timeSpent).toString());
      }
      
      isActiveRef.current = false;
    };
  }, [location.pathname, pageName, trackTimeSpent]);

  return null;
};