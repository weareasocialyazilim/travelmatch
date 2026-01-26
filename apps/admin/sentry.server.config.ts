// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Production: 1% sampling for performance monitoring
  // Reduces Sentry quota usage while still capturing representative traces
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
