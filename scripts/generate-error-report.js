#!/usr/bin/env node

/**
 * Error Report Generator for MicroFi Banking SaaS
 * Generates standardized error reports for external assistance
 */

const fs = require('fs');
const path = require('path');

function generateErrorReport(issueName, errorDetails) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `ERROR-REPORT-${issueName.toUpperCase().replace(/\s+/g, '-')}-${timestamp}.md`;
  const filepath = path.join(__dirname, '..', 'docs', filename);

  const template = `# ${issueName} Error Report

## 🚨 **Critical Issue Summary**
${errorDetails.summary || 'Issue description needed'}

## 📋 **Error Details**

### **Primary Issue**
- **Problem**: ${errorDetails.problem || 'Technical issue description'}
- **Impact**: ${errorDetails.impact || 'Business/functional impact'}
- **Environment**: ${errorDetails.environment || 'Runtime environment details'}

### **Error Logs**
\`\`\`
${errorDetails.logs || 'Error messages and stack traces'}
\`\`\`

### **Expected vs Actual**
- **Expected**: ${errorDetails.expected || 'What should happen'}
- **Actual**: ${errorDetails.actual || 'What actually happens'}

## 🔧 **Technical Analysis**

### **Root Cause**
${errorDetails.rootCause || 'Analysis of underlying cause'}

### **Solutions Attempted**
1. ❌ ${errorDetails.attempt1 || 'First attempt description'}
2. ❌ ${errorDetails.attempt2 || 'Second attempt description'}

### **Code Location**
**File**: ${errorDetails.file || 'Affected file path'}
**Method**: ${errorDetails.method || 'Function/method name'}
**Lines**: ${errorDetails.lines || 'Line numbers'}

\`\`\`typescript
${errorDetails.code || '// Relevant code snippet'}
\`\`\`

## 📁 **Affected Files**

### **Backend Files**
${errorDetails.backendFiles || '- List backend files involved'}

### **Frontend Files**
${errorDetails.frontendFiles || '- List frontend files involved'}

### **Configuration Files**
${errorDetails.configFiles || '- List configuration files involved'}

## 🔍 **Environment Details**

### **Runtime Environment**
- **Platform**: ${errorDetails.platform || 'Cloudflare Workers / Next.js'}
- **Runtime**: ${errorDetails.runtime || 'Node.js version / Wrangler version'}
- **OS**: ${errorDetails.os || 'Operating system'}

### **Dependencies**
${errorDetails.dependencies || '- List relevant package versions'}

### **Browser Environment** (if applicable)
${errorDetails.browser || '- Browser versions tested'}

## 🛠️ **Debugging Information**

### **Flow Analysis**
${errorDetails.flow || '1. ✅ Step that works\n2. ❌ Step that fails'}

## 🎯 **Potential Solutions**

### **Option 1**: ${errorDetails.solution1 || 'First potential approach'}
### **Option 2**: ${errorDetails.solution2 || 'Second potential approach'}
### **Option 3**: ${errorDetails.solution3 || 'Third potential approach'}

## 📞 **Support Request**

### **Assistance Needed**
${errorDetails.assistance || '1. Specific help required\n2. Technical guidance needed'}

### **Expected Outcome**
${errorDetails.outcome || '- Desired end result\n- Success criteria'}

## 📊 **Impact Assessment**

### **Severity**: ${errorDetails.severity || 'Critical/High/Medium/Low'}
### **Affected Features**:
${errorDetails.features || '- List impacted functionality'}

### **Business Impact**:
${errorDetails.businessImpact || '- Business consequences'}

---

**Report Generated**: ${new Date().toLocaleDateString()}
**Project**: MicroFi Banking SaaS
**Environment**: ${errorDetails.environment || 'Development'}
**Status**: Requires External Assistance
`;

  fs.writeFileSync(filepath, template);
  console.log(`Error report generated: ${filename}`);
  return filepath;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: node generate-error-report.js "Issue Name"');
    process.exit(1);
  }
  
  const issueName = args[0];
  const errorDetails = {
    summary: 'Please fill in issue summary',
    problem: 'Please describe the technical problem',
    impact: 'Please describe the impact',
    // Add more default prompts as needed
  };
  
  generateErrorReport(issueName, errorDetails);
}

module.exports = { generateErrorReport };