module.exports = {
  // Chromatic configuration for Mobile App
  
  projectToken: process.env.CHROMATIC_MOBILE_PROJECT_TOKEN,
  
  buildScriptName: 'storybook:generate',
  storybookBuildDir: 'storybook-static',
  
  exitZeroOnChanges: process.env.CI === 'true',
  exitOnceUploaded: process.env.CI === 'true',
  
  autoAcceptChanges: 'main',
  
  delay: 400,
  diffThreshold: 0.05,
  
  // Mobile browsers
  browsers: [
    'chrome', // Android Chrome
    'safari', // iOS Safari
  ],
  
  // Mobile viewports
  viewports: [
    // Small phones
    { width: 320, height: 568, name: 'iPhone SE (1st gen)' },
    { width: 375, height: 667, name: 'iPhone 6/7/8' },
    { width: 360, height: 640, name: 'Android Small' },
    
    // Medium phones
    { width: 375, height: 812, name: 'iPhone X/11 Pro' },
    { width: 390, height: 844, name: 'iPhone 12/13' },
    { width: 393, height: 852, name: 'iPhone 14' },
    { width: 360, height: 780, name: 'Android Medium' },
    
    // Large phones
    { width: 414, height: 896, name: 'iPhone 11/XR' },
    { width: 428, height: 926, name: 'iPhone 14 Pro Max' },
    { width: 412, height: 915, name: 'Android Large' },
    
    // Tablets
    { width: 768, height: 1024, name: 'iPad' },
    { width: 834, height: 1194, name: 'iPad Pro 11"' },
    { width: 1024, height: 1366, name: 'iPad Pro 12.9"' },
  ],
  
  parallelism: 6,
  onlyChanged: true,
  zip: true,
  
  // Mobile-specific settings
  disableAnimations: true, // Prevent animation flakiness
  pauseAnimationsAtEnd: true,
};
