export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // in pesewas (GHS cents)
  originalPrice: number;
  duration: number; // in days
  memberLimit: number;
  features: string[];
  transactionFeeRate: number; // percentage
  smsRate: number; // in pesewas
  supportLevel: 'email' | 'whatsapp' | 'phone';
  trainingHours: number;
}

export class SubscriptionService {
  private static readonly PLANS: Record<string, SubscriptionPlan> = {
    starter: {
      id: 'starter',
      name: 'Starter Plan',
      price: 120000, // GHS 1,200 in pesewas
      originalPrice: 150000, // GHS 1,500
      duration: 90, // 3 months
      memberLimit: 50,
      features: [
        'Up to 50 Members',
        'Basic Banking',
        'Own Payment Gateway Keys',
        'SMS Notifications (Pay-per-use)',
        'Email Notifications (Pay-per-use)',
        'Email Support',
        '3 Months Access'
      ],
      transactionFeeRate: 0, // No transaction fees
      smsRate: 5, // GHS 0.05 in pesewas
      supportLevel: 'email',
      trainingHours: 1
    },
    
    growth: {
      id: 'growth',
      name: 'Growth Plan',
      price: 224000, // GHS 2,240 in pesewas
      originalPrice: 280000, // GHS 2,800
      duration: 180, // 6 months
      memberLimit: 200,
      features: [
        'Up to 200 Members',
        'Advanced Reports',
        'Basic Loan Management',
        'Own Payment Gateway Keys',
        'SMS Notifications (Discounted)',
        'Email Notifications (Discounted)',
        'WhatsApp Support',
        'Staff Training (2 hours)',
        '6 Months Access'
      ],
      transactionFeeRate: 0, // No transaction fees
      smsRate: 4, // GHS 0.04 in pesewas
      supportLevel: 'whatsapp',
      trainingHours: 2
    },
    
    professional: {
      id: 'professional',
      name: 'Professional Plan',
      price: 360000, // GHS 3,600 in pesewas
      originalPrice: 450000, // GHS 4,500
      duration: 365, // 12 months
      memberLimit: -1, // unlimited
      features: [
        'Unlimited Members',
        'Advanced Loan Management',
        'Custom Reports',
        'Own Payment Gateway Keys',
        'SMS Notifications (Best Rate)',
        'Email Notifications (Best Rate)',
        'Phone Support',
        'On-site Training (4 hours)',
        '12 Months Access',
        'Backup & Recovery'
      ],
      transactionFeeRate: 0, // No transaction fees
      smsRate: 3, // GHS 0.03 in pesewas
      supportLevel: 'phone',
      trainingHours: 4
    }
  };

  static getAllPlans(): SubscriptionPlan[] {
    return Object.values(this.PLANS);
  }

  static getPlan(planId: string): SubscriptionPlan | null {
    return this.PLANS[planId] || null;
  }

  static async createSubscription(
    db: D1Database,
    userId: string,
    planId: string,
    paymentReference: string
  ): Promise<{ success: boolean; subscription?: any; error?: string }> {
    const plan = this.getPlan(planId);
    if (!plan) {
      return { success: false, error: 'Invalid plan selected' };
    }

    try {
      const subscriptionId = crypto.randomUUID();
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

      await db.prepare(`
        INSERT INTO subscriptions (
          id, user_id, plan_id, plan_name, price_paid, 
          start_date, end_date, member_limit, status, 
          payment_reference, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, CURRENT_TIMESTAMP)
      `).bind(
        subscriptionId,
        userId,
        planId,
        plan.name,
        plan.price,
        startDate.toISOString(),
        endDate.toISOString(),
        plan.memberLimit,
        paymentReference
      ).run();

      // Update user's subscription status
      await db.prepare(`
        UPDATE users SET 
          subscription_plan = ?, 
          subscription_expires = ?,
          member_limit = ?
        WHERE id = ?
      `).bind(planId, endDate.toISOString(), plan.memberLimit, userId).run();

      return {
        success: true,
        subscription: {
          id: subscriptionId,
          planId,
          planName: plan.name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          memberLimit: plan.memberLimit,
          status: 'active'
        }
      };
    } catch (error) {
      console.error('Subscription creation error:', error);
      return { success: false, error: 'Failed to create subscription' };
    }
  }

  static async getUserSubscription(
    db: D1Database,
    userId: string
  ): Promise<any> {
    try {
      const subscription = await db.prepare(`
        SELECT * FROM subscriptions 
        WHERE user_id = ? AND status = 'active'
        ORDER BY created_at DESC 
        LIMIT 1
      `).bind(userId).first();

      if (!subscription) {
        return null;
      }

      const plan = this.getPlan(subscription.plan_id);
      return {
        ...subscription,
        plan: plan,
        isExpired: new Date() > new Date(subscription.end_date),
        daysRemaining: Math.max(0, Math.ceil(
          (new Date(subscription.end_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        ))
      };
    } catch (error) {
      console.error('Get subscription error:', error);
      return null;
    }
  }

  static async checkSubscriptionLimits(
    db: D1Database,
    userId: string,
    action: 'add_member' | 'transaction'
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const subscription = await this.getUserSubscription(db, userId);
      
      if (!subscription) {
        return { allowed: false, reason: 'No active subscription' };
      }

      if (subscription.isExpired) {
        return { allowed: false, reason: 'Subscription expired' };
      }

      if (action === 'add_member' && subscription.member_limit > 0) {
        const memberCount = await db.prepare(`
          SELECT COUNT(*) as count FROM users WHERE created_by = ?
        `).bind(userId).first();

        if (memberCount && memberCount.count >= subscription.member_limit) {
          return { allowed: false, reason: `Member limit reached (${subscription.member_limit})` };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Check limits error:', error);
      return { allowed: false, reason: 'Error checking limits' };
    }
  }

  static async extendSubscription(
    db: D1Database,
    userId: string,
    additionalDays: number,
    paymentReference: string
  ): Promise<{ success: boolean; newEndDate?: string; error?: string }> {
    try {
      const subscription = await this.getUserSubscription(db, userId);
      if (!subscription) {
        return { success: false, error: 'No active subscription found' };
      }

      const currentEndDate = new Date(subscription.end_date);
      const newEndDate = new Date(currentEndDate.getTime() + (additionalDays * 24 * 60 * 60 * 1000));

      await db.prepare(`
        UPDATE subscriptions 
        SET end_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(newEndDate.toISOString(), subscription.id).run();

      await db.prepare(`
        UPDATE users 
        SET subscription_expires = ?
        WHERE id = ?
      `).bind(newEndDate.toISOString(), userId).run();

      // Record extension payment
      await db.prepare(`
        INSERT INTO subscription_payments (
          id, subscription_id, amount, payment_reference, 
          payment_type, created_at
        ) VALUES (?, ?, ?, ?, 'extension', CURRENT_TIMESTAMP)
      `).bind(
        crypto.randomUUID(),
        subscription.id,
        additionalDays * 1000, // Rough calculation
        paymentReference
      ).run();

      return {
        success: true,
        newEndDate: newEndDate.toISOString()
      };
    } catch (error) {
      console.error('Extend subscription error:', error);
      return { success: false, error: 'Failed to extend subscription' };
    }
  }

  static calculateTransactionFee(
    subscription: any,
    amount: number,
    transactionType: string
  ): number {
    // No transaction fees - users manage their own payment gateway keys
    return 0;
  }

  static getSMSRate(subscription: any): number {
    if (!subscription || !subscription.plan) {
      return 5; // Default GHS 0.05
    }
    return subscription.plan.smsRate;
  }
}