import type { Config } from 'tailwindcss';
import designSystemPreset from '@travelmatch/design-system/src/tailwind.preset';

/**
 * TravelMatch Landing Page - Tailwind Config
 * Extends the shared design system preset
 */

const config: Config = {
  presets: [designSystemPreset as Config],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
