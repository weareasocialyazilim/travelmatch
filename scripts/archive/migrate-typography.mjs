#!/usr/bin/env node

/**
 * Typography Token Migration Script
 * 
 * Automatically converts inline fontSize styles to TYPOGRAPHY tokens
 * 
 * Usage:
 *   node scripts/migrate-typography.mjs [--dry-run] [--path apps/mobile/src]
 */

import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const pathArg = args.find(arg => arg.startsWith('--path='));
const searchPath = pathArg ? pathArg.split('=')[1] : 'apps/mobile/src';

console.log(`
🎨 Typography Token Migration
==============================
Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE (will modify files)'}
Path: ${searchPath}
`);

// Font size to TYPOGRAPHY token mapping
const FONT_SIZE_MAP = {
  12: 'TYPOGRAPHY.caption',
  13: 'TYPOGRAPHY.caption',
  14: 'TYPOGRAPHY.bodySmall',
  15: 'TYPOGRAPHY.body',
  16: 'TYPOGRAPHY.bodyLarge',
  17: 'TYPOGRAPHY.bodyLarge',
  18: 'TYPOGRAPHY.h4',
  20: 'TYPOGRAPHY.h3',
  24: 'TYPOGRAPHY.h2',
  28: 'TYPOGRAPHY.h1',
  32: 'TYPOGRAPHY.display2',
  36: 'TYPOGRAPHY.display1',
};

async function findFilesWithInlineFontSize() {
  console.log('🔍 Searching for files with inline fontSize...\n');
  
  const { stdout } = await execAsync(
    `cd ${searchPath} && grep -r "fontSize:" --include="*.tsx" --include="*.ts" -l | head -50`
  );
  
  return stdout.trim().split('\n').filter(Boolean);
}

async function migrateFile(filePath) {
  // Security: Validate file path to prevent path traversal
  const resolvedSearchPath = path.resolve(searchPath);
  const fullPath = path.resolve(searchPath, filePath);
  if (!fullPath.startsWith(resolvedSearchPath)) {
    console.error(`⚠️ Skipping ${filePath} - path traversal detected`);
    return { filePath, changesMade: 0, skipped: true };
  }
  
  const content = await readFile(fullPath, 'utf-8');
  let modified = content;
  let changesMade = 0;

  // Check if TYPOGRAPHY import already exists
  const hasTypographyImport = /import.*TYPOGRAPHY.*from.*theme\/typography/.test(content);
  const hasColorsImport = /import.*COLORS.*from.*constants\/colors/.test(content);

  // Track fontSize usages
  const fontSizeRegex = /fontSize:\s*(\d+)/g;
  const matches = [...content.matchAll(fontSizeRegex)];

  if (matches.length === 0) {
    return { filePath, changesMade: 0, skipped: true };
  }

  console.log(`\n📄 ${filePath}`);
  console.log(`   Found ${matches.length} inline fontSize usages`);

  // Replace inline fontSize with tokens
  for (const match of matches) {
    const fontSize = parseInt(match[1]);
    const token = FONT_SIZE_MAP[fontSize];
    
    if (token) {
      // Pattern: fontSize: 16, -> ...TYPOGRAPHY.bodyLarge,
      const inlinePattern = new RegExp(`fontSize:\\s*${fontSize},`, 'g');
      modified = modified.replace(inlinePattern, `...${token},`);
      changesMade++;
    }
  }

  // Add TYPOGRAPHY import if not present and changes were made
  if (changesMade > 0 && !hasTypographyImport) {
    // Find the COLORS import line to add TYPOGRAPHY import nearby
    if (hasColorsImport) {
      modified = modified.replace(
        /(import.*COLORS.*from.*constants\/colors.*;)/,
        `$1\nimport { TYPOGRAPHY } from '@/theme/typography';`
      );
    } else {
      // Add at top after React imports
      modified = modified.replace(
        /(import React[^;]*;)/,
        `$1\nimport { TYPOGRAPHY } from '@/theme/typography';`
      );
    }
  }

  // Only write if in live mode and changes were made
  if (!isDryRun && changesMade > 0) {
    // Security: Path already validated at start of function
    await writeFile(fullPath, modified, 'utf-8');
    console.log(`   ✅ Migrated ${changesMade} fontSize usages`);
  } else if (changesMade > 0) {
    console.log(`   [DRY RUN] Would migrate ${changesMade} fontSize usages`);
  }

  return { filePath, changesMade, skipped: false };
}

async function main() {
  try {
    const files = await findFilesWithInlineFontSize();
    
    if (files.length === 0) {
      console.log('✅ No files with inline fontSize found!\n');
      return;
    }

    console.log(`Found ${files.length} files with inline fontSize\n`);

    const results = [];
    for (const file of files) {
      try {
        const result = await migrateFile(file);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error migrating ${file}:`, error.message);
      }
    }

    // Summary
    const totalChanges = results.reduce((sum, r) => sum + r.changesMade, 0);
    const filesModified = results.filter(r => r.changesMade > 0).length;
    const filesSkipped = results.filter(r => r.skipped).length;

    console.log(`\n📊 Migration Summary`);
    console.log(`===================`);
    console.log(`Files scanned: ${files.length}`);
    console.log(`Files modified: ${filesModified}`);
    console.log(`Files skipped: ${filesSkipped}`);
    console.log(`Total changes: ${totalChanges}`);

    if (isDryRun) {
      console.log(`\n💡 Run without --dry-run to apply changes\n`);
    } else {
      console.log(`\n✅ Migration complete!\n`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
