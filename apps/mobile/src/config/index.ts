 
const API_URL: string = process.env.API_URL ?? 'https://api.travelmatch.com';

const config = {
  apiUrl: API_URL,
  apiTimeout: 10000,
  appName: 'TravelMatch',
  version: '1.0.0',
};

export default config;

// Re-export config modules
export {
  config as env,
  isProduction,
  isDevelopment,
  isTest,
  API_CONFIG,
  UPLOAD_CONFIG,
  FEATURES,
} from './env';
export { initializeFeatureFlags, getFeatureFlagService } from './featureFlags';
export {
  linkingConfig,
  DEEP_LINK_PATTERNS,
  generateDeepLink,
  generateWebLink,
  openURL,
  openEmail,
  openPhone,
  openMaps,
} from './deepLinking';
