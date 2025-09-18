'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiClient } from '@/lib/api-client-mt';

interface Subscription {
  tenant_id: string;
  tenant_name: string;
  plan: string;
  status: string;
  monthly_fee: number;
  next_billing: string;
  usage: {
    users: number;
    transactions: number;
    storage_mb: number;
  };
}

export const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    const response = await ApiClient.get('/admin/api/subscriptions');
    if (response.success) {
      setSubscriptions(response.data.subscriptions || []);
    }
    setLoading(false);
  };

  const updatePlan = async (tenantId: string, newPlan: string) => {
    const response = await ApiClient.put(`/admin/api/subscriptions/${tenantId}`, {
      plan: newPlan
    });
    if (response.success) {
      loadSubscriptions();
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanPrice = (plan: string) => {
    const prices = {
      starter: 120,
      professional: 280,
      premium: 500,
      enterprise: 800
    };
    return prices[plan as keyof typeof prices] || 0;
  };

  if (loading) {
    return <div className="p-6">Loading subscriptions...</div>;
  }

  const totalMRR = subscriptions.reduce((sum, sub) => sum + sub.monthly_fee, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total MRR</p>
          <p className="text-2xl font-bold text-green-600">GHS {totalMRR.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Active Tenants</p>
            <p className="text-2xl font-bold">{subscriptions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Starter Plans</p>
            <p className="text-2xl font-bold">{subscriptions.filter(s => s.plan === 'starter').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Professional Plans</p>
            <p className="text-2xl font-bold">{subscriptions.filter(s => s.plan === 'professional').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Premium+ Plans</p>
            <p className="text-2xl font-bold">{subscriptions.filter(s => ['premium', 'enterprise'].includes(s.plan)).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.tenant_id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{subscription.tenant_name}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className={getPlanColor(subscription.plan)}>
                      {subscription.plan.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      GHS {subscription.monthly_fee}/month
                    </span>
                    <span className="text-sm text-gray-600">
                      Next billing: {new Date(subscription.next_billing).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Users:</span>
                      <span className="ml-1 font-medium">{subscription.usage.users}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Transactions:</span>
                      <span className="ml-1 font-medium">{subscription.usage.transactions}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Storage:</span>
                      <span className="ml-1 font-medium">{subscription.usage.storage_mb}MB</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={subscription.plan} 
                    onValueChange={(value) => updatePlan(subscription.tenant_id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter (GHS 120)</SelectItem>
                      <SelectItem value="professional">Professional (GHS 280)</SelectItem>
                      <SelectItem value="premium">Premium (GHS 500)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (GHS 800)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};