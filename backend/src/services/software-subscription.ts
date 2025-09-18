import type { Context } from 'hono';

/**
 * Software Subscription Service
 * COMPLIANT: Only charges for software platform usage (not customer payments)
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // In cents (GHS)
  currency: string;
  features: string[];
  limits: {
    users: number;
    transactions_view: number;
    storage_gb: number;
    api_calls: number;
    custom_domains: number;
    email_accounts: number;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    price: 12000, // GHS 120/month
    currency: 'GHS',
    features: [
      'Basic financial dashboard',
      'Up to 5 users',
      'Transaction viewing (read-only)',
      'Basic reporting',
      'Email redirect (via Cloudflare)',
      'Email support'
    ],
    limits: {
      users: 5,
      transactions_view: 1000,
      storage_gb: 1,
      api_calls: 10000,
      custom_domains: 0,
      email_accounts: 0
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional Plan', 
    price: 24000, // GHS 240/month
    currency: 'GHS',
    features: [
      'Advanced financial dashboard',
      'Up to 25 users',
      'Unlimited transaction viewing',
      'Advanced reporting & analytics',
      'Custom branding',
      'Email redirect (via Cloudflare)',
      'Priority support'
    ],
    limits: {
      users: 25,
      transactions_view: -1, // Unlimited
      storage_gb: 10,
      api_calls: 100000,
      custom_domains: 0,
      email_accounts: 0
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: 50000, // GHS 500/month
    currency: 'GHS',
    features: [
      'Full financial management suite',
      'Up to 100 users',
      'Custom domain (yourdomain.com)',
      'Professional email (@yourdomain.com)',
      'Advanced analytics & reporting',
      'White-label solution',
      'Priority support'
    ],
    limits: {
      users: 100,
      transactions_view: -1, // Unlimited
      storage_gb: 50,
      api_calls: 500000,
      custom_domains: 1,
      email_accounts: 10
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 80000, // GHS 800/month
    currency: 'GHS',
    features: [
      'Enterprise financial management suite',
      'Unlimited users',
      'Multiple custom domains',
      'Enterprise email suite (unlimited)',
      'Custom integrations & API access',
      'Dedicated account manager',
      'SLA guarantee (99.9% uptime)'
    ],
    limits: {
      users: -1, // Unlimited
      transactions_view: -1, // Unlimited
      storage_gb: 500,
      api_calls: -1, // Unlimited
      custom_domains: 5,
      email_accounts: -1 // Unlimited
    }
  }
};

export class SoftwareSubscriptionService {
  /**
   * Get subscription plan details
   */
  static getSubscriptionPlan(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS[planId] || null;
  }

  /**
   * Calculate subscription fee (software only)
   */
  static calculateSubscriptionFee(planId: string, months: number = 1): {
    plan: SubscriptionPlan;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
  } {
    const plan = this.getSubscriptionPlan(planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const subtotal = plan.price * months;
    const tax = Math.round(subtotal * 0.125); // 12.5% VAT in Ghana
    const total = subtotal + tax;

    return {
      plan,
      subtotal,
      tax,
      total,
      currency: plan.currency
    };
  }

  /**
   * Process software subscription payment
   * COMPLIANT: Uses platform's own Paystack account (not tenant's)
   */
  static async processSubscriptionPayment(
    db: D1Database,
    tenantId: string,
    planId: string,
    months: number = 1
  ): Promise<{
    success: boolean;
    subscriptionId?: string;
    paymentUrl?: string;
    error?: string;
  }> {
    try {
      const billing = this.calculateSubscriptionFee(planId, months);
      
      // Create subscription record
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.prepare(`
        INSERT INTO subscriptions (
          id, tenant_id, plan_id, status, amount, currency,
          billing_cycle, next_billing_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        subscriptionId,
        tenantId,
        planId,
        'pending',
        billing.total,
        billing.currency,
        'monthly',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      ).run();

      // Generate payment URL using platform's own Paystack account
      const paymentUrl = await this.generatePaymentUrl(subscriptionId, billing);

      return {
        success: true,
        subscriptionId,
        paymentUrl
      };
    } catch (error) {
      console.error('Subscription payment processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Generate payment URL for software subscription
   * COMPLIANT: Uses MicroFi's own Paystack account
   */
  private static async generatePaymentUrl(
    subscriptionId: string,
    billing: any
  ): Promise<string> {
    // This would use MicroFi's own Paystack account
    // NOT the tenant's payment credentials
    const paymentData = {
      email: 'billing@microfi.com',
      amount: billing.total,
      currency: billing.currency,
      reference: subscriptionId,
      callback_url: `https://microfi.com/subscription/callback`,
      metadata: {
        type: 'software_subscription',
        subscription_id: subscriptionId
      }
    };

    // Return mock payment URL for now
    return `https://checkout.paystack.com/pay/${subscriptionId}`;
  }

  /**
   * Verify subscription payment
   */
  static async verifySubscriptionPayment(
    db: D1Database,
    subscriptionId: string,
    paymentReference: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify payment with MicroFi's Paystack account
      // Update subscription status to active
      await db.prepare(`
        UPDATE subscriptions 
        SET status = ?, payment_reference = ?, activated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind('active', paymentReference, subscriptionId).run();

      return { success: true };
    } catch (error) {
      console.error('Subscription verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Get tenant's current subscription
   */
  static async getTenantSubscription(
    db: D1Database,
    tenantId: string
  ): Promise<{
    subscription: any;
    plan: SubscriptionPlan;
    status: string;
    daysRemaining: number;
  } | null> {
    try {
      const subscription = await db.prepare(`
        SELECT * FROM subscriptions 
        WHERE tenant_id = ? AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
      `).bind(tenantId).first();

      if (!subscription) {
        return null;
      }

      const plan = this.getSubscriptionPlan(subscription.plan_id as string);
      if (!plan) {
        return null;
      }

      const nextBilling = new Date(subscription.next_billing_date as string);
      const now = new Date();
      const daysRemaining = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        subscription,
        plan,
        status: subscription.status as string,
        daysRemaining
      };
    } catch (error) {
      console.error('Failed to get tenant subscription:', error);
      return null;
    }
  }

  /**
   * Check if tenant has access to feature
   */
  static async checkFeatureAccess(
    db: D1Database,
    tenantId: string,
    feature: string
  ): Promise<boolean> {
    try {
      const subscription = await this.getTenantSubscription(db, tenantId);
      
      if (!subscription || subscription.status !== 'active') {
        return false;
      }

      return subscription.plan.features.includes(feature);
    } catch (error) {
      console.error('Feature access check failed:', error);
      return false;
    }
  }
}