#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const mobileDir = path.resolve(__dirname, '..', 'apps', 'mobile');
process.chdir(mobileDir);

const jestArgs = ['jest', '--config', 'jest.config.js', '--rootDir', '.', '--bail', '--findRelatedTests', '--passWithNoTests', ...args];

const res = spawnSync('npx', jestArgs, { stdio: 'inherit' });
process.exit(res.status);
