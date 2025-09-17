import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse 
} from '@simplewebauthn/server';
import type { Env } from '../types/context';

export class WebAuthnService {
  constructor(private env: Env) {}

  async generateRegistrationOptions(userId: string, userEmail: string) {
    const options = await generateRegistrationOptions({
      rpID: this.env.WEBAUTHN_RP_ID,
      rpName: this.env.WEBAUTHN_RP_NAME,
      userID: new Uint8Array(new TextEncoder().encode(userId)),
      userName: userEmail,
      userDisplayName: userEmail,
      attestationType: 'direct',
      excludeCredentials: await this.getUserCredentials(userId),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred'
      },
      supportedAlgorithmIDs: [-7, -257]
    });

    await this.env.USER_SESSIONS.put(
      `challenge_${userId}`, 
      options.challenge, 
      { expirationTtl: 300 }
    );

    return options;
  }

  async verifyRegistration(userId: string, response: any) {
    const challenge = await this.env.USER_SESSIONS.get(`challenge_${userId}`);
    if (!challenge) {
      throw new Error('Challenge not found or expired');
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: this.env.WEBAUTHN_ORIGIN,
      expectedRPID: this.env.WEBAUTHN_RP_ID,
      requireUserVerification: true
    });

    if (verification.verified && verification.registrationInfo) {
      // Convert public key to base64url for storage
      const publicKeyBuffer = verification.registrationInfo.credential.publicKey;
      const publicKeyBase64 = btoa(String.fromCharCode(...publicKeyBuffer))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      const credentialData = {
        credentialID: verification.registrationInfo.credential.id,
        credentialPublicKey: publicKeyBase64,
        counter: verification.registrationInfo.credential.counter || 0,
        deviceType: verification.registrationInfo.credentialDeviceType,
        backedUp: verification.registrationInfo.credentialBackedUp,
        createdAt: new Date().toISOString(),
        credentialIDBase64: response.id // Store the response ID for lookup
      };
      
      // Use consistent key format
      const credentialKey = `${userId}_${response.id}`;
      await this.env.WEBAUTHN_CREDENTIALS.put(credentialKey, JSON.stringify(credentialData));
      
      await this.env.USER_SESSIONS.delete(`challenge_${userId}`);

      await this.logSecurityEvent(userId, 'webauthn_registration', {
        credentialIDBase64: response.id,
        deviceType: verification.registrationInfo.credentialDeviceType
      });
    }

    return verification;
  }

  async generateAuthenticationOptions(userId: string) {
    const credentials = await this.getUserCredentials(userId);
    
    const options = await generateAuthenticationOptions({
      rpID: this.env.WEBAUTHN_RP_ID,
      allowCredentials: credentials,
      userVerification: 'required'
    });

    await this.env.USER_SESSIONS.put(
      `auth_challenge_${userId}`, 
      options.challenge, 
      { expirationTtl: 300 }
    );

    return options;
  }

  async verifyAuthentication(userId: string, response: any) {
    const challenge = await this.env.USER_SESSIONS.get(`auth_challenge_${userId}`);
    if (!challenge) {
      throw new Error('Authentication challenge not found or expired');
    }

    const credentialKey = `${userId}_${response.id}`;
    const storedCredential = await this.env.WEBAUTHN_CREDENTIALS.get(credentialKey);
    
    if (!storedCredential) {
      throw new Error('Credential not found');
    }

    const credential = JSON.parse(storedCredential);
    
    // Convert base64url string back to Uint8Array
    const publicKeyBase64 = credential.credentialPublicKey;
    const base64 = publicKeyBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(publicKeyBase64.length + (4 - (publicKeyBase64.length % 4)) % 4, '=');
    const publicKeyBuffer = new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
    
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: this.env.WEBAUTHN_ORIGIN,
      expectedRPID: this.env.WEBAUTHN_RP_ID,
      credential: {
        id: credential.credentialID,
        publicKey: publicKeyBuffer,
        counter: credential.counter
      },
      requireUserVerification: true
    });

    if (verification.verified) {
      credential.counter = verification.authenticationInfo.newCounter;
      await this.env.WEBAUTHN_CREDENTIALS.put(credentialKey, JSON.stringify(credential));

      const sessionToken = this.generateSecureToken();
      const session = {
        userId,
        mfaVerified: true,
        lastActivity: Date.now(),
        expiresAt: Date.now() + 3600000,
        credentialUsed: response.id
      };

      await this.env.USER_SESSIONS.put(sessionToken, JSON.stringify(session), {
        expirationTtl: 3600
      });

      await this.env.USER_SESSIONS.delete(`auth_challenge_${userId}`);

      await this.logSecurityEvent(userId, 'webauthn_authentication', {
        credentialID: response.id,
        sessionToken: sessionToken.substring(0, 8) + '...'
      });

      return { verified: true, sessionToken };
    }

    return { verified: false };
  }

  private async getUserCredentials(userId: string) {
    const credentials = [];
    try {
      const list = await this.env.WEBAUTHN_CREDENTIALS.list({ prefix: `${userId}_` });
      
      for (const key of list.keys) {
        const credential = await this.env.WEBAUTHN_CREDENTIALS.get(key.name);
        if (credential) {
          const parsed = JSON.parse(credential);
          credentials.push({
            id: parsed.credentialIDBase64,
            transports: ['internal' as const, 'hybrid' as const]
          });
        }
      }
    } catch (error) {
      console.error('Error getting user credentials:', error);
    }
    
    return credentials;
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async logSecurityEvent(userId: string, action: string, details: any) {
    const logId = `${Date.now()}_${this.generateSecureToken().substring(0, 8)}`;
    const logEntry = {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      source: 'webauthn_service'
    };

    await this.env.AUDIT_LOGS.put(logId, JSON.stringify(logEntry), {
      expirationTtl: 31536000
    });
  }
}