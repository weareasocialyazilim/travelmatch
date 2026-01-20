const path = require("path");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

// Sentry + Expo default config
const config = getSentryExpoConfig(projectRoot);

// ✅ Don't watch entire monorepo (apps/web/app can confuse Expo Router detection)
// Only watch packages we actually need:
const workspaceFolders = [
  path.resolve(monorepoRoot, "packages"),
];

config.watchFolders = [...(config.watchFolders || []), ...workspaceFolders];

// Node resolution (pnpm + monorepo)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = false;

// Note: @/ path aliases are handled by Babel module-resolver (babel.config.js)
// Note: Entry point is defined in package.json "main" field

module.exports = config;