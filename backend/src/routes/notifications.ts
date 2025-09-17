import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HubtelService } from '../services/hubtel';
import { ResendService } from '../services/resend';
import { AuditService, AuditEvents } from '../services/audit';
import type { Env } from '../types/context';

const notificationsRouter = new Hono<{ Bindings: Env }>();

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
  type: z.enum(['verification', 'alert', 'transaction'])
});

const smsSchema = z.object({
  to: z.string(),
  message: z.string(),
  type: z.enum(['otp', 'alert', 'notification'])
});

// Send email notification
notificationsRouter.post('/email', zValidator('json', emailSchema), async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    const { to, subject, html, type } = c.req.valid('json');
    
    const resendService = new ResendService(c.env);
    
    const payload = {
      to,
      subject,
      html,
      metadata: {
        user_id: user.id,
        type
      }
    };
    
    const result = await resendService.sendEmail(payload);
    
    // Log email event
    const auditService = new AuditService(c.env);
    await auditService.logEvent({
      userId: user.id,
      action: AuditEvents.EMAIL_SENT,
      resource: 'notification',
      details: { to, subject, type, messageId: result.message_id },
      riskLevel: 'low',
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent')
    });
    
    return c.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.message_id
    });
    
  } catch (error) {
    console.error('Email notification error:', error);
    return c.json({ error: 'Failed to send email' }, 500);
  }
});

// Send SMS notification
notificationsRouter.post('/sms', zValidator('json', smsSchema), async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    const { to, message, type } = c.req.valid('json');
    
    const hubtelService = new HubtelService(c.env);
    
    const payload = {
      to,
      message,
      senderId: "MicroFi",
      security: {
        fraudCheck: true,
        rateLimit: "high"
      },
      metadata: {
        user_id: user.id,
        type
      }
    };
    
    const result = await hubtelService.sendSMS(payload);
    
    // Log SMS event
    const auditService = new AuditService(c.env);
    await auditService.logEvent({
      userId: user.id,
      action: AuditEvents.SMS_SENT,
      resource: 'notification',
      details: { to, type, messageId: result.message_id },
      riskLevel: 'medium',
      ipAddress: c.req.header('CF-Connecting-IP'),
      userAgent: c.req.header('User-Agent')
    });
    
    return c.json({
      success: true,
      message: 'SMS sent successfully',
      messageId: result.message_id
    });
    
  } catch (error) {
    console.error('SMS notification error:', error);
    return c.json({ error: 'Failed to send SMS' }, 500);
  }
});

// Send account verification email
notificationsRouter.post('/verify-account', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    const verificationToken = crypto.randomUUID();
    
    // Store verification token in KV with 24h expiration
    await c.env.USER_SESSIONS.put(
      `verify_${user.id}`, 
      verificationToken, 
      { expirationTtl: 86400 }
    );
    
    const resendService = new ResendService(c.env);
    const result = await resendService.sendAccountVerificationEmail(
      user.email, 
      verificationToken, 
      user.id
    );
    
    return c.json({
      success: true,
      message: 'Verification email sent',
      messageId: result.message_id
    });
    
  } catch (error) {
    console.error('Account verification error:', error);
    return c.json({ error: 'Failed to send verification email' }, 500);
  }
});

// Send transaction OTP
notificationsRouter.post('/transaction-otp', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    const { phoneNumber, amount, currency, recipient, transactionId } = await c.req.json();
    
    // Store OTP in KV with 5min expiration
    const hubtelService = new HubtelService(c.env);
    const result = await hubtelService.sendTransactionOTP(
      phoneNumber, 
      amount, 
      currency, 
      recipient, 
      user.id, 
      transactionId
    );
    
    // Store OTP in KV
    await c.env.USER_SESSIONS.put(
      `otp_${transactionId}`, 
      JSON.stringify({ otp: result.otp, userId: user.id, expires: result.expiresAt.getTime() }), 
      { expirationTtl: 300 }
    );
    
    return c.json({
      success: true,
      message: 'OTP sent successfully',
      messageId: result.messageId,
      otp: result.otp,
      expiresAt: result.expiresAt
    });
    
  } catch (error) {
    console.error('Transaction OTP error:', error);
    return c.json({ error: 'Failed to send OTP' }, 500);
  }
});

export { notificationsRouter };