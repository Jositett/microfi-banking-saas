#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 MicroFi Local Development Setup');
console.log('==================================\n');

function runCommand(command, cwd = process.cwd()) {
  console.log(`📋 Running: ${command}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    console.log('✅ Command completed\n');
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    process.exit(1);
  }
}

// 1. Setup backend
console.log('🔧 Setting up backend...');
process.chdir('./backend');

// Create local D1 database
runCommand('wrangler d1 create microfi-banking');

// Apply all migrations
const migrations = [
  '001_initial_schema.sql',
  '002_subscription_tables.sql', 
  '003_gateway_management.sql',
  '006_add_tenant_support.sql',
  '007_migrate_existing_data.sql',
  '008_email_routing.sql'
];

migrations.forEach(migration => {
  console.log(`📊 Applying migration: ${migration}`);
  runCommand(`wrangler d1 execute microfi-banking --local --file=migrations/${migration}`);
});

// Seed demo data
console.log('🌱 Seeding demo data...');
runCommand('wrangler d1 execute microfi-banking --local --file=seed-demo-users.sql');

// Create KV namespaces locally
console.log('🗄️ Setting up KV namespaces...');
runCommand('wrangler kv:namespace create WEBAUTHN_CREDENTIALS');
runCommand('wrangler kv:namespace create USER_SESSIONS');
runCommand('wrangler kv:namespace create AUDIT_LOGS');

process.chdir('..');

// 2. Install dependencies
console.log('📦 Installing dependencies...');
runCommand('npm install');
runCommand('npm install', './backend');

console.log('✅ Local development setup complete!');
console.log('\n🚀 To start development:');
console.log('1. Backend: cd backend && wrangler dev --port 8787');
console.log('2. Frontend: npm run dev');
console.log('3. Visit: http://localhost:3000');