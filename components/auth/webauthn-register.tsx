'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Shield, CheckCircle } from 'lucide-react';
import { WebAuthnClient } from '@/lib/webauthn-client';

interface WebAuthnRegisterProps {
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function WebAuthnRegister({ 
  userId, 
  userEmail, 
  onSuccess, 
  onError 
}: WebAuthnRegisterProps) {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState<boolean | null>(null);

  const checkSupport = async () => {
    const isSupported = await WebAuthnClient.isSupported();
    setSupported(isSupported);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await WebAuthnClient.register(userId, userEmail);
      
      if (result.success) {
        setRegistered(true);
        onSuccess?.();
      } else {
        setError(result.error || 'Registration failed');
        onError?.(result.error || 'Registration failed');
      }
    } catch (err) {
      const errorMsg = 'WebAuthn registration failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Check support on component mount
  if (supported === null) {
    checkSupport();
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Checking WebAuthn support...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-orange-600">
            <Shield className="w-5 h-5 mr-2" />
            WebAuthn Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Your browser doesn't support WebAuthn biometric authentication. 
              Please use a modern browser like Chrome, Firefox, Safari, or Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (registered) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            Biometric Authentication Enabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fingerprint className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-700 font-medium">
              Your biometric authentication is now set up!
            </p>
            <p className="text-sm text-gray-600 mt-2">
              You can now use Touch ID, Face ID, or Windows Hello to authenticate.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Fingerprint className="w-5 h-5 mr-2" />
          Enable Biometric Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            Secure your account with biometric authentication using:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Touch ID (macOS/iOS)</li>
            <li>Face ID (iOS)</li>
            <li>Windows Hello (Windows)</li>
            <li>Hardware security keys</li>
          </ul>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-gray-500">
            Banking-grade security • FIDO2 compliant
          </div>
          <Button 
            onClick={handleRegister} 
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Setting up...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Enable WebAuthn
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}