#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔧 MicroFi Local Development Setup (Simple)');
console.log('==========================================\n');

function runCommand(command, cwd = process.cwd()) {
  console.log(`📋 Running: ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    console.log('✅ Command completed\n');
  } catch (error) {
    console.log(`⚠️ Command had issues (may be expected): ${error.message}\n`);
  }
}

// Setup backend
console.log('🔧 Setting up backend...');
process.chdir('./backend');

// Apply all migrations
const migrations = [
  '001_initial_schema.sql',
  '002_subscription_tables.sql', 
  '003_gateway_management.sql',
  '006_add_tenant_support.sql',
  '007_migrate_existing_data.sql',
  '008_email_routing.sql'
];

console.log('📊 Applying database migrations...');
migrations.forEach(migration => {
  console.log(`📊 Applying: ${migration}`);
  runCommand(`wrangler d1 execute microfi-banking --local --file=migrations/${migration}`);
});

// Seed demo data
console.log('🌱 Seeding demo data...');
runCommand('wrangler d1 execute microfi-banking --local --file=seed-demo-users.sql');

process.chdir('..');

// Install dependencies
console.log('📦 Installing dependencies...');
runCommand('npm install');
runCommand('npm install', './backend');

console.log('✅ Local development setup complete!');
console.log('\n🚀 To start development:');
console.log('1. Backend: cd backend && wrangler dev --port 8787');
console.log('2. Frontend: npm run dev');
console.log('3. Visit: http://localhost:3000');
console.log('4. Test: node scripts/test-local-setup.js');