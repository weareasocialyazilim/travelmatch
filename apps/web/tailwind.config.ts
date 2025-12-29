import type { Config } from 'tailwindcss';
// @ts-expect-error - design-system exports preset but types aren't built
import designSystemPreset from '@travelmatch/design-system/src/tailwind.preset';
import tailwindcssAnimate from 'tailwindcss-animate';
// @ts-expect-error - types exist but module resolution differs
import typography from '@tailwindcss/typography';

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
  plugins: [tailwindcssAnimate, typography],
};

export default config;
