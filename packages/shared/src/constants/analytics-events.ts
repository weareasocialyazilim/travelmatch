export const ANALYTICS_EVENTS = {
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  MOMENT_CREATED: 'moment_created',
  MOMENT_LISTED: 'moment_listed',
  PAYMENT_INIT: 'payment_init',
  PAYMENT_SUCCESS: 'payment_success',
  PROOF_UPLOADED: 'proof_uploaded',
  ADMIN_ACTION: 'admin_action',
  ERROR_TOAST_SHOWN: 'error_toast_shown',
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
