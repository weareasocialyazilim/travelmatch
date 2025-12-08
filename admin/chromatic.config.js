module.exports = {
  // Chromatic configuration for Admin Panel
  
  projectToken: process.env.CHROMATIC_ADMIN_PROJECT_TOKEN,
  
  buildScriptName: 'build',
  storybookBuildDir: 'storybook-static',
  
  exitZeroOnChanges: process.env.CI === 'true',
  exitOnceUploaded: process.env.CI === 'true',
  
  autoAcceptChanges: 'main',
  
  delay: 500,
  diffThreshold: 0.05,
  
  browsers: [
    'chrome',
    'firefox',
    'edge',
  ],
  
  viewports: [
    { width: 1280, height: 720, name: 'Laptop' },
    { width: 1920, height: 1080, name: 'Desktop FHD' },
    { width: 2560, height: 1440, name: 'Desktop QHD' },
    { width: 3840, height: 2160, name: 'Desktop 4K' },
  ],
  
  parallelism: 4,
  onlyChanged: true,
  zip: true,
  
  // Admin-specific ignores
  ignoreLastBuildOnBranch: ['main', 'staging'],
};
