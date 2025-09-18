import type { Context } from 'hono';

export interface FeeStructure {
  transactionType: 'transfer' | 'payment' | 'withdrawal' | 'deposit';
  feeType: 'fixed' | 'percentage' | 'tiered';
  amount: number; // In cents/kobo
  percentage?: number; // For percentage-based fees
  minFee?: number; // Minimum fee in cents
  maxFee?: number; // Maximum fee in cents
  currency: string;
}

export interface TierConfig {
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  fixedFee: number;
}

export class FeeService {
  private static readonly DEFAULT_FEES: Record<string, FeeStructure> = {
    // Internal transfers (free for MVP)
    internal_transfer: {
      transactionType: 'transfer',
      feeType: 'fixed',
      amount: 0,
      currency: 'GHS'
    },
    
    // External payments (gateway fees + our margin)
    paystack_payment: {
      transactionType: 'payment',
      feeType: 'percentage',
      amount: 0,
      percentage: 1.5, // 1.5% fee
      minFee: 100, // ₦1.00 minimum
      maxFee: 200000, // ₦2000 maximum
      currency: 'NGN'
    },
    
    flutterwave_payment: {
      transactionType: 'payment',
      feeType: 'percentage',
      amount: 0,
      percentage: 1.4, // 1.4% fee
      minFee: 100, // ₦1.00 minimum
      maxFee: 200000, // ₦2000 maximum
      currency: 'NGN'
    },
    
    // Withdrawals (higher fee for cash-out)
    withdrawal: {
      transactionType: 'withdrawal',
      feeType: 'tiered',
      amount: 0,
      currency: 'GHS'
    },
    
    // Deposits (small processing fee)
    deposit: {
      transactionType: 'deposit',
      feeType: 'fixed',
      amount: 50, // ₵0.50 fixed fee
      currency: 'GHS'
    }
  };

  private static readonly TIERED_WITHDRAWAL_FEES: TierConfig[] = [
    { minAmount: 0, maxAmount: 10000, feePercentage: 0.5, fixedFee: 100 }, // Up to ₵100: 0.5% + ₵1
    { minAmount: 10001, maxAmount: 50000, feePercentage: 0.3, fixedFee: 200 }, // ₵100-500: 0.3% + ₵2
    { minAmount: 50001, maxAmount: 100000, feePercentage: 0.2, fixedFee: 500 }, // ₵500-1000: 0.2% + ₵5
    { minAmount: 100001, maxAmount: Infinity, feePercentage: 0.1, fixedFee: 1000 } // Above ₵1000: 0.1% + ₵10
  ];

  /**
   * Calculate transaction fee based on amount and type
   */
  static calculateFee(
    transactionType: string,
    amount: number,
    currency: string = 'GHS'
  ): { fee: number; netAmount: number; details: any } {
    const feeStructure = this.DEFAULT_FEES[transactionType];
    
    if (!feeStructure) {
      return {
        fee: 0,
        netAmount: amount,
        details: { error: 'Unknown transaction type' }
      };
    }

    let calculatedFee = 0;
    let details: any = { feeStructure: feeStructure.feeType };

    switch (feeStructure.feeType) {
      case 'fixed':
        calculatedFee = feeStructure.amount;
        details.fixedFee = calculatedFee;
        break;

      case 'percentage':
        if (feeStructure.percentage) {
          calculatedFee = Math.round((amount * feeStructure.percentage) / 100);
          
          // Apply min/max limits
          if (feeStructure.minFee && calculatedFee < feeStructure.minFee) {
            calculatedFee = feeStructure.minFee;
          }
          if (feeStructure.maxFee && calculatedFee > feeStructure.maxFee) {
            calculatedFee = feeStructure.maxFee;
          }
          
          details.percentageFee = feeStructure.percentage;
          details.calculatedFee = calculatedFee;
        }
        break;

      case 'tiered':
        if (transactionType === 'withdrawal') {
          const tier = this.TIERED_WITHDRAWAL_FEES.find(
            t => amount >= t.minAmount && amount <= t.maxAmount
          );
          
          if (tier) {
            const percentageFee = Math.round((amount * tier.feePercentage) / 100);
            calculatedFee = percentageFee + tier.fixedFee;
            details.tier = tier;
            details.percentageFee = percentageFee;
            details.fixedFee = tier.fixedFee;
          }
        }
        break;
    }

    return {
      fee: calculatedFee,
      netAmount: amount - calculatedFee,
      details
    };
  }

  /**
   * Record fee transaction in database
   */
  static async recordFeeTransaction(
    db: D1Database,
    userId: string,
    originalTransactionId: string,
    feeAmount: number,
    feeType: string,
    currency: string
  ): Promise<void> {
    try {
      await db.prepare(`
        INSERT INTO transactions (
          id, user_id, account_id, amount, currency, type, 
          description, status, reference, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        `fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        null, // Fee transactions don't belong to specific accounts
        -feeAmount, // Negative amount for fee deduction
        currency,
        'fee',
        `Transaction fee for ${originalTransactionId}`,
        'completed',
        `fee_${originalTransactionId}`,
      ).run();
    } catch (error) {
      console.error('Failed to record fee transaction:', error);
      throw error;
    }
  }

  /**
   * Get fee estimate for frontend display
   */
  static getFeeEstimate(
    transactionType: string,
    amount: number,
    currency: string = 'GHS'
  ): {
    fee: number;
    netAmount: number;
    feePercentage?: number;
    description: string;
  } {
    const calculation = this.calculateFee(transactionType, amount, currency);
    
    const descriptions: Record<string, string> = {
      internal_transfer: 'Free internal transfer',
      paystack_payment: 'Payment processing fee (1.5%)',
      flutterwave_payment: 'Payment processing fee (1.4%)',
      withdrawal: 'Withdrawal processing fee (tiered)',
      deposit: 'Deposit processing fee (₵0.50)'
    };

    return {
      fee: calculation.fee,
      netAmount: calculation.netAmount,
      feePercentage: calculation.details.percentageFee,
      description: descriptions[transactionType] || 'Transaction fee'
    };
  }

  /**
   * Apply fee to transaction and update account balance
   */
  static async applyTransactionFee(
    db: D1Database,
    userId: string,
    accountId: string,
    transactionId: string,
    transactionType: string,
    amount: number,
    currency: string
  ): Promise<{ success: boolean; feeApplied: number; error?: string }> {
    try {
      const feeCalculation = this.calculateFee(transactionType, amount, currency);
      
      if (feeCalculation.fee > 0) {
        // Check if account has sufficient balance for fee
        const account = await db.prepare(
          'SELECT balance FROM accounts WHERE id = ? AND user_id = ?'
        ).bind(accountId, userId).first();

        if (!account || account.balance < feeCalculation.fee) {
          return {
            success: false,
            feeApplied: 0,
            error: 'Insufficient balance for transaction fee'
          };
        }

        // Deduct fee from account
        await db.prepare(
          'UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?'
        ).bind(feeCalculation.fee, accountId, userId).run();

        // Record fee transaction
        await this.recordFeeTransaction(
          db, userId, transactionId, feeCalculation.fee, transactionType, currency
        );
      }

      return {
        success: true,
        feeApplied: feeCalculation.fee
      };
    } catch (error) {
      console.error('Failed to apply transaction fee:', error);
      return {
        success: false,
        feeApplied: 0,
        error: error instanceof Error ? error.message : 'Fee application failed'
      };
    }
  }

  /**
   * Get revenue analytics for admin dashboard
   */
  static async getRevenueAnalytics(
    db: D1Database,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalRevenue: number;
    transactionCount: number;
    averageFee: number;
    revenueByType: Record<string, number>;
  }> {
    try {
      const dateFilter = startDate && endDate 
        ? `AND created_at BETWEEN '${startDate}' AND '${endDate}'`
        : '';

      const result = await db.prepare(`
        SELECT 
          SUM(ABS(amount)) as total_revenue,
          COUNT(*) as transaction_count,
          AVG(ABS(amount)) as average_fee,
          description
        FROM transactions 
        WHERE type = 'fee' ${dateFilter}
        GROUP BY description
      `).all();

      const totalRevenue = result.results.reduce((sum: number, row: any) => sum + (row.total_revenue || 0), 0);
      const transactionCount = result.results.reduce((sum: number, row: any) => sum + (row.transaction_count || 0), 0);
      const averageFee = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      const revenueByType: Record<string, number> = {};
      result.results.forEach((row: any) => {
        revenueByType[row.description || 'Unknown'] = row.total_revenue || 0;
      });

      return {
        totalRevenue,
        transactionCount,
        averageFee,
        revenueByType
      };
    } catch (error) {
      console.error('Failed to get revenue analytics:', error);
      return {
        totalRevenue: 0,
        transactionCount: 0,
        averageFee: 0,
        revenueByType: {}
      };
    }
  }
}

