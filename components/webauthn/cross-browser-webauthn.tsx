'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface WebAuthnSupport {
  supported: boolean;
  platform: string;
  browser: string;
  features: string[];
}

export function CrossBrowserWebAuthn() {
  const [support, setSupport] = useState<WebAuthnSupport | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkWebAuthnSupport();
  }, []);

  const checkWebAuthnSupport = async () => {
    const isSupported = window.PublicKeyCredential !== undefined;
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    const features = [];
    if (isSupported) {
      features.push('WebAuthn API');
      try {
        const platformAuth = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (platformAuth) {
          features.push('Platform Authenticator');
        }
        const conditionalAuth = await window.PublicKeyCredential.isConditionalMediationAvailable();
        if (conditionalAuth) {
          features.push('Conditional Mediation');
        }
      } catch (e) {
        // Ignore errors for feature detection
      }
    }

    setSupport({
      supported: isSupported,
      platform,
      browser,
      features
    });
  };

  const registerWebAuthn = async () => {
    if (!support?.supported) {
      toast({
        title: 'WebAuthn Not Supported',
        description: 'Your browser does not support WebAuthn',
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

      const optionsResponse = await fetch('http://127.0.0.1:8787/webauthn/register/begin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsResponse.json();

      let attResp;
      try {
        attResp = await startRegistration(options);
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Registration cancelled or not allowed');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('WebAuthn not supported on this device');
        } else if (error.name === 'SecurityError') {
          throw new Error('Security error - ensure HTTPS connection');
        }
        throw error;
      }

      const verificationResponse = await fetch('http://127.0.0.1:8787/webauthn/register/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response: attResp })
      });

      if (!verificationResponse.ok) {
        throw new Error('Registration verification failed');
      }

      const verification = await verificationResponse.json();

      if (verification.verified) {
        setRegistered(true);
        toast({
          title: 'Registration Successful',
          description: 'WebAuthn credential registered successfully'
        });
      } else {
        throw new Error('Registration verification failed');
      }
    } catch (error) {
      console.error('WebAuthn registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'WebAuthn registration failed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!support) {
    return <div>Checking WebAuthn support...</div>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>WebAuthn Security</CardTitle>
        <CardDescription>
          Cross-browser biometric authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Support Status</span>
            <Badge variant={support.supported ? 'default' : 'destructive'}>
              {support.supported ? 'Supported' : 'Not Supported'}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Platform: {support.platform}</div>
            <div>Browser: {support.browser}</div>
            <div>Features: {support.features.join(', ') || 'None'}</div>
          </div>
        </div>

        {support.supported && (
          <div className="space-y-2">
            <Button 
              onClick={registerWebAuthn} 
              disabled={loading || registered}
              className="w-full"
              variant={registered ? 'secondary' : 'default'}
            >
              {loading ? 'Registering...' : registered ? 'Registered' : 'Register WebAuthn'}
            </Button>
          </div>
        )}

        {!support.supported && (
          <div className="text-sm text-muted-foreground">
            WebAuthn is not supported in your current browser. Please use a modern browser like Chrome, Firefox, Safari, or Edge.
          </div>
        )}
      </CardContent>
    </Card>
  );
}