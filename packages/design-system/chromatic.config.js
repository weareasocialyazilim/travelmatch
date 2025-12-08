module.exports = {
  // Chromatic configuration for Design System
  
  // Project settings
  projectToken: process.env.CHROMATIC_PROJECT_TOKEN || process.env.CHROMATIC_TOKEN,
  
  // Build settings
  buildScriptName: 'build-storybook',
  storybookBuildDir: 'storybook-static',
  
  // Test settings
  exitZeroOnChanges: process.env.CI === 'true',
  exitOnceUploaded: process.env.CI === 'true',
  
  // Ignore patterns
  ignoreLastBuildOnBranch: 'main',
  
  // Auto-accept changes on main branch
  autoAcceptChanges: 'main',
  
  // Delays and thresholds
  delay: 300, // Wait 300ms before screenshot
  diffThreshold: 0.05, // 5% threshold for visual changes
  
  // Browser settings
  browsers: [
    'chrome',
    'safari',
    'firefox',
    'edge',
  ],
  
  // Viewport settings
  viewports: [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 390, height: 844, name: 'iPhone 12/13' },
    { width: 428, height: 926, name: 'iPhone 14 Pro Max' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1024, height: 1366, name: 'iPad Pro' },
    { width: 1920, height: 1080, name: 'Desktop FHD' },
  ],
  
  // Performance
  parallelism: 4,
  
  // Skip unchanged stories
  onlyChanged: true,
  externals: ['public/**'],
  
  // TurboSnap configuration
  zip: true,
  uploadSourceMaps: true,
};
