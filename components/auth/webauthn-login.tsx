'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Shield } from 'lucide-react';
import { WebAuthnClient } from '@/lib/webauthn-client';

interface WebAuthnLoginProps {
  userId: string;
  onSuccess?: (sessionToken: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function WebAuthnLogin({ 
  userId, 
  onSuccess, 
  onError,
  className = ''
}: WebAuthnLoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState<boolean | null>(null);

  const checkSupport = async () => {
    const isSupported = await WebAuthnClient.isSupported();
    setSupported(isSupported);
  };

  const handleAuthenticate = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await WebAuthnClient.authenticate(userId);
      
      if (result.success && result.sessionToken) {
        onSuccess?.(result.sessionToken);
      } else {
        setError(result.error || 'Authentication failed');
        onError?.(result.error || 'Authentication failed');
      }
    } catch (err) {
      const errorMsg = 'WebAuthn authentication failed';
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
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm">Checking biometric support...</span>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className={className}>
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            Biometric authentication not available in this browser.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleAuthenticate} 
        disabled={loading}
        variant="outline"
        className="w-full flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Authenticating...
          </>
        ) : (
          <>
            <Fingerprint className="w-4 h-4 mr-2" />
            Use Biometric Authentication
          </>
        )}
      </Button>

      <div className="text-xs text-center text-gray-500">
        Touch ID • Face ID • Windows Hello • Security Keys
      </div>
    </div>
  );
}