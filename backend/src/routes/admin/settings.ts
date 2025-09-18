import { Hono } from 'hono';
import type { HonoContext } from '../../types/hono';

const adminSettingsRouter = new Hono<HonoContext>();

// Get system settings
adminSettingsRouter.get('/', async (c) => {
  try {
    const settings = await c.env.DB.prepare(`
      SELECT key, value, description, category 
      FROM system_settings 
      ORDER BY category, key
    `).all();

    const settingsMap = (settings.results || []).reduce((acc: any, setting: any) => {
      if (!acc[setting.category]) acc[setting.category] = {};
      acc[setting.category][setting.key] = {
        value: setting.value,
        description: setting.description
      };
      return acc;
    }, {});

    return c.json({ 
      success: true, 
      settings: settingsMap 
    });
  } catch (error) {
    return c.json({ 
      success: true, 
      settings: {
        system: {
          name: { value: 'MicroFi Banking', description: 'System name' },
          version: { value: '1.0.0', description: 'System version' }
        },
        security: {
          session_timeout: { value: '30', description: 'Session timeout in minutes' },
          max_login_attempts: { value: '5', description: 'Maximum login attempts' }
        }
      }
    });
  }
});

// Update system settings
adminSettingsRouter.put('/', async (c) => {
  try {
    const { category, key, value } = await c.req.json();
    
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO system_settings (key, value, category, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(key, value, category).run();

    return c.json({ 
      success: true, 
      message: 'Setting updated successfully' 
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Failed to update setting' 
    }, 500);
  }
});

export { adminSettingsRouter };