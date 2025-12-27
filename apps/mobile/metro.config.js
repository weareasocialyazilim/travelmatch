const path = require('path');
const fs = require('fs');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getSentryExpoConfig(projectRoot);

// 1. Watch all files within the monorepo (include Expo's defaults)
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Keep hierarchical lookup enabled for Expo compatibility (SDK 54+)
config.resolver.disableHierarchicalLookup = false;

// 4. Handle path alias resolution for @/ imports
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle expo/AppEntry - redirect to our custom index.ts
  if (moduleName === 'expo/AppEntry' || moduleName === './node_modules/expo/AppEntry') {
    return {
      filePath: path.resolve(projectRoot, 'index.ts'),
      type: 'sourceFile',
    };
  }

  // Handle @/ path aliases - resolve to apps/mobile/src/
  if (moduleName.startsWith('@/')) {
    const aliasedPath = moduleName.replace('@/', '');
    const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    const srcPath = path.resolve(projectRoot, 'src', aliasedPath);

    // Check if it's a directory with index file
    if (fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory()) {
      for (const ext of possibleExtensions) {
        const indexPath = path.join(srcPath, `index${ext}`);
        if (fs.existsSync(indexPath)) {
          return {
            filePath: indexPath,
            type: 'sourceFile',
          };
        }
      }
    }

    // Check with extensions
    for (const ext of possibleExtensions) {
      const fullPath = `${srcPath}${ext}`;
      if (fs.existsSync(fullPath)) {
        return {
          filePath: fullPath,
          type: 'sourceFile',
        };
      }
    }
  }

  // Fallback to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

// 5. Production optimization: Enhanced minification
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