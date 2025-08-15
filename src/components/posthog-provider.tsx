'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog only on the client side
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: 'https://us.posthog.com',
        capture_exceptions: true,
        debug: process.env.NODE_ENV === 'development',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded successfully');
          }
        },
        on_request_error: (error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('PostHog request error:', error);
          }
        }
      });
    }
  }, []);

  return <>{children}</>;
}
