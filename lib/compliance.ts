// Banking compliance utilities and validation

export interface ComplianceCheck {
  passed: boolean;
  requirement: string;
  details: string;
  level: 'info' | 'warning' | 'error';
}

export class ComplianceValidator {
  // NIST SP 800-63B Level 3 validation
  static validateNISTLevel3(authMethod: string, deviceType: string): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];

    // Multi-factor authentication requirement
    if (authMethod !== 'webauthn') {
      checks.push({
        passed: false,
        requirement: 'NIST SP 800-63B AAL3',
        details: 'Multi-factor authentication with hardware cryptographic authenticator required',
        level: 'error'
      });
    } else {
      checks.push({
        passed: true,
        requirement: 'NIST SP 800-63B AAL3',
        details: 'WebAuthn multi-factor authentication implemented',
        level: 'info'
      });
    }

    // Hardware-based authenticator requirement
    if (deviceType === 'platform' || deviceType === 'cross-platform') {
      checks.push({
        passed: true,
        requirement: 'Hardware Authenticator',
        details: 'Hardware-based authenticator detected',
        level: 'info'
      });
    } else {
      checks.push({
        passed: false,
        requirement: 'Hardware Authenticator',
        details: 'Hardware-based authenticator required for Level 3',
        level: 'error'
      });
    }

    return checks;
  }

  // PSD2 Strong Customer Authentication validation
  static validatePSD2SCA(factors: string[]): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const requiredFactors = ['knowledge', 'possession', 'inherence'];
    const presentFactors = factors.filter(f => requiredFactors.includes(f));

    if (presentFactors.length >= 2) {
      checks.push({
        passed: true,
        requirement: 'PSD2 SCA',
        details: `${presentFactors.length} authentication factors present`,
        level: 'info'
      });
    } else {
      checks.push({
        passed: false,
        requirement: 'PSD2 SCA',
        details: 'At least 2 independent authentication factors required',
        level: 'error'
      });
    }

    return checks;
  }

  // FFIEC guidance validation
  static validateFFIEC(riskLevel: 'low' | 'medium' | 'high', authMethods: string[]): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];

    if (riskLevel === 'high' && !authMethods.includes('webauthn')) {
      checks.push({
        passed: false,
        requirement: 'FFIEC High-Risk Authentication',
        details: 'High-risk transactions require multi-factor authentication',
        level: 'error'
      });
    } else {
      checks.push({
        passed: true,
        requirement: 'FFIEC Risk-Based Authentication',
        details: 'Appropriate authentication for risk level',
        level: 'info'
      });
    }

    return checks;
  }

  // Transaction amount validation for regulatory thresholds
  static validateTransactionLimits(amount: number, currency: string): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    
    // Convert to base currency (GHS kobo)
    const amountInKobo = currency === 'GHS' ? amount : amount * 100;
    
    // High-value transaction threshold (10,000 GHS = 1,000,000 kobo)
    if (amountInKobo >= 1000000) {
      checks.push({
        passed: false,
        requirement: 'High-Value Transaction',
        details: 'Transactions ≥10,000 GHS require additional verification',
        level: 'warning'
      });
    }

    // Suspicious amount patterns
    if (amountInKobo % 100000 === 0 && amountInKobo >= 500000) {
      checks.push({
        passed: false,
        requirement: 'AML Monitoring',
        details: 'Round high-value amounts may require AML review',
        level: 'warning'
      });
    }

    return checks;
  }

  // Session security validation
  static validateSessionSecurity(sessionData: any): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const now = Date.now();

    // MFA verification check
    if (!sessionData.mfaVerified) {
      checks.push({
        passed: false,
        requirement: 'Session MFA',
        details: 'Session must be MFA-verified for banking operations',
        level: 'error'
      });
    }

    // Session timeout check (1 hour max)
    const sessionAge = now - sessionData.lastActivity;
    if (sessionAge > 3600000) {
      checks.push({
        passed: false,
        requirement: 'Session Timeout',
        details: 'Session exceeded maximum idle time (1 hour)',
        level: 'error'
      });
    }

    // Session expiry check
    if (now > sessionData.expiresAt) {
      checks.push({
        passed: false,
        requirement: 'Session Validity',
        details: 'Session has expired',
        level: 'error'
      });
    }

    return checks;
  }
}

// Compliance reporting
export class ComplianceReporter {
  static generateReport(checks: ComplianceCheck[]): {
    overall: 'compliant' | 'non-compliant' | 'warning';
    summary: string;
    details: ComplianceCheck[];
  } {
    const errors = checks.filter(c => !c.passed && c.level === 'error');
    const warnings = checks.filter(c => !c.passed && c.level === 'warning');
    
    let overall: 'compliant' | 'non-compliant' | 'warning';
    let summary: string;

    if (errors.length > 0) {
      overall = 'non-compliant';
      summary = `${errors.length} compliance error(s) found`;
    } else if (warnings.length > 0) {
      overall = 'warning';
      summary = `${warnings.length} compliance warning(s) found`;
    } else {
      overall = 'compliant';
      summary = 'All compliance requirements met';
    }

    return {
      overall,
      summary,
      details: checks
    };
  }
}