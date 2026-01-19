import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

type AnalyticsHandler = (metric: Metric) => void;

// Send to Google Analytics
const sendToGoogleAnalytics = ({ name, value, id }: Metric) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    });
  }
};

// Send to Firebase Analytics
const sendToFirebaseAnalytics = ({ name, value }: Metric) => {
  if (window.firebaseAnalytics) {
    window.firebaseAnalytics.logEvent(name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      metric_id: `${name}_${Date.now()}`,
    });
  }
};

// Log to console in development
const logToConsole = ({ name, value, rating }: Metric) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${name}:`, value.toFixed(2), `(${rating})`);
  }
};

// Track all Core Web Vitals
export const trackWebVitals = (onPerfEntry?: AnalyticsHandler) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onLCP(onPerfEntry);
    onFCP(onPerfEntry);
    onTTFB(onPerfEntry);
  } else {
    // Default tracking
    const handlers = [sendToGoogleAnalytics, sendToFirebaseAnalytics, logToConsole];
    
    handlers.forEach(handler => {
      onCLS(handler);
      onFID(handler);
      onLCP(handler);
      onFCP(handler);
      onTTFB(handler);
    });
  }
};

// Performance monitoring utility
export const performanceMonitor = {
  startTime: performance.now(),
  
  mark(name: string) {
    performance.mark(`careercraft-${name}`);
  },
  
  measure(name: string, startMark: string, endMark?: string) {
    performance.measure(`careercraft-${name}`, 
      `careercraft-${startMark}`, 
      endMark ? `careercraft-${endMark}` : undefined
    );
  },
  
  getMetrics() {
    const metrics = performance.getEntriesByType('measure');
    return metrics.filter(m => m.name.startsWith('careercraft-'));
  },
  
  clear() {
    performance.clearMarks();
    performance.clearMeasures();
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  // Mark app start
  performanceMonitor.mark('app-start');
  
  // Track page load performance
  window.addEventListener('load', () => {
    performanceMonitor.mark('page-loaded');
    performanceMonitor.measure('page-load-time', 'app-start', 'page-loaded');
    
    // Report to analytics
    const loadTime = performance.now() - performanceMonitor.startTime;
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'timing_complete', {
        name: 'page_load',
        value: Math.round(loadTime),
        event_category: 'Performance',
      });
    }
  });
  
  // Track route changes
  if (typeof window !== 'undefined' && window.history) {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      performanceMonitor.mark('route-change-start');
      originalPushState.apply(this, args);
    };
    
    window.history.replaceState = function(...args) {
      performanceMonitor.mark('route-change-start');
      originalReplaceState.apply(this, args);
    };
    
    window.addEventListener('popstate', () => {
      performanceMonitor.mark('route-change-start');
    });
  }
  
  // Track resource loading performance
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.initiatorType === 'script' || entry.initiatorType === 'css') {
        if (entry.duration > 1000 && process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Slow resource load: ${entry.name} took ${entry.duration.toFixed(0)}ms`);
        }
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
};