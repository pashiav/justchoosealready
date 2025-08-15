'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

// Extend Window interface for PostHog
declare global {
  interface Window {
    posthog: typeof posthog;
  }
}

// Initialize PostHog on the client side (similar to _app.tsx pattern)
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Any PostHog logic that needs to run on mount
    if (typeof window !== 'undefined' && window.posthog) {
      console.log('PostHog is ready');
    }
  }, []);

  return <>{children}</>;
}
