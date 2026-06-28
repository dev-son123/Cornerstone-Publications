// src/hooks/useAnalytics.ts
// Google Analytics 4 event tracking via GTM dataLayer
// Works with your existing GTM-N3F2JJBS + GA4 G-1E3B94P1BX setup
//
// USAGE:
//   import { useAnalytics } from '@/hooks/useAnalytics';
//   const { trackEvent } = useAnalytics();
//   trackEvent('form_submit', { form_name: 'contact' });

import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Extend window type for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function useAnalytics() {
  const location = useLocation();

  // ── Push event to GTM dataLayer ──────────────────────────
  const trackEvent = useCallback((eventName: string, params: Record<string, any> = {}) => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        page_path: location.pathname,
        ...params,
      });
    } catch (e) {
      console.warn('[Analytics] Failed to track event:', eventName, e);
    }
  }, [location]);

  // ── Pre-built event helpers ───────────────────────────────

  // Contact form submitted
  const trackContactForm = useCallback(() => {
    trackEvent('contact_form_submit', {
      event_category: 'engagement',
      event_label: 'Contact & Support page',
    });
  }, [trackEvent]);

  // Manuscript form submitted
  const trackManuscriptSubmit = useCallback(() => {
    trackEvent('manuscript_submit', {
      event_category: 'conversion',
      event_label: 'Journal submission form',
    });
  }, [trackEvent]);

  // CTA button clicked
  const trackCTAClick = useCallback((label: string) => {
    trackEvent('cta_click', {
      event_category: 'engagement',
      event_label: label,
    });
  }, [trackEvent]);

  // Payment initiated
  const trackPayment = useCallback((productName: string, amount: number) => {
    trackEvent('payment_initiated', {
      event_category: 'revenue',
      event_label: productName,
      value: amount,
      currency: 'INR',
    });
  }, [trackEvent]);

  // Journal page view
  const trackJournalView = useCallback((section: string) => {
    trackEvent('journal_section_view', {
      event_category: 'content',
      event_label: section,
    });
  }, [trackEvent]);

  // Paper template downloaded
  const trackTemplateDownload = useCallback(() => {
    trackEvent('template_download', {
      event_category: 'engagement',
      event_label: 'JCNAP Paper Template',
    });
  }, [trackEvent]);

  // AI tool used
  const trackAIToolUse = useCallback((toolName: string) => {
    trackEvent('ai_tool_used', {
      event_category: 'feature',
      event_label: toolName,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackContactForm,
    trackManuscriptSubmit,
    trackCTAClick,
    trackPayment,
    trackJournalView,
    trackTemplateDownload,
    trackAIToolUse,
  };
}
