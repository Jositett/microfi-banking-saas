'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiClient } from '@/lib/api-client-mt';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  subscription_plan: string;
  status: string;
  user_count: number;
  total_balance: number;
  created_at: string;
}

export const TenantManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    const response = await ApiClient.getTenants();
    if (response.success) {
      setTenants(response.data.tenants || []);
    }
    setLoading(false);
  };

  const handleCreateTenant = async (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      domain: formData.get('domain') as string,
      subscription_plan: formData.get('subscription_plan') as string,
      settings: {
        company_name: formData.get('company_name') as string,
        currency: formData.get('currency') as string,
        primary_color: formData.get('primary_color') as string,
      }
    };

    const response = await ApiClient.createTenant(data);
    if (response.success) {
      setShowCreateForm(false);
      loadTenants();
    }
  };

  if (loading) {
    return <div className="p-6">Loading tenants...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tenant Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Create New Tenant
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tenant Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Input id="domain" name="domain" placeholder="client1.microfi.com" required />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input id="company_name" name="company_name" />
                </div>
                <div>
                  <Label htmlFor="subscription_plan">Subscription Plan</Label>
                  <Select name="subscription_plan" defaultValue="starter">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue="GHS">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="NGN">NGN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <Input id="primary_color" name="primary_color" type="color" defaultValue="#3b82f6" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Create Tenant</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{tenant.name}</h3>
                  <p className="text-sm text-gray-600">{tenant.domain}</p>
                  <div className="mt-2 flex space-x-4 text-sm">
                    <span>Plan: {tenant.subscription_plan}</span>
                    <span>Users: {tenant.user_count}</span>
                    <span>Balance: {(tenant.total_balance / 100).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};