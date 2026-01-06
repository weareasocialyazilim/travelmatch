import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - design-system exports preset but types aren't built
import designSystemPreset from '../../packages/design-system/src/tailwind.preset';

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
};

export default config;
