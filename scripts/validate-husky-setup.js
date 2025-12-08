#!/usr/bin/env node

/**
 * Husky Setup Validation Script
 * Verifies that all git hooks and configurations are properly installed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warn: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
};

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log.success(`${description} exists`);
    return true;
  } else {
    log.error(`${description} not found`);
    return false;
  }
}

function checkFileExecutable(filePath, description) {
  try {
    const stats = fs.statSync(filePath);
    const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);
    if (isExecutable) {
      log.success(`${description} is executable`);
      return true;
    } else {
      log.warn(`${description} is not executable`);
      return false;
    }
  } catch (error) {
    log.error(`Cannot check ${description} permissions`);
    return false;
  }
}

function checkPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log.error('package.json not found');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Check devDependencies
  const hasHusky = packageJson.devDependencies?.husky;
  const hasLintStaged = packageJson.devDependencies?.['lint-staged'];

  if (hasHusky) {
    log.success('Husky installed in devDependencies');
  } else {
    log.error('Husky not found in devDependencies');
  }

  if (hasLintStaged) {
    log.success('lint-staged installed in devDependencies');
  } else {
    log.error('lint-staged not found in devDependencies');
  }

  // Check scripts
  const hasPrepare = packageJson.scripts?.prepare === 'husky';
  const hasValidate = packageJson.scripts?.validate;
  const hasTestStaged = packageJson.scripts?.['test:staged'];

  if (hasPrepare) {
    log.success('prepare script configured');
  } else {
    log.warn('prepare script missing or incorrect');
  }

  if (hasValidate) {
    log.success('validate script configured');
  } else {
    log.warn('validate script missing');
  }

  if (hasTestStaged) {
    log.success('test:staged script configured');
  } else {
    log.warn('test:staged script missing');
  }

  return hasHusky && hasLintStaged;
}

function checkNpmDependencies() {
  try {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      log.error('node_modules not found - run npm install');
      return false;
    }

    const huskyPath = path.join(nodeModulesPath, 'husky');
    const lintStagedPath = path.join(nodeModulesPath, 'lint-staged');

    if (fs.existsSync(huskyPath)) {
      log.success('Husky module installed');
    } else {
      log.error('Husky module not found');
      return false;
    }

    if (fs.existsSync(lintStagedPath)) {
      log.success('lint-staged module installed');
    } else {
      log.error('lint-staged module not found');
      return false;
    }

    return true;
  } catch (error) {
    log.error('Error checking npm dependencies');
    return false;
  }
}

function main() {
  console.log('\n🔍 Validating Husky + lint-staged Setup\n');
  console.log('━'.repeat(50) + '\n');

  let allValid = true;

  // Check package.json configuration
  console.log('📦 Checking package.json...');
  allValid = checkPackageJson() && allValid;
  console.log('');

  // Check npm dependencies
  console.log('📚 Checking npm dependencies...');
  allValid = checkNpmDependencies() && allValid;
  console.log('');

  // Check husky directory
  console.log('🐕 Checking Husky installation...');
  const huskyDir = path.join(process.cwd(), '.husky');
  allValid = checkFileExists(huskyDir, '.husky directory') && allValid;
  console.log('');

  // Check pre-commit hook
  console.log('🪝 Checking git hooks...');
  const preCommitHook = path.join(huskyDir, 'pre-commit');
  allValid = checkFileExists(preCommitHook, 'pre-commit hook') && allValid;
  allValid = checkFileExecutable(preCommitHook, 'pre-commit hook') && allValid;

  const prePushHook = path.join(huskyDir, 'pre-push');
  allValid = checkFileExists(prePushHook, 'pre-push hook') && allValid;
  allValid = checkFileExecutable(prePushHook, 'pre-push hook') && allValid;
  console.log('');

  // Check lint-staged configuration
  console.log('⚙️  Checking lint-staged config...');
  const lintStagedRc = path.join(process.cwd(), '.lintstagedrc.json');
  allValid = checkFileExists(lintStagedRc, '.lintstagedrc.json') && allValid;
  console.log('');

  // Check git installation
  console.log('🔧 Checking git...');
  try {
    execSync('git --version', { stdio: 'pipe' });
    log.success('Git is installed');
  } catch (error) {
    log.error('Git is not installed');
    allValid = false;
  }
  console.log('');

  // Final summary
  console.log('━'.repeat(50));
  if (allValid) {
    console.log(`\n${COLORS.green}✅ Setup is valid! All checks passed.${COLORS.reset}\n`);
    console.log('Next steps:');
    log.info('Make a commit to test pre-commit hook');
    log.info('Push to test pre-push hook');
    log.info('Run "npm run validate" to test full validation');
  } else {
    console.log(`\n${COLORS.red}❌ Setup has issues. Please fix the errors above.${COLORS.reset}\n`);
    console.log('Common fixes:');
    log.warn('Run: npm install');
    log.warn('Run: npm run prepare');
    log.warn('Run: chmod +x .husky/pre-commit .husky/pre-push');
  }
  console.log('');

  process.exit(allValid ? 0 : 1);
}

main();
