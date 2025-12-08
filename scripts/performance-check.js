#!/usr/bin/env node

/**
 * Performance Check Script
 * Validates performance budgets before deployment
 */

const fs = require('fs');
const path = require('path');

// Performance budgets
const BUDGETS = {
  loadTime: 2000, // 2s
  bundleSize: 5 * 1024 * 1024, // 5MB
  tti: 3000, // 3s
  fcp: 1500, // 1.5s
  lcp: 2500, // 2.5s
};

async function checkPerformance() {
  console.log('🔍 Checking performance budgets...\n');

  let passed = true;

  // Check bundle size
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    const totalSize = getTotalSize(distPath);
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    
    console.log(`📦 Bundle Size: ${sizeMB}MB / 5MB`);
    
    if (totalSize > BUDGETS.bundleSize) {
      console.error(`❌ Bundle size exceeds budget by ${((totalSize - BUDGETS.bundleSize) / 1024 / 1024).toFixed(2)}MB`);
      passed = false;
    } else {
      console.log('✅ Bundle size OK\n');
    }
  }

  // Check Lighthouse results
  const lhciPath = path.join(__dirname, '..', '.lighthouseci', 'manifest.json');
  if (fs.existsSync(lhciPath)) {
    const manifest = JSON.parse(fs.readFileSync(lhciPath, 'utf8'));
    const summary = manifest[0]?.summary;
    
    if (summary) {
      console.log('🚦 Lighthouse Scores:');
      console.log(`   Performance: ${(summary.performance * 100).toFixed(0)}%`);
      console.log(`   Accessibility: ${(summary.accessibility * 100).toFixed(0)}%`);
      console.log(`   Best Practices: ${(summary['best-practices'] * 100).toFixed(0)}%`);
      console.log(`   SEO: ${(summary.seo * 100).toFixed(0)}%\n`);
      
      if (summary.performance < 0.9) {
        console.error(`❌ Performance score below 90%`);
        passed = false;
      } else {
        console.log('✅ Lighthouse scores OK\n');
      }
    }
  }

  if (passed) {
    console.log('✅ All performance budgets passed!\n');
    process.exit(0);
  } else {
    console.error('❌ Performance budgets failed!\n');
    process.exit(1);
  }
}

function getTotalSize(dir) {
  let total = 0;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      total += getTotalSize(filePath);
    } else if (!file.endsWith('.map')) {
      total += stat.size;
    }
  }
  
  return total;
}

checkPerformance().catch(err => {
  console.error('Error checking performance:', err);
  process.exit(1);
});
