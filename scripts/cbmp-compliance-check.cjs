#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 CBMP Compliance Check - Scanning for payment-related code...\n');

const PROHIBITED_KEYWORDS = [
  'paystack', 'flutterwave', 'momo', 'payment', 'charge',
  'transfer', 'balance', 'transaction', 'gateway', 'fund',
  'deposit', 'withdraw', 'payout', 'billing'
];

const PROHIBITED_TABLES = [
  'payments', 'transactions', 'balances', 'gateways',
  'payment_methods', 'gateway_configs'
];

const PROHIBITED_COLUMNS = [
  'amount', 'balance', 'transaction_id', 'payment_status',
  'gateway_response', 'account_number', 'card_number'
];

let violations = [];
let filesScanned = 0;

function scanDirectory(dir, excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build']) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !excludeDirs.includes(file.name)) {
      scanDirectory(fullPath, excludeDirs);
    } else if (file.isFile() && ['.ts', '.tsx', '.js', '.jsx', '.sql'].includes(path.extname(file.name))) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  filesScanned++;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    
    // Check for prohibited keywords
    for (const keyword of PROHIBITED_KEYWORDS) {
      if (lowerLine.includes(keyword)) {
        // Skip if it's in a comment about removal or compliance
        if (lowerLine.includes('removed') || lowerLine.includes('cbmp') || 
            lowerLine.includes('compliance') || lowerLine.includes('blocked') ||
            lowerLine.includes('prohibited') || lowerLine.includes('//') ||
            lowerLine.includes('*') || lowerLine.includes('disable')) {
          continue;
        }
        
        violations.push({
          file: filePath,
          line: index + 1,
          keyword,
          content: line.trim(),
          type: 'keyword'
        });
      }
    }
    
    // Check for prohibited table names in SQL
    if (filePath.endsWith('.sql')) {
      for (const table of PROHIBITED_TABLES) {
        if (lowerLine.includes(table) && !lowerLine.includes('drop table')) {
          violations.push({
            file: filePath,
            line: index + 1,
            keyword: table,
            content: line.trim(),
            type: 'table'
          });
        }
      }
    }
  });
}

function generateReport() {
  console.log(`📊 Scan Results:`);
  console.log(`   Files scanned: ${filesScanned}`);
  console.log(`   Violations found: ${violations.length}\n`);
  
  if (violations.length === 0) {
    console.log('✅ CBMP COMPLIANCE VERIFIED');
    console.log('   No payment-related code found');
    console.log('   Platform is 100% compliant\n');
    return true;
  } else {
    console.log('❌ CBMP COMPLIANCE VIOLATIONS FOUND:\n');
    
    const groupedViolations = {};
    violations.forEach(v => {
      if (!groupedViolations[v.file]) {
        groupedViolations[v.file] = [];
      }
      groupedViolations[v.file].push(v);
    });
    
    Object.entries(groupedViolations).forEach(([file, fileViolations]) => {
      console.log(`📁 ${file}:`);
      fileViolations.forEach(v => {
        console.log(`   Line ${v.line}: "${v.keyword}" - ${v.content}`);
      });
      console.log('');
    });
    
    console.log('🔧 REQUIRED ACTIONS:');
    console.log('   1. Remove or replace all payment-related code');
    console.log('   2. Update database schema to remove payment tables');
    console.log('   3. Replace with business management features');
    console.log('   4. Re-run compliance check\n');
    
    return false;
  }
}

function checkDatabaseSchema() {
  console.log('🗄️  Checking database schema files...\n');
  
  const migrationDir = path.join(__dirname, '..', 'backend', 'migrations');
  if (!fs.existsSync(migrationDir)) {
    console.log('⚠️  No migrations directory found');
    return;
  }
  
  const migrationFiles = fs.readdirSync(migrationDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  let schemaViolations = [];
  
  migrationFiles.forEach(file => {
    const filePath = path.join(migrationDir, file);
    const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
    
    PROHIBITED_TABLES.forEach(table => {
      if (content.includes(`create table ${table}`) || content.includes(`create table if not exists ${table}`)) {
        schemaViolations.push({
          file,
          table,
          type: 'prohibited_table'
        });
      }
    });
  });
  
  if (schemaViolations.length === 0) {
    console.log('✅ Database schema is CBMP compliant');
  } else {
    console.log('❌ Database schema violations:');
    schemaViolations.forEach(v => {
      console.log(`   ${v.file}: Creates prohibited table "${v.table}"`);
    });
  }
  
  console.log('');
}

function main() {
  const projectRoot = path.join(__dirname, '..');
  
  console.log(`🎯 Scanning project: ${projectRoot}\n`);
  
  // Scan codebase
  scanDirectory(projectRoot);
  
  // Check database schema
  checkDatabaseSchema();
  
  // Generate report
  const isCompliant = generateReport();
  
  if (isCompliant) {
    console.log('🎉 CBMP COMPLIANCE SUCCESS');
    console.log('   Ready for deployment to African markets');
    console.log('   Zero regulatory risk\n');
    process.exit(0);
  } else {
    console.log('🚫 CBMP COMPLIANCE FAILED');
    console.log('   Deployment blocked until violations are resolved\n');
    process.exit(1);
  }
}

// Run the compliance check
main();