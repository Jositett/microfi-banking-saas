'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PaystackPaymentProps {
  onSuccess?: (reference: string, amount: number) => void;
}

export function PaystackPayment({ onSuccess }: PaystackPaymentProps) {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initializePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://127.0.0.1:8787/api/payments/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          email: email || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Payment initialization failed');
      }

      const result = await response.json();

      if (result.success && result.data.authorization_url) {
        // Open Paystack payment page
        window.open(result.data.authorization_url, '_blank');
        
        toast({
          title: 'Payment Initialized',
          description: 'Redirecting to Paystack payment page...'
        });

        // In a real app, you'd handle the callback
        // For demo, we'll simulate success after 5 seconds
        setTimeout(() => {
          verifyPayment(result.data.reference);
        }, 5000);
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Payment initialization failed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://127.0.0.1:8787/api/payments/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reference })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Payment Successful',
          description: `₦${result.amount} has been credited to your account`
        });
        
        onSuccess?.(reference, result.amount);
        
        // Reset form
        setAmount('');
        setEmail('');
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Error',
        description: error instanceof Error ? error.message : 'Payment verification failed',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Money</CardTitle>
        <CardDescription>
          Fund your account using Paystack
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₦)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button 
          onClick={initializePayment} 
          disabled={loading || !amount}
          className="w-full"
        >
          {loading ? 'Processing...' : `Pay ₦${amount || '0'}`}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Secure payment powered by Paystack
        </p>
      </CardContent>
    </Card>
  );
}