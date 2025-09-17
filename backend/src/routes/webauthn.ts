import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { WebAuthnService } from '../services/webauthn';
import type { Env } from '../main';

const webauthnRouter = new Hono<{ Bindings: Env }>();

const registrationSchema = z.object({
  userId: z.string(),
  userEmail: z.string().email()
});

const verificationSchema = z.object({
  userId: z.string(),
  response: z.any()
});

// WebAuthn Registration - Generate Options
webauthnRouter.post('/register/begin', zValidator('json', registrationSchema), async (c) => {
  const { userId, userEmail } = c.req.valid('json');
  
  try {
    const webauthnService = new WebAuthnService(c.env);
    const options = await webauthnService.generateRegistrationOptions(userId, userEmail);
    
    return c.json(options);
  } catch (error) {
    console.error('WebAuthn registration begin error:', error);
    return c.json({ error: 'Failed to generate registration options' }, 500);
  }
});

// WebAuthn Registration - Verify Response
webauthnRouter.post('/register/complete', zValidator('json', verificationSchema), async (c) => {
  const { userId, response } = c.req.valid('json');
  
  try {
    const webauthnService = new WebAuthnService(c.env);
    const verification = await webauthnService.verifyRegistration(userId, response);
    
    if (verification.verified) {
      return c.json({ 
        verified: true,
        message: 'WebAuthn credential registered successfully'
      });
    } else {
      return c.json({ 
        verified: false,
        message: 'Registration verification failed'
      }, 400);
    }
  } catch (error) {
    console.error('WebAuthn registration complete error:', error);
    return c.json({ error: 'Registration verification failed' }, 500);
  }
});

// WebAuthn Authentication - Generate Options
webauthnRouter.post('/authenticate/begin', zValidator('json', z.object({ userId: z.string() })), async (c) => {
  const { userId } = c.req.valid('json');
  
  try {
    const webauthnService = new WebAuthnService(c.env);
    const options = await webauthnService.generateAuthenticationOptions(userId);
    
    return c.json(options);
  } catch (error) {
    console.error('WebAuthn authentication begin error:', error);
    return c.json({ error: 'Failed to generate authentication options' }, 500);
  }
});

// WebAuthn Authentication - Verify Response
webauthnRouter.post('/authenticate/complete', zValidator('json', verificationSchema), async (c) => {
  const { userId, response } = c.req.valid('json');
  
  try {
    const webauthnService = new WebAuthnService(c.env);
    const result = await webauthnService.verifyAuthentication(userId, response);
    
    if (result.verified) {
      return c.json({
        verified: true,
        sessionToken: result.sessionToken,
        message: 'Authentication successful'
      });
    } else {
      return c.json({
        verified: false,
        message: 'Authentication failed'
      }, 401);
    }
  } catch (error) {
    console.error('WebAuthn authentication complete error:', error);
    return c.json({ error: 'Authentication verification failed' }, 500);
  }
});

export { webauthnRouter };