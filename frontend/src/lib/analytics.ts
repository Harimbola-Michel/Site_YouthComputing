'use client';

type EventParams = Record<string, string | number | boolean>;

// Interface pour les événements analytics
interface AnalyticsEvent {
  name: string;
  params?: EventParams;
}

class Analytics {
  private enabled: boolean = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

  // Track un événement
  track(eventName: string, params?: EventParams): void {
    if (!this.enabled) return;

    try {
      // Google Analytics (si installé)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, params);
      }

      // Console log en développement
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', { event: eventName, params });
      }

      // Autres services d'analytics...
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Page view
  pageView(url: string, title?: string): void {
    if (!this.enabled) return;

    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
          page_title: title,
        });
      }
    } catch (error) {
      console.error('Analytics page view error:', error);
    }
  }

  // Events prédéfinis
  events = {
    // Auth
    userLogin: (method: string) => this.track('user_login', { method }),
    userLogout: () => this.track('user_logout'),
    userRegister: () => this.track('user_register'),
    userPasswordReset: () => this.track('user_password_reset'),
    userEmailVerified: () => this.track('user_email_verified'),

    // Formations
    formationView: (formationId: string, title: string) =>
      this.track('formation_view', { formation_id: formationId, title }),
    formationRegister: (formationId: string) =>
      this.track('formation_register', { formation_id: formationId }),
    formationSearch: (query: string) =>
      this.track('formation_search', { query }),

    // Y2C
    y2cRegister: () => this.track('y2c_register'),
    y2cEventRegister: (eventId: string) =>
      this.track('y2c_event_register', { event_id: eventId }),

    // Contact
    contactSubmit: () => this.track('contact_submit'),

    // Admin
    adminLogin: () => this.track('admin_login'),
    adminAction: (action: string, resource: string) =>
      this.track('admin_action', { action, resource }),

    // Social
    socialShare: (platform: string, content: string) =>
      this.track('social_share', { platform, content }),

    // CTA
    ctaClick: (ctaName: string, location: string) =>
      this.track('cta_click', { cta_name: ctaName, location }),

    // Error
    error: (message: string, source: string) =>
      this.track('error', { message, source }),
  };

  // Set user ID
  setUserId(userId: string): void {
    if (!this.enabled) return;

    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('set', 'user_id', userId);
      }
    } catch (error) {
      console.error('Analytics set user error:', error);
    }
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>): void {
    if (!this.enabled) return;

    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('set', 'user_properties', properties);
      }
    } catch (error) {
      console.error('Analytics set user properties error:', error);
    }
  }
}

export const analytics = new Analytics();

// Hook pour utiliser analytics dans les composants React
export function useAnalytics() {
  return analytics;
}