// src/hooks/useFunnelTracker.ts
import { useGoogleAnalytics } from './useGoogleAnalytics';

export const useFunnelTracker = (funnelName: string) => {
  const { trackFunnelStep } = useGoogleAnalytics();

  const trackStep = (stepName: string, stepNumber: number, metadata?: any) => {
    const userId = localStorage.getItem('user_id') || 'anonymous';
    
    // Store funnel progress in localStorage
    const funnelKey = `funnel_${funnelName}_${userId}`;
    const funnelData = JSON.parse(localStorage.getItem(funnelKey) || '{"steps":[]}');
    
    // Only track if this step hasn't been recorded yet
    if (!funnelData.steps.includes(stepNumber)) {
      funnelData.steps.push(stepNumber);
      localStorage.setItem(funnelKey, JSON.stringify(funnelData));
      
      // Track to Google Analytics
      trackFunnelStep(funnelName, stepName, stepNumber, userId);
      
      // Store metadata if provided
      if (metadata) {
        const metadataKey = `funnel_${funnelName}_${stepNumber}_${userId}`;
        localStorage.setItem(metadataKey, JSON.stringify(metadata));
      }
    }
  };

  const getFunnelCompletion = () => {
    const userId = localStorage.getItem('user_id') || 'anonymous';
    const funnelKey = `funnel_${funnelName}_${userId}`;
    const funnelData = JSON.parse(localStorage.getItem(funnelKey) || '{"steps":[]}');
    return funnelData.steps.length;
  };

  return { trackStep, getFunnelCompletion };
};