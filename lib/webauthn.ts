import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

export class WebAuthnClient {
  async registerCredential(userId: string, userEmail: string) {
    try {
      // Get registration options from backend
      const optionsResponse = await fetch(`${API_BASE_URL}/webauthn/register/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail })
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Start WebAuthn registration
      const credential = await startRegistration(options);

      // Verify registration with backend
      const verificationResponse = await fetch(`${API_BASE_URL}/webauthn/register/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, response: credential })
      });

      const verification = await verificationResponse.json();
      return verification;
    } catch (error) {
      console.error('WebAuthn registration error:', error);
      throw error;
    }
  }

  async authenticateCredential(userId: string) {
    try {
      // Get authentication options
      const optionsResponse = await fetch(`${API_BASE_URL}/webauthn/authenticate/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Start WebAuthn authentication
      const credential = await startAuthentication(options);

      // Verify authentication with backend
      const verificationResponse = await fetch(`${API_BASE_URL}/webauthn/authenticate/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, response: credential })
      });

      const verification = await verificationResponse.json();
      return verification;
    } catch (error) {
      console.error('WebAuthn authentication error:', error);
      throw error;
    }
  }

  isWebAuthnSupported(): boolean {
    return !!(navigator.credentials && navigator.credentials.create);
  }
}

export const webauthnClient = new WebAuthnClient();