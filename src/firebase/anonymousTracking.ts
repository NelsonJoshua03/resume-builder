// src/firebase/anonymousTracking.ts
import { firebaseAnalytics } from './analytics';

export class AnonymousTrackingService {
  private static instance: AnonymousTrackingService;
  private isInitialized = false;
  private hasConsent = false;

  static getInstance(): AnonymousTrackingService {
    if (!AnonymousTrackingService.instance) {
      AnonymousTrackingService.instance = new AnonymousTrackingService();
    }
    return AnonymousTrackingService.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    this.hasConsent = localStorage.getItem('gdpr_consent') === 'accepted';
    
    // Track basic interactions for everyone
    this.trackBasicInteractions();
    
    // Track scroll depth
    this.trackScrollDepth();
    
    // Track time on page
    this.trackTimeOnPage();
    
    this.isInitialized = true;
    
    // Listen for consent changes
    this.setupConsentListener();
  }

  private setupConsentListener() {
    // Listen for consent changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'gdpr_consent') {
        this.hasConsent = e.newValue === 'accepted';
        
        if (this.hasConsent) {
          // Migrate anonymous user to consented
          firebaseAnalytics.migrateToConsentedUser();
          
          // Track consent given event
          firebaseAnalytics.trackEvent({
            eventName: 'gdpr_consent_given',
            eventCategory: 'User',
            eventLabel: 'consent_granted',
            pagePath: window.location.pathname,
            pageTitle: document.title,
            metadata: {
              consent_type: 'analytics',
              timestamp: new Date().toISOString()
            },
            consentGiven: true,
            dataProcessingLocation: 'IN'
          });
        }
      }
    });
  }

  private trackBasicInteractions() {
    // Track clicks on main CTAs
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, a[role="button"], .cta-button, [data-track="cta"]');
      
      if (button) {
        const buttonText = button.textContent?.trim() || 'unnamed_button';
        const buttonId = button.id || button.getAttribute('data-id') || 'unknown';
        
        firebaseAnalytics.trackEvent({
          eventName: 'button_click',
          eventCategory: 'Interaction',
          eventLabel: buttonText,
          pagePath: window.location.pathname,
          pageTitle: document.title,
          metadata: {
            button_text: buttonText.substring(0, 100),
            button_id: buttonId,
            element_type: button.tagName,
            is_anonymous: !this.hasConsent
          },
          consentGiven: this.hasConsent,
          dataProcessingLocation: 'IN'
        });
      }
    }, { capture: true });
  }

  private trackScrollDepth() {
    let scrollDepthTracked = {
      '25': false,
      '50': false,
      '75': false,
      '90': false
    };

    const trackScrollDepth = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);
      
      Object.keys(scrollDepthTracked).forEach(depth => {
        if (scrollPercentage >= parseInt(depth) && !scrollDepthTracked[depth as keyof typeof scrollDepthTracked]) {
          firebaseAnalytics.trackEvent({
            eventName: 'scroll_depth',
            eventCategory: 'Engagement',
            eventLabel: `${depth}%_scroll`,
            pagePath: window.location.pathname,
            pageTitle: document.title,
            metadata: {
              scroll_depth: parseInt(depth),
              current_scroll: scrollPercentage,
              is_anonymous: !this.hasConsent
            },
            consentGiven: this.hasConsent,
            dataProcessingLocation: 'IN'
          });
          scrollDepthTracked[depth as keyof typeof scrollDepthTracked] = true;
        }
      });
    };

    // Throttle scroll tracking
    let scrollTimer: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(trackScrollDepth, 500);
    });
  }

  private trackTimeOnPage() {
    const startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      
      if (timeSpent > 3) { // Only track if spent more than 3 seconds
        firebaseAnalytics.trackEvent({
          eventName: 'time_on_page',
          eventCategory: 'Engagement',
          eventLabel: 'page_time_spent',
          pagePath: window.location.pathname,
          pageTitle: document.title,
          eventValue: timeSpent,
          metadata: {
            time_spent_seconds: timeSpent,
            exit_time: new Date().toISOString(),
            is_anonymous: !this.hasConsent
          },
          consentGiven: this.hasConsent,
          dataProcessingLocation: 'IN'
        });
      }
    });
  }

  trackPageView(path: string, title: string) {
    firebaseAnalytics.trackEvent({
      eventName: 'page_view',
      eventCategory: 'Page',
      eventLabel: title,
      pagePath: path,
      pageTitle: title,
      metadata: {
        referrer: document.referrer,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        is_anonymous: !this.hasConsent
      },
      consentGiven: this.hasConsent,
      dataProcessingLocation: 'IN'
    });
  }

  getAnonymousUserId(): string {
    return sessionStorage.getItem('firebase_anonymous_id') || 
           `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getAnonymousSessionId(): string {
    return sessionStorage.getItem('firebase_session_id') || 
           `anon_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isAnonymous(): boolean {
    return !this.hasConsent;
  }
}

export const anonymousTracking = AnonymousTrackingService.getInstance();