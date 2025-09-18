'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface CommunicationBalance {
  smsBalance: number;
  emailBalance: number;
  smsRate: number;
  emailRate: number;
}

export function CommunicationBalance() {
  const [balance, setBalance] = useState<CommunicationBalance>({
    smsBalance: 0,
    emailBalance: 0,
    smsRate: 0.04,
    emailRate: 0.015
  });
  const [topUpAmount, setTopUpAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBalance({
        smsBalance: 1250, // GHS 12.50 in pesewas
        emailBalance: 800, // GHS 8.00 in pesewas
        smsRate: 4, // GHS 0.04 in pesewas
        emailRate: 1.5 // GHS 0.015 in pesewas
      });
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid top-up amount',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Top-up Successful',
        description: `GHS ${amount} added to communication balance`
      });
      
      setTopUpAmount('');
      loadBalance();
    } catch (error) {
      toast({
        title: 'Top-up Failed',
        description: 'Failed to process top-up payment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  const calculateMessages = (balance: number, rate: number) => {
    return Math.floor(balance / rate);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Communication Balance</CardTitle>
          <CardDescription>
            Manage your SMS and Email credits for notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">SMS Balance</h4>
                <Badge variant="outline">GHS {balance.smsRate / 100} per SMS</Badge>
              </div>
              <div className="text-2xl font-bold text-primary">
                GHS {formatBalance(balance.smsBalance)}
              </div>
              <p className="text-sm text-muted-foreground">
                ~{calculateMessages(balance.smsBalance, balance.smsRate)} SMS messages remaining
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Email Balance</h4>
                <Badge variant="outline">GHS {balance.emailRate / 100} per email</Badge>
              </div>
              <div className="text-2xl font-bold text-primary">
                GHS {formatBalance(balance.emailBalance)}
              </div>
              <p className="text-sm text-muted-foreground">
                ~{calculateMessages(balance.emailBalance, balance.emailRate)} emails remaining
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Up Balance</CardTitle>
          <CardDescription>
            Add credit to your communication balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Top-up Amount (GHS)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              min="1"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTopUpAmount('10')}
            >
              GHS 10
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTopUpAmount('25')}
            >
              GHS 25
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setTopUpAmount('50')}
            >
              GHS 50
            </Button>
          </div>

          <Button 
            onClick={handleTopUp} 
            disabled={loading || !topUpAmount}
            className="w-full"
          >
            {loading ? 'Processing...' : `Top Up GHS ${topUpAmount || '0'}`}
          </Button>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Estimated Usage:</p>
            <p>GHS 10 = ~250 SMS or ~650 Emails</p>
            <p>GHS 25 = ~625 SMS or ~1,650 Emails</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}