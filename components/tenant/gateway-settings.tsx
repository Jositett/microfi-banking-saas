'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

interface Gateway {
  id: string;
  gateway_type: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export default function GatewaySettings() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const [paystackConfig, setPaystackConfig] = useState({
    public_key: '',
    secret_key: ''
  });

  const [flutterwaveConfig, setFlutterwaveConfig] = useState({
    public_key: '',
    secret_key: '',
    encryption_key: ''
  });

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const response = await fetch('/api/tenant/gateways');
      const data = await response.json();
      if (data.success) {
        setGateways(data.gateways);
      }
    } catch (error) {
      console.error('Failed to fetch gateways:', error);
    } finally {
      setLoading(false);
    }
  };

  const configureGateway = async (gatewayType: string, config: any) => {
    setConfiguring(gatewayType);
    try {
      const response = await fetch('/api/tenant/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateway_type: gatewayType, config })
      });

      const data = await response.json();
      if (data.success) {
        await fetchGateways();
        // Clear form
        if (gatewayType === 'paystack') {
          setPaystackConfig({ public_key: '', secret_key: '' });
        } else if (gatewayType === 'flutterwave') {
          setFlutterwaveConfig({ public_key: '', secret_key: '', encryption_key: '' });
        }
      }
    } catch (error) {
      console.error('Failed to configure gateway:', error);
    } finally {
      setConfiguring(null);
    }
  };

  const testGateway = async (gatewayId: string) => {
    setTesting(gatewayId);
    try {
      const response = await fetch(`/api/tenant/gateways/${gatewayId}/test`, {
        method: 'POST'
      });
      const data = await response.json();
      // Handle test result
    } catch (error) {
      console.error('Gateway test failed:', error);
    } finally {
      setTesting(null);
    }
  };

  const toggleGatewayStatus = async (gatewayId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`/api/tenant/gateways/${gatewayId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchGateways();
      }
    } catch (error) {
      console.error('Failed to update gateway status:', error);
    }
  };

  const getGatewayByType = (type: string) => 
    gateways.find(g => g.gateway_type === type);

  if (loading) {
    return <div className="p-6">Loading gateway settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Payment Gateway Settings</h1>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Your API keys are encrypted and stored securely. 
          MicroFi never has access to your plaintext keys and is not liable for any key exposure.
          You maintain full control over your payment processing.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="paystack" className="space-y-4">
        <TabsList>
          <TabsTrigger value="paystack">Paystack</TabsTrigger>
          <TabsTrigger value="flutterwave">Flutterwave</TabsTrigger>
          <TabsTrigger value="mtn">MTN MoMo</TabsTrigger>
        </TabsList>

        <TabsContent value="paystack">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Paystack Configuration
                {getGatewayByType('paystack') && (
                  <Badge variant={getGatewayByType('paystack')?.status === 'active' ? 'default' : 'secondary'}>
                    {getGatewayByType('paystack')?.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paystack-public">Public Key</Label>
                <Input
                  id="paystack-public"
                  placeholder="pk_test_..."
                  value={paystackConfig.public_key}
                  onChange={(e) => setPaystackConfig(prev => ({ ...prev, public_key: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack-secret">Secret Key</Label>
                <Input
                  id="paystack-secret"
                  type="password"
                  placeholder="sk_test_..."
                  value={paystackConfig.secret_key}
                  onChange={(e) => setPaystackConfig(prev => ({ ...prev, secret_key: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => configureGateway('paystack', paystackConfig)}
                  disabled={configuring === 'paystack' || !paystackConfig.public_key || !paystackConfig.secret_key}
                >
                  {configuring === 'paystack' ? 'Configuring...' : 'Configure'}
                </Button>
                {getGatewayByType('paystack') && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => testGateway(getGatewayByType('paystack')!.id)}
                      disabled={testing === getGatewayByType('paystack')?.id}
                    >
                      {testing === getGatewayByType('paystack')?.id ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button
                      variant={getGatewayByType('paystack')?.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => toggleGatewayStatus(
                        getGatewayByType('paystack')!.id,
                        getGatewayByType('paystack')!.status
                      )}
                    >
                      {getGatewayByType('paystack')?.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flutterwave">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Flutterwave Configuration
                {getGatewayByType('flutterwave') && (
                  <Badge variant={getGatewayByType('flutterwave')?.status === 'active' ? 'default' : 'secondary'}>
                    {getGatewayByType('flutterwave')?.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flw-public">Public Key</Label>
                <Input
                  id="flw-public"
                  placeholder="FLWPUBK_TEST-..."
                  value={flutterwaveConfig.public_key}
                  onChange={(e) => setFlutterwaveConfig(prev => ({ ...prev, public_key: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flw-secret">Secret Key</Label>
                <Input
                  id="flw-secret"
                  type="password"
                  placeholder="FLWSECK_TEST-..."
                  value={flutterwaveConfig.secret_key}
                  onChange={(e) => setFlutterwaveConfig(prev => ({ ...prev, secret_key: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flw-encryption">Encryption Key</Label>
                <Input
                  id="flw-encryption"
                  type="password"
                  placeholder="FLWSECK_TEST..."
                  value={flutterwaveConfig.encryption_key}
                  onChange={(e) => setFlutterwaveConfig(prev => ({ ...prev, encryption_key: e.target.value }))}
                />
              </div>
              <Button
                onClick={() => configureGateway('flutterwave', flutterwaveConfig)}
                disabled={configuring === 'flutterwave' || !flutterwaveConfig.public_key}
              >
                {configuring === 'flutterwave' ? 'Configuring...' : 'Configure'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mtn">
          <Card>
            <CardHeader>
              <CardTitle>MTN Mobile Money</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  MTN MoMo integration coming soon. Contact support for early access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Security & Compliance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">Keys encrypted with AES-256-GCM</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">Tenant-specific encryption keys</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">No plaintext storage</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">MFI compliant - software only</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}