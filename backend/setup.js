#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up MicroFi Backend...\n');

// Check if wrangler is installed
try {
  execSync('wrangler --version', { stdio: 'ignore' });
  console.log('✅ Wrangler CLI is installed');
} catch (error) {
  console.log('❌ Wrangler CLI not found. Installing...');
  execSync('npm install -g wrangler@latest', { stdio: 'inherit' });
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Check if user is authenticated
try {
  execSync('wrangler whoami', { stdio: 'ignore' });
  console.log('✅ Wrangler is authenticated');
} catch (error) {
  console.log('❌ Please authenticate with Cloudflare:');
  console.log('   Run: wrangler auth login');
  process.exit(1);
}

// Apply database migrations
console.log('\n🗄️  Applying database migrations...');
try {
  execSync('wrangler d1 migrations apply microfi-banking', { stdio: 'inherit' });
  console.log('✅ Database migrations applied');
} catch (error) {
  console.log('⚠️  Migration failed. Database might already be initialized.');
}

console.log('\n🎉 Backend setup complete!');
console.log('\nNext steps:');
console.log('1. Set up secrets: wrangler secret put PAYSTACK_SECRET_KEY');
console.log('2. Start development: npm run dev');
console.log('3. Deploy to production: npm run deploy');