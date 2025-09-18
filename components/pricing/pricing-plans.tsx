'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 1200,
    originalPrice: 1500,
    memberLimit: 50,
    features: [
      'Up to 50 Members',
      'Basic Banking Features',
      'Own Payment Gateway Keys',
      'SMS: GHS 0.05 per message',
      'Email: GHS 0.02 per email',
      'Email Support',
      '3 Months Access'
    ],
    smsRate: 0.05,
    emailRate: 0.02,
    supportLevel: 'Email'
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    price: 2240,
    originalPrice: 2800,
    memberLimit: 200,
    features: [
      'Up to 200 Members',
      'Advanced Reports',
      'Basic Loan Management',
      'Own Payment Gateway Keys',
      'SMS: GHS 0.04 per message',
      'Email: GHS 0.015 per email',
      'WhatsApp Support',
      'Staff Training (2 hours)',
      '6 Months Access'
    ],
    smsRate: 0.04,
    emailRate: 0.015,
    supportLevel: 'WhatsApp',
    recommended: true
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 3600,
    originalPrice: 4500,
    memberLimit: -1,
    features: [
      'Unlimited Members',
      'Advanced Loan Management',
      'Custom Reports',
      'Own Payment Gateway Keys',
      'SMS: GHS 0.03 per message',
      'Email: GHS 0.01 per email',
      'Phone Support',
      'On-site Training (4 hours)',
      '12 Months Access'
    ],
    smsRate: 0.03,
    emailRate: 0.01,
    supportLevel: 'Phone'
  }
];

export function PricingPlans() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSelectPlan = async (planId: string) => {
    setLoading(planId);
    
    try {
      toast({
        title: 'Plan Selected',
        description: `Redirecting to payment for ${planId} plan...`
      });
      
      setTimeout(() => {
        setLoading(null);
        toast({
          title: 'Payment Required',
          description: 'Please complete payment via Mobile Money to activate your plan.'
        });
      }, 2000);
    } catch (error) {
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Budget-Friendly Pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Plans that fit your GHS 3,000 budget
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            🎉 Early Bird: 20% OFF
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.recommended ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Best Value
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(plan.originalPrice)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-4 w-4 text-green-500">✓</div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Transaction Fees:</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SMS Rate:</span>
                    <span className="font-medium">GHS {plan.smsRate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Email Rate:</span>
                    <span className="font-medium">GHS {plan.emailRate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Support:</span>
                    <span className="font-medium">{plan.supportLevel}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading === plan.id}
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  {loading === plan.id ? 'Processing...' : `Choose ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}