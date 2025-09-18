// WebAuthn client utilities for browser-based authentication

export interface WebAuthnCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject?: ArrayBuffer;
    authenticatorData?: ArrayBuffer;
    signature?: ArrayBuffer;
  };
  type: string;
}

export class WebAuthnClient {
  private static baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com' 
    : 'http://127.0.0.1:8787';

  static async isSupported(): Promise<boolean> {
    return !!(window.PublicKeyCredential && 
              window.PublicKeyCredential.create && 
              window.PublicKeyCredential.get);
  }

  static async register(userId: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!await this.isSupported()) {
        return { success: false, error: 'WebAuthn not supported in this browser' };
      }

      const token = localStorage.getItem('auth-token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      // Get registration options from server
      const optionsResponse = await fetch(`${this.baseUrl}/webauthn/register/begin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, userEmail })
      });

      if (!optionsResponse.ok) {
        const error = await optionsResponse.json();
        return { success: false, error: error.error || 'Failed to get registration options' };
      }

      const options = await optionsResponse.json();

      // Convert base64url strings to ArrayBuffers
      const publicKeyCredentialCreationOptions = {
        ...options,
        challenge: this.base64urlToArrayBuffer(options.challenge),
        user: {
          ...options.user,
          id: this.base64urlToArrayBuffer(options.user.id)
        },
        excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
          ...cred,
          id: this.base64urlToArrayBuffer(cred.id)
        }))
      };

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        return { success: false, error: 'Failed to create credential' };
      }

      // Prepare credential for server
      const credentialForServer = {
        id: credential.id,
        rawId: this.arrayBufferToBase64url(credential.rawId),
        response: {
          clientDataJSON: this.arrayBufferToBase64url(credential.response.clientDataJSON),
          attestationObject: this.arrayBufferToBase64url((credential.response as AuthenticatorAttestationResponse).attestationObject)
        },
        type: credential.type
      };

      // Send to server for verification
      const verificationResponse = await fetch(`${this.baseUrl}/webauthn/register/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          response: credentialForServer
        })
      });

      const result = await verificationResponse.json();
      
      if (result.verified) {
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Registration verification failed' };
      }

    } catch (error) {
      console.error('WebAuthn registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  static async authenticate(userId: string): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
    try {
      if (!await this.isSupported()) {
        return { success: false, error: 'WebAuthn not supported in this browser' };
      }

      const token = localStorage.getItem('auth-token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      // Get authentication options from server
      const optionsResponse = await fetch(`${this.baseUrl}/webauthn/authenticate/begin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!optionsResponse.ok) {
        const error = await optionsResponse.json();
        return { success: false, error: error.error || 'Failed to get authentication options' };
      }

      const options = await optionsResponse.json();

      // Convert base64url strings to ArrayBuffers
      const publicKeyCredentialRequestOptions = {
        ...options,
        challenge: this.base64urlToArrayBuffer(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred: any) => ({
          ...cred,
          id: this.base64urlToArrayBuffer(cred.id)
        }))
      };

      // Get credential
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (!credential) {
        return { success: false, error: 'Authentication cancelled' };
      }

      // Prepare credential for server
      const credentialForServer = {
        id: credential.id,
        rawId: this.arrayBufferToBase64url(credential.rawId),
        response: {
          clientDataJSON: this.arrayBufferToBase64url(credential.response.clientDataJSON),
          authenticatorData: this.arrayBufferToBase64url((credential.response as AuthenticatorAssertionResponse).authenticatorData),
          signature: this.arrayBufferToBase64url((credential.response as AuthenticatorAssertionResponse).signature)
        },
        type: credential.type
      };

      // Send to server for verification
      const verificationResponse = await fetch(`${this.baseUrl}/webauthn/authenticate/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          response: credentialForServer
        })
      });

      const result = await verificationResponse.json();
      
      if (result.verified) {
        return { success: true, sessionToken: result.sessionToken };
      } else {
        return { success: false, error: result.message || 'Authentication failed' };
      }

    } catch (error) {
      console.error('WebAuthn authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Utility functions for base64url encoding/decoding
  private static arrayBufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private static base64urlToArrayBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}