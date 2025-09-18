/**
 * Email Routing Service
 * Handles custom domain email routing via Cloudflare Email Routing
 */

export interface EmailRoute {
  id: string;
  tenant_id: string;
  custom_domain: string;
  email_address: string;
  destination_email: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export class EmailRoutingService {
  /**
   * Setup email routing for custom domain (Premium+ plans only)
   */
  static async setupCustomDomainEmail(
    db: D1Database,
    tenantId: string,
    customDomain: string,
    emailAddress: string,
    destinationEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify tenant has premium+ subscription
      const subscription = await db.prepare(`
        SELECT plan_id FROM subscriptions 
        WHERE tenant_id = ? AND status = 'active'
      `).bind(tenantId).first();

      if (!subscription || !['premium', 'enterprise'].includes(subscription.plan_id as string)) {
        return {
          success: false,
          error: 'Custom domain email requires Premium or Enterprise plan'
        };
      }

      // Create email route record
      const routeId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.prepare(`
        INSERT INTO email_routes (
          id, tenant_id, custom_domain, email_address, destination_email, status, created_at
        ) VALUES (?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
      `).bind(routeId, tenantId, customDomain, emailAddress, destinationEmail).run();

      return { success: true };
    } catch (error) {
      console.error('Email routing setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Setup failed'
      };
    }
  }

  /**
   * Setup email redirect for basic plans (via Cloudflare)
   */
  static async setupEmailRedirect(
    db: D1Database,
    tenantId: string,
    sourceEmail: string,
    destinationEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create redirect record for basic plans
      const redirectId = `redirect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.prepare(`
        INSERT INTO email_redirects (
          id, tenant_id, source_email, destination_email, status, created_at
        ) VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
      `).bind(redirectId, tenantId, sourceEmail, destinationEmail).run();

      return { success: true };
    } catch (error) {
      console.error('Email redirect setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Redirect setup failed'
      };
    }
  }

  /**
   * Get email configuration for tenant
   */
  static async getTenantEmailConfig(
    db: D1Database,
    tenantId: string
  ): Promise<{
    custom_domains: EmailRoute[];
    redirects: any[];
    plan_limits: { custom_domains: number; email_accounts: number };
  }> {
    try {
      // Get custom domain emails
      const customDomains = await db.prepare(`
        SELECT * FROM email_routes WHERE tenant_id = ? AND status = 'active'
      `).bind(tenantId).all();

      // Get email redirects
      const redirects = await db.prepare(`
        SELECT * FROM email_redirects WHERE tenant_id = ? AND status = 'active'
      `).bind(tenantId).all();

      // Get plan limits
      const subscription = await db.prepare(`
        SELECT plan_id FROM subscriptions WHERE tenant_id = ? AND status = 'active'
      `).bind(tenantId).first();

      const planLimits = this.getPlanLimits(subscription?.plan_id as string);

      return {
        custom_domains: customDomains.results as EmailRoute[],
        redirects: redirects.results,
        plan_limits: planLimits
      };
    } catch (error) {
      console.error('Failed to get email config:', error);
      return {
        custom_domains: [],
        redirects: [],
        plan_limits: { custom_domains: 0, email_accounts: 0 }
      };
    }
  }

  /**
   * Get plan limits for email features
   */
  private static getPlanLimits(planId: string): { custom_domains: number; email_accounts: number } {
    const limits = {
      starter: { custom_domains: 0, email_accounts: 0 },
      professional: { custom_domains: 0, email_accounts: 0 },
      premium: { custom_domains: 1, email_accounts: 10 },
      enterprise: { custom_domains: 5, email_accounts: -1 }
    };

    return limits[planId as keyof typeof limits] || { custom_domains: 0, email_accounts: 0 };
  }

  /**
   * Validate custom domain ownership
   */
  static async validateDomainOwnership(
    domain: string,
    tenantId: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check DNS TXT record for domain verification
      // This would integrate with Cloudflare API to verify domain ownership
      
      // For now, return success (implement actual DNS verification in production)
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Domain ownership verification failed'
      };
    }
  }
}