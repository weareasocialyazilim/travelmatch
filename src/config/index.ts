const API_URL =
  process.env.API_URL || 'https://api.travelmatch.com';

const config = {
  apiUrl: API_URL,
  apiTimeout: 10000,
  appName: 'TravelMatch',
  version: '1.0.0',
};

export default config;
