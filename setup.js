#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.split('.')[0].replace('v', ''));
  if (major < 18) {
    log('❌ Node.js 18+ required. Current: ' + version, 'red');
    process.exit(1);
  }
  log('✓ Node.js version: ' + version, 'green');
}

function installDependencies() {
  log('\n📦 Installing backend dependencies...', 'cyan');
  try {
    execSync('npm install', { stdio: 'inherit' });
    log('✓ Backend dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install backend dependencies', 'red');
    process.exit(1);
  }

  log('\n📦 Installing frontend dependencies...', 'cyan');
  try {
    execSync('cd client && npm install', { stdio: 'inherit' });
    log('✓ Frontend dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install frontend dependencies', 'red');
    process.exit(1);
  }
}

function setupEnvironment() {
  log('\n🔧 Setting up environment...', 'cyan');
  
  if (!fs.existsSync('.env')) {
    fs.copyFileSync('.env.example', '.env');
    log('✓ .env file created from .env.example', 'green');
    log('⚠️  Please edit .env with your database credentials', 'yellow');
  } else {
    log('✓ .env file already exists', 'green');
  }
}

function displayNextSteps() {
  log('\n' + '='.repeat(50), 'bright');
  log('🎉 Setup completed successfully!', 'green');
  log('='.repeat(50), 'bright');
  log('\nNext steps:', 'bright');
  log('1. Configure your .env file with Neon DB credentials');
  log('2. Run: npm run db:migrate');
  log('3. Run: npm run db:seed');
  log('4. Start development: npm run dev:full');
  log('\nDefault login credentials:', 'bright');
  log('  Admin: mobile=9999999999, password=admin123');
  log('  Coach: mobile=8888888888, password=coach123');
  log('\n📖 Documentation: README.md', 'cyan');
  log('='.repeat(50), 'bright');
}

function main() {
  log('\n🏫 Academy Management System Setup\n', 'bright');
  
  checkNodeVersion();
  installDependencies();
  setupEnvironment();
  displayNextSteps();
}

main();
