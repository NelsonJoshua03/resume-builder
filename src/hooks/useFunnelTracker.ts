import { useGoogleAnalytics } from './useGoogleAnalytics';

export const useFunnelTracker = (funnelName: string) => {
  const { trackFunnelStep } = useGoogleAnalytics();

  const trackStep = (stepName: string, stepNumber: number, metadata?: any) => {
    const userId = localStorage.getItem('user_id') || 'anonymous';
    
    // Store funnel progress
    const funnelKey = `funnel_${funnelName}`;
    const funnelData = JSON.parse(localStorage.getItem(funnelKey) || '{"steps":[], "users":{}}');
    
    // Track user-specific progress
    if (!funnelData.users[userId]) {
      funnelData.users[userId] = { steps: [], startTime: new Date().toISOString() };
    }
    
    const userSteps = funnelData.users[userId].steps;
    
    if (!userSteps.includes(stepNumber)) {
      userSteps.push(stepNumber);
      userSteps.sort((a: number, b: number) => a - b);
      
      // Calculate time to reach this step
      const startTime = new Date(funnelData.users[userId].startTime);
      const currentTime = new Date();
      const timeToStep = Math.round((currentTime.getTime() - startTime.getTime()) / 1000);
      
      localStorage.setItem(funnelKey, JSON.stringify(funnelData));
      
      // Track to Google Analytics - BOTH properties
      trackFunnelStep(funnelName, stepName, stepNumber, userId);
      
      // Send enhanced event to both properties
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'funnel_step_enhanced', {
          funnel_name: funnelName,
          step: stepName,
          step_number: stepNumber,
          user_id: userId,
          time_to_step_seconds: timeToStep,
          total_steps_completed: userSteps.length,
          ...metadata,
          send_to: 'G-SW5M9YN8L5'
        });
        
        window.gtag('event', 'funnel_step_enhanced', {
          funnel_name: funnelName,
          step: stepName,
          step_number: stepNumber,
          user_id: userId,
          time_to_step_seconds: timeToStep,
          total_steps_completed: userSteps.length,
          ...metadata,
          send_to: 'G-WSKZJDJW77'
        });
      }
      
      // Store metadata
      if (metadata) {
        const metadataKey = `funnel_${funnelName}_${stepNumber}_${userId}`;
        localStorage.setItem(metadataKey, JSON.stringify({
          ...metadata,
          timestamp: new Date().toISOString(),
          timeToStep
        }));
      }
    }
  };

  const getFunnelCompletion = (userId?: string) => {
    const targetUserId = userId || localStorage.getItem('user_id') || 'anonymous';
    const funnelKey = `funnel_${funnelName}`;
    const funnelData = JSON.parse(localStorage.getItem(funnelKey) || '{"steps":[], "users":{}}');
    
    if (funnelData.users[targetUserId]) {
      return funnelData.users[targetUserId].steps.length;
    }
    return 0;
  };

  const getFunnelDropoff = () => {
    const funnelKey = `funnel_${funnelName}`;
    const funnelData = JSON.parse(localStorage.getItem(funnelKey) || '{"steps":[], "users":{}}');
    
    const userCounts = Object.values(funnelData.users).map((user: any) => ({
      steps: user.steps.length,
      started: user.startTime
    }));
    
    return userCounts;
  };

  return { trackStep, getFunnelCompletion, getFunnelDropoff };
};