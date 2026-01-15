#!/usr/bin/env node

/**
 * Lovendo Developer CLI (lovendo)
 *
 * A unified command-line interface for all development tasks
 *
 * Usage:
 *   lovendo dev          - Start development environment
 *   lovendo db           - Database commands
 *   lovendo test         - Run tests
 *   lovendo docker       - Docker commands
 *   lovendo deploy       - Deploy commands
 *   lovendo help         - Show help
 */

import { spawn, execSync } from 'child_process';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

function runCommandSync(command) {
  try {
    execSync(command, { stdio: 'inherit', shell: true });
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// Commands
// ============================================================================

const commands = {
  // Development
  dev: {
    description: 'Development environment',
    subcommands: {
      start: {
        description: 'Start all development servers',
        run: async () => {
          log('🚀 Starting development environment...', 'cyan');
          await runCommand('pnpm', ['dev']);
        },
      },
      mobile: {
        description: 'Start mobile app only',
        run: async () => {
          log('📱 Starting mobile app...', 'cyan');
          await runCommand('pnpm', ['--filter', '@lovendo/mobile', 'dev']);
        },
      },
      admin: {
        description: 'Start admin panel only',
        run: async () => {
          log('⚙️  Starting admin panel...', 'cyan');
          await runCommand('pnpm', ['--filter', 'admin', 'dev']);
        },
      },
      api: {
        description: 'Start API development',
        run: async () => {
          log('🔌 Starting Supabase functions...', 'cyan');
          await runCommand('supabase', ['functions', 'serve']);
        },
      },
    },
  },

  // Database
  db: {
    description: 'Database commands',
    subcommands: {
      start: {
        description: 'Start local Supabase',
        run: async () => {
          log('🗄️  Starting Supabase...', 'cyan');
          await runCommand('supabase', ['start']);
          log('\n✅ Supabase started!', 'green');
          runCommandSync('supabase status');
        },
      },
      stop: {
        description: 'Stop local Supabase',
        run: async () => {
          log('🛑 Stopping Supabase...', 'yellow');
          await runCommand('supabase', ['stop']);
        },
      },
      reset: {
        description: 'Reset database (CAUTION: destroys data)',
        run: async () => {
          log('⚠️  WARNING: This will destroy all local data!', 'yellow');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const answer = await new Promise((resolve) => {
            rl.question('Are you sure? (yes/no): ', resolve);
          });
          rl.close();

          if (answer.toLowerCase() === 'yes') {
            log('🔄 Resetting database...', 'cyan');
            await runCommand('supabase', ['db', 'reset']);
            log('✅ Database reset complete', 'green');
          } else {
            log('❌ Reset cancelled', 'yellow');
          }
        },
      },
      migrate: {
        description: 'Apply migrations',
        run: async () => {
          log('📊 Applying migrations...', 'cyan');
          await runCommand('supabase', ['db', 'push']);
          log('✅ Migrations applied', 'green');
        },
      },
      seed: {
        description: 'Seed database with test data',
        run: async () => {
          log('🌱 Seeding database...', 'cyan');
          await runCommand('pnpm', ['seed:local']);
          log('✅ Database seeded', 'green');
        },
      },
      status: {
        description: 'Show database status',
        run: async () => {
          await runCommand('supabase', ['status']);
        },
      },
      studio: {
        description: 'Open Supabase Studio',
        run: async () => {
          log('🎨 Opening Supabase Studio...', 'cyan');
          const { default: open } = await import('open');
          await open('http://localhost:54323');
        },
      },
      types: {
        description: 'Generate TypeScript types from database',
        run: async () => {
          log('🔧 Generating types...', 'cyan');
          await runCommand('pnpm', ['db:generate-types']);
          log('✅ Types generated', 'green');
        },
      },
    },
  },

  // Testing
  test: {
    description: 'Run tests',
    subcommands: {
      unit: {
        description: 'Run unit tests',
        run: async () => {
          log('🧪 Running unit tests...', 'cyan');
          await runCommand('pnpm', ['test']);
        },
      },
      integration: {
        description: 'Run integration tests',
        run: async () => {
          log('🔗 Running integration tests...', 'cyan');
          await runCommand('pnpm', ['test:integration']);
        },
      },
      coverage: {
        description: 'Run tests with coverage',
        run: async () => {
          log('📊 Running tests with coverage...', 'cyan');
          await runCommand('pnpm', ['test:coverage:full']);
          log('\n📄 Coverage report: coverage/lcov-report/index.html', 'dim');
        },
      },
      visual: {
        description: 'Run visual regression tests',
        run: async () => {
          log('🎨 Running visual regression tests...', 'cyan');
          await runCommand('pnpm', ['test:visual']);
        },
      },
      all: {
        description: 'Run all tests',
        run: async () => {
          log('🚀 Running all tests...', 'cyan');
          await runCommand('pnpm', ['test:all']);
        },
      },
      watch: {
        description: 'Run tests in watch mode',
        run: async () => {
          log('👀 Running tests in watch mode...', 'cyan');
          await runCommand('pnpm', ['test:watch']);
        },
      },
    },
  },

  // Docker
  docker: {
    description: 'Docker commands',
    subcommands: {
      up: {
        description: 'Start Docker stack',
        run: async () => {
          log('🐳 Starting Docker stack...', 'cyan');
          await runCommand('docker-compose', ['up', '-d']);
          log('\n✅ Docker stack started!', 'green');
          log('\n📋 Services:', 'cyan');
          log('  • Supabase Studio: http://localhost:3000', 'dim');
          log('  • PostgreSQL: localhost:5432', 'dim');
          log('  • Redis: localhost:6379', 'dim');
          log('  • Redis Insight: http://localhost:8001', 'dim');
          log('  • LocalStack: http://localhost:4566', 'dim');
          log('  • MinIO Console: http://localhost:9001', 'dim');
          log('  • Mailhog: http://localhost:8025', 'dim');
          log('  • Grafana: http://localhost:3001', 'dim');
        },
      },
      down: {
        description: 'Stop Docker stack',
        run: async () => {
          log('🛑 Stopping Docker stack...', 'yellow');
          await runCommand('docker-compose', ['down']);
        },
      },
      restart: {
        description: 'Restart Docker stack',
        run: async () => {
          log('🔄 Restarting Docker stack...', 'cyan');
          await runCommand('docker-compose', ['restart']);
        },
      },
      logs: {
        description: 'View Docker logs',
        run: async () => {
          await runCommand('docker-compose', ['logs', '-f', '--tail=100']);
        },
      },
      ps: {
        description: 'List running containers',
        run: async () => {
          await runCommand('docker-compose', ['ps']);
        },
      },
      clean: {
        description: 'Remove all containers and volumes',
        run: async () => {
          log('⚠️  WARNING: This will destroy all Docker data!', 'yellow');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const answer = await new Promise((resolve) => {
            rl.question('Are you sure? (yes/no): ', resolve);
          });
          rl.close();

          if (answer.toLowerCase() === 'yes') {
            log('🧹 Cleaning Docker...', 'cyan');
            await runCommand('docker-compose', [
              'down',
              '-v',
              '--remove-orphans',
            ]);
            log('✅ Docker cleaned', 'green');
          } else {
            log('❌ Clean cancelled', 'yellow');
          }
        },
      },
    },
  },

  // Build
  build: {
    description: 'Build commands',
    subcommands: {
      all: {
        description: 'Build all packages',
        run: async () => {
          log('🏗️  Building all packages...', 'cyan');
          await runCommand('pnpm', ['build']);
        },
      },
      mobile: {
        description: 'Build mobile app',
        run: async () => {
          log('📱 Building mobile app...', 'cyan');
          await runCommand('pnpm', [
            '--filter',
            '@lovendo/mobile',
            'build',
          ]);
        },
      },
      admin: {
        description: 'Build admin panel',
        run: async () => {
          log('⚙️  Building admin panel...', 'cyan');
          await runCommand('pnpm', ['--filter', 'admin', 'build']);
        },
      },
    },
  },

  // Setup
  setup: {
    description: 'Setup commands',
    subcommands: {
      env: {
        description: 'Setup environment files',
        run: async () => {
          log('🔧 Setting up environment...', 'cyan');
          await runCommand('pnpm', ['setup:env']);
        },
      },
      docker: {
        description: 'Setup Docker environment',
        run: async () => {
          log('🐳 Setting up Docker environment...', 'cyan');

          // Check if Docker is running
          try {
            execSync('docker ps', { stdio: 'ignore' });
          } catch (dockerError) {
            log(
              '❌ Docker is not running. Please start Docker Desktop.',
              'red',
            );
            process.exit(1);
          }

          // Create .env.local if it doesn't exist
          if (!fs.existsSync('.env.local')) {
            log('📝 Creating .env.local from template...', 'cyan');
            fs.copyFileSync('.env.docker', '.env.local');
          }

          log('✅ Docker environment ready', 'green');
          log('\nNext steps:', 'cyan');
          log('  1. Review .env.local and customize if needed', 'dim');
          log('  2. Run: lovendo docker up', 'dim');
        },
      },
      all: {
        description: 'Complete setup (env + dependencies)',
        run: async () => {
          log('🚀 Running complete setup...', 'cyan');

          // Install dependencies
          log('\n📦 Installing dependencies...', 'cyan');
          await runCommand('pnpm', ['install']);

          // Setup env
          log('\n🔧 Setting up environment...', 'cyan');
          await runCommand('pnpm', ['setup:env']);

          // Generate types
          log('\n🔧 Generating types...', 'cyan');
          try {
            await runCommand('pnpm', ['db:generate-types']);
          } catch (typeGenError) {
            log(
              '⚠️  Skipping type generation (Supabase not running)',
              'yellow',
            );
          }

          log('\n✅ Setup complete!', 'green');
        },
      },
    },
  },

  // Lint
  lint: {
    description: 'Lint and format code',
    subcommands: {
      check: {
        description: 'Check for linting errors',
        run: async () => {
          log('🔍 Checking code...', 'cyan');
          await runCommand('pnpm', ['lint']);
        },
      },
      fix: {
        description: 'Fix linting errors',
        run: async () => {
          log('🔧 Fixing code...', 'cyan');
          await runCommand('pnpm', ['lint:fix']);
        },
      },
      format: {
        description: 'Format code with Prettier',
        run: async () => {
          log('✨ Formatting code...', 'cyan');
          await runCommand('pnpm', ['format']);
        },
      },
    },
  },

  // Help
  help: {
    description: 'Show help',
    run: () => {
      showHelp();
    },
  },
};

// ============================================================================
// Help
// ============================================================================

function showHelp() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 Lovendo Developer CLI', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  log('Usage: lovendo <command> [subcommand]\n', 'cyan');

  log('Available commands:\n', 'bright');

  for (const [name, command] of Object.entries(commands)) {
    if (command.run) {
      log(
        `  ${colors.green}${name.padEnd(15)}${colors.reset} ${command.description}`,
        'reset',
      );
    } else if (command.subcommands) {
      log(
        `  ${colors.green}${name.padEnd(15)}${colors.reset} ${command.description}`,
        'reset',
      );
      for (const [subName, subCommand] of Object.entries(command.subcommands)) {
        log(
          `    ${colors.dim}${subName.padEnd(13)}${colors.reset} ${subCommand.description}`,
          'reset',
        );
      }
    }
  }

  log('\nExamples:', 'bright');
  log('  lovendo dev start              Start all development servers', 'dim');
  log('  lovendo db reset               Reset local database', 'dim');
  log('  lovendo test coverage          Run tests with coverage', 'dim');
  log('  lovendo docker up              Start Docker stack', 'dim');
  log('  lovendo lint fix               Fix linting errors', 'dim');

  log('\n💡 Tips:', 'cyan');
  log('  • Run "lovendo help" anytime to see this help', 'dim');
  log('  • Check docs/ folder for detailed guides', 'dim');
  log('  • Use Docker for local development: lovendo docker up', 'dim');
  log('');
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    return;
  }

  const [commandName, subCommandName] = args;
  const command = commands[commandName];

  if (!command) {
    log(`❌ Unknown command: ${commandName}`, 'red');
    log('Run "lovendo help" to see available commands', 'dim');
    process.exit(1);
  }

  // Direct command (e.g., "lovendo help")
  if (command.run) {
    await command.run();
    return;
  }

  // Command with subcommands (e.g., "lovendo dev start")
  if (!subCommandName) {
    log(`❌ Missing subcommand for: ${commandName}`, 'red');
    log(`Available subcommands:`, 'dim');
    for (const [name, sub] of Object.entries(command.subcommands)) {
      log(`  • ${name} - ${sub.description}`, 'dim');
    }
    process.exit(1);
  }

  const subCommand = command.subcommands[subCommandName];

  if (!subCommand) {
    log(`❌ Unknown subcommand: ${subCommandName}`, 'red');
    log(`Available subcommands for ${commandName}:`, 'dim');
    for (const [name, sub] of Object.entries(command.subcommands)) {
      log(`  • ${name} - ${sub.description}`, 'dim');
    }
    process.exit(1);
  }

  await subCommand.run();
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
