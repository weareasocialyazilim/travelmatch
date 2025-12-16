const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Production optimization: Enhanced minification
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Compress options
    compress: {
      // Remove all console.* calls in production (except error, warn via Babel)
      drop_console: false, // Handled by Babel plugin
      drop_debugger: true, // Remove debugger statements

      // Remove dead code
      dead_code: true,
      unused: true,

      // Optimize boolean expressions
      booleans: true,

      // Remove unnecessary code
      conditionals: true,
      evaluate: true,

      // Join consecutive var statements
      join_vars: true,

      // Optimize if-s with returns
      if_return: true,

      // Hoist function declarations
      hoist_funs: true,

      // Optimize loops
      loops: true,

      // Pure functions can be removed if unused
      pure_funcs: [
        'console.log',
        'console.info',
        'console.debug',
        'console.trace',
      ],
    },

    // Mangle options (shorten variable names)
    mangle: {
      // Shorten variable names
      toplevel: false, // Don't mangle top-level names (may break some code)
      keep_classnames: false, // Mangle class names
      keep_fnames: false, // Mangle function names

      // Safari 10 compatibility
      safari10: true,
    },

    // Output options
    output: {
      // Remove comments
      comments: false,

      // ASCII only (for better compatibility)
      ascii_only: true,

      // Beautify code (false for production)
      beautify: false,
    },
  },
};

module.exports = config;
