#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 MicroFi Production Remote Deployment');
console.log('======================================\n');

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

// 1. Deploy database to remote
console.log('📊 Deploying database to remote...');
process.chdir('./backend');
runCommand('wrangler d1 execute microfi-banking --remote --file=production-database-setup.sql');

// 2. Set production secrets
console.log('🔐 Setting production secrets...');
const secrets = [
  'JWT_SECRET',
  'PAYSTACK_SECRET_KEY', 
  'FLUTTERWAVE_SECRET_KEY',
  'HUBTEL_CLIENT_SECRET',
  'RESEND_API_KEY'
];

secrets.forEach(secret => {
  console.log(`Setting ${secret}...`);
  runCommand(`wrangler secret put ${secret} --env production`);
});

// 3. Deploy backend
console.log('☁️ Deploying backend to production...');
runCommand('wrangler deploy --env production');

process.chdir('..');

// 4. Deploy frontend
console.log('🌐 Building and deploying frontend...');
runCommand('npm run build');
runCommand('vercel --prod');

console.log('🎉 Production deployment complete!');
console.log('Backend: https://microfi-banking-backend.your-account.workers.dev');
console.log('Frontend: https://microfi-banking-saas.vercel.app');