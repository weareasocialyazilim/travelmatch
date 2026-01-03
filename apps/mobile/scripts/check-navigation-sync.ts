#!/usr/bin/env npx ts-node
/**
 * Navigation Sync Check Script
 *
 * Ensures routeParams.ts and AppNavigator.tsx are in sync.
 * Run this in CI to catch navigation mismatches before deployment.
 *
 * Usage:
 *   npx ts-node scripts/check-navigation-sync.ts
 *   OR add to package.json: "check:nav": "ts-node scripts/check-navigation-sync.ts"
 *
 * Exit codes:
 *   0 - All routes are in sync
 *   1 - Mismatch found (routes declared but not registered)
 */

import * as fs from 'fs';
import * as path from 'path';

const ROUTE_PARAMS_PATH = path.join(__dirname, '../src/navigation/routeParams.ts');
const APP_NAVIGATOR_PATH = path.join(__dirname, '../src/navigation/AppNavigator.tsx');

interface SyncResult {
  declared: string[];
  registered: string[];
  missing: string[];
  extra: string[];
}

function extractDeclaredRoutes(content: string): string[] {
  const routes: string[] = [];

  // Match route names in RootStackParamList type definition
  // Pattern: RouteName: { ... } | undefined;
  const typeMatch = content.match(/export type RootStackParamList = \{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);

  if (typeMatch) {
    const typeBody = typeMatch[1];
    // Match each route declaration
    const routePattern = /^\s*(\w+):/gm;
    let match;
    while ((match = routePattern.exec(typeBody)) !== null) {
      routes.push(match[1]);
    }
  }

  return routes;
}

function extractRegisteredScreens(content: string): string[] {
  const screens: string[] = [];

  // Match Stack.Screen name="RouteName"
  const screenPattern = /<Stack\.Screen\s+name="(\w+)"/g;
  let match;
  while ((match = screenPattern.exec(content)) !== null) {
    screens.push(match[1]);
  }

  // Also match conditional screens: {__DEV__ && <Stack.Screen name="..."
  const conditionalPattern = /\{__DEV__\s*&&\s*\(\s*<Stack\.Screen\s+name="(\w+)"/g;
  while ((match = conditionalPattern.exec(content)) !== null) {
    screens.push(match[1]);
  }

  return screens;
}

function checkSync(): SyncResult {
  const routeParamsContent = fs.readFileSync(ROUTE_PARAMS_PATH, 'utf-8');
  const appNavigatorContent = fs.readFileSync(APP_NAVIGATOR_PATH, 'utf-8');

  const declared = extractDeclaredRoutes(routeParamsContent);
  const registered = extractRegisteredScreens(appNavigatorContent);

  const declaredSet = new Set(declared);
  const registeredSet = new Set(registered);

  // Routes declared in routeParams but not registered in AppNavigator
  const missing = declared.filter(route => !registeredSet.has(route));

  // Screens registered in AppNavigator but not declared in routeParams
  const extra = registered.filter(screen => !declaredSet.has(screen));

  return { declared, registered, missing, extra };
}

function main() {
  console.log('🔍 Checking Navigation Sync...\n');

  try {
    const result = checkSync();

    console.log(`📋 Declared routes in routeParams.ts: ${result.declared.length}`);
    console.log(`📋 Registered screens in AppNavigator.tsx: ${result.registered.length}\n`);

    let hasErrors = false;

    if (result.missing.length > 0) {
      hasErrors = true;
      console.log('❌ MISSING SCREENS (declared but not registered):');
      console.log('   These routes will cause runtime crashes if navigated to!\n');
      result.missing.forEach(route => {
        console.log(`   - ${route}`);
      });
      console.log('');
    }

    if (result.extra.length > 0) {
      console.log('⚠️  EXTRA SCREENS (registered but not declared):');
      console.log('   These screens lack TypeScript type safety.\n');
      result.extra.forEach(screen => {
        console.log(`   - ${screen}`);
      });
      console.log('');
    }

    if (hasErrors) {
      console.log('💥 Navigation sync check FAILED');
      console.log('   Please add missing screens to AppNavigator.tsx');
      console.log('   or remove unused routes from routeParams.ts\n');
      process.exit(1);
    }

    if (result.extra.length > 0) {
      console.log('⚠️  Navigation sync check passed with warnings');
    } else {
      console.log('✅ Navigation sync check PASSED');
      console.log('   All declared routes have registered screens.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('💥 Error running navigation sync check:', error);
    process.exit(1);
  }
}

main();
