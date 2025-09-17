import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);
  
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  
  return c.json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  }, 500);
};