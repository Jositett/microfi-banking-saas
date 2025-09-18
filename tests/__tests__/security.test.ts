import { describe, it, expect } from 'vitest'
import { ComplianceValidator, ComplianceReporter } from '../../lib/compliance'

describe('Banking Security Compliance', () => {
  describe('NIST SP 800-63B Level 3 Validation', () => {
    it('should pass with WebAuthn and platform authenticator', () => {
      const checks = ComplianceValidator.validateNISTLevel3('webauthn', 'platform')
      const report = ComplianceReporter.generateReport(checks)
      
      expect(report.overall).toBe('compliant')
      expect(checks.every(check => check.passed)).toBe(true)
    })

    it('should fail with non-WebAuthn authentication', () => {
      const checks = ComplianceValidator.validateNISTLevel3('password', 'software')
      const report = ComplianceReporter.generateReport(checks)
      
      expect(report.overall).toBe('non-compliant')
      expect(checks.some(check => !check.passed && check.level === 'error')).toBe(true)
    })
  })

  describe('PSD2 Strong Customer Authentication', () => {
    it('should pass with multiple authentication factors', () => {
      const checks = ComplianceValidator.validatePSD2SCA(['knowledge', 'possession', 'inherence'])
      const report = ComplianceReporter.generateReport(checks)
      
      expect(report.overall).toBe('compliant')
      expect(checks[0].passed).toBe(true)
    })

    it('should fail with insufficient factors', () => {
      const checks = ComplianceValidator.validatePSD2SCA(['knowledge'])
      const report = ComplianceReporter.generateReport(checks)
      
      expect(report.overall).toBe('non-compliant')
      expect(checks[0].passed).toBe(false)
    })
  })

  describe('Transaction Limits Validation', () => {
    it('should flag high-value transactions', () => {
      const checks = ComplianceValidator.validateTransactionLimits(1000000, 'GHS')
      
      expect(checks.some(check => check.requirement === 'High-Value Transaction')).toBe(true)
      expect(checks.some(check => !check.passed)).toBe(true)
    })

    it('should pass normal transactions', () => {
      const checks = ComplianceValidator.validateTransactionLimits(50000, 'GHS')
      
      expect(checks.length).toBe(0)
    })
  })

  describe('Session Security Validation', () => {
    it('should pass valid MFA-verified session', () => {
      const sessionData = {
        mfaVerified: true,
        lastActivity: Date.now() - 1800000,
        expiresAt: Date.now() + 1800000
      }
      
      const checks = ComplianceValidator.validateSessionSecurity(sessionData)
      const report = ComplianceReporter.generateReport(checks)
      
      expect(report.overall).toBe('compliant')
    })

    it('should fail expired session', () => {
      const sessionData = {
        mfaVerified: true,
        lastActivity: Date.now() - 7200000,
        expiresAt: Date.now() - 3600000
      }
      
      const checks = ComplianceValidator.validateSessionSecurity(sessionData)
      const report = ComplianceReporter.generateReport(checks)
      
      expect(report.overall).toBe('non-compliant')
      expect(checks.some(check => check.requirement === 'Session Validity')).toBe(true)
    })
  })
})