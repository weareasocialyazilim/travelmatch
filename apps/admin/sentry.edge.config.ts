// This file configures the initialization of Sentry for Edge features (middleware, etc).
// The config you add here will be used whenever one of the Edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn:
    process.env.SENTRY_DSN ||
    'https://4e851e74a8a6ecab750e2f4a8933e6c8@o4510544957800448.ingest.de.sentry.io/4510550169354320',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
