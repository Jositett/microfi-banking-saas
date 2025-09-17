import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse 
} from '@simplewebauthn/server';
import type { Env } from '../main';

export class WebAuthnService {
  constructor(private env: Env) {}

  async generateRegistrationOptions(userId: string, userEmail: string) {
    const options = await generateRegistrationOptions({
      rpID: this.env.WEBAUTHN_RP_ID,
      rpName: this.env.WEBAUTHN_RP_NAME,
      userID: new TextEncoder().encode(userId),
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
      const credential = {
        credentialID: verification.registrationInfo.credentialID,
        publicKey: verification.registrationInfo.credentialPublicKey,
        counter: verification.registrationInfo.counter,
        deviceType: verification.registrationInfo.credentialDeviceType,
        backedUp: verification.registrationInfo.credentialBackedUp,
        createdAt: new Date().toISOString()
      };

      await this.env.WEBAUTHN_CREDENTIALS.put(
        `${userId}_${btoa(String.fromCharCode(...new Uint8Array(verification.registrationInfo.credentialID)))}`,
        JSON.stringify(credential)
      );

      await this.env.USER_SESSIONS.delete(`challenge_${userId}`);

      await this.logSecurityEvent(userId, 'webauthn_registration', {
        credentialID: btoa(String.fromCharCode(...new Uint8Array(verification.registrationInfo.credentialID))),
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

    // Find credential by searching all user credentials
    const list = await this.env.WEBAUTHN_CREDENTIALS.list({ prefix: `${userId}_` });
    let storedCredential = null;
    let credentialKey = '';
    
    console.log('Looking for credential with response.id:', response.id);
    console.log('Found credentials:', list.keys.map(k => k.name));
    
    for (const key of list.keys) {
      const cred = await this.env.WEBAUTHN_CREDENTIALS.get(key.name);
      if (cred) {
        const parsed = JSON.parse(cred);
        console.log('Checking credential:', key.name, 'with ID:', parsed.credentialID);
        
        // Try direct comparison first
        if (key.name.endsWith(response.id)) {
          storedCredential = cred;
          credentialKey = key.name;
          console.log('Found matching credential by key suffix');
          break;
        }
      }
    }
    
    if (!storedCredential) {
      console.error('No matching credential found for response.id:', response.id);
      throw new Error('Credential not found');
    }

    const credential = JSON.parse(storedCredential);
    
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: this.env.WEBAUTHN_ORIGIN,
      expectedRPID: this.env.WEBAUTHN_RP_ID,
      authenticator: {
        credentialID: credential.credentialID,
        credentialPublicKey: credential.publicKey,
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
        credentialUsed: credentialID
      };

      await this.env.USER_SESSIONS.put(sessionToken, JSON.stringify(session), {
        expirationTtl: 3600
      });

      await this.env.USER_SESSIONS.delete(`auth_challenge_${userId}`);

      await this.logSecurityEvent(userId, 'webauthn_authentication', {
        credentialID,
        sessionToken: sessionToken.substring(0, 8) + '...'
      });

      return { verified: true, sessionToken };
    }

    return { verified: false };
  }

  private async getUserCredentials(userId: string) {
    const credentials = [];
    const list = await this.env.WEBAUTHN_CREDENTIALS.list({ prefix: `${userId}_` });
    
    for (const key of list.keys) {
      const credential = await this.env.WEBAUTHN_CREDENTIALS.get(key.name);
      if (credential) {
        const parsed = JSON.parse(credential);
        if (parsed.credentialID) {
          credentials.push({
            id: parsed.credentialID,
            type: 'public-key',
            transports: ['internal', 'hybrid']
          });
        }
      }
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