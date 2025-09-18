import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../main';

const businessRouter = new Hono<{ Bindings: Env }>();

// Customer Management Schema
const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  kycStatus: z.enum(['pending', 'verified', 'rejected']).default('pending'),
  businessType: z.string().optional(),
  notes: z.string().optional()
});

// Loan Application Schema
const loanApplicationSchema = z.object({
  customerId: z.string(),
  loanType: z.enum(['personal', 'business', 'mortgage']),
  requestedAmount: z.string(), // Text field only - no calculations
  purpose: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'disbursed']).default('pending'),
  notes: z.string().optional()
});

// CSV Import Schema
const csvImportSchema = z.object({
  dataType: z.enum(['customers', 'loans', 'expenses', 'staff']),
  fileName: z.string(),
  data: z.array(z.record(z.string()))
});

// Customer Management Routes
businessRouter.post('/customers', zValidator('json', customerSchema), async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  const customerData = c.req.valid('json');
  const customerId = crypto.randomUUID();

  try {
    await c.env.DB.prepare(`
      INSERT INTO customers (id, tenant_id, name, email, phone, kyc_status, business_type, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      customerId,
      user.tenantId || user.id,
      customerData.name,
      customerData.email,
      customerData.phone || null,
      customerData.kycStatus,
      customerData.businessType || null,
      customerData.notes || null
    ).run();

    return c.json({
      success: true,
      customer: { id: customerId, ...customerData }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return c.json({ error: 'Failed to create customer' }, 500);
  }
});

businessRouter.get('/customers', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    const customers = await c.env.DB.prepare(`
      SELECT * FROM customers 
      WHERE tenant_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(user.tenantId || user.id, limit, offset).all();

    return c.json({
      customers: customers.results || []
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return c.json({ error: 'Failed to retrieve customers' }, 500);
  }
});

// Loan Application Routes
businessRouter.post('/loans', zValidator('json', loanApplicationSchema), async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  const loanData = c.req.valid('json');
  const loanId = crypto.randomUUID();

  try {
    await c.env.DB.prepare(`
      INSERT INTO loan_applications (
        id, tenant_id, customer_id, loan_type, requested_amount, 
        purpose, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      loanId,
      user.tenantId || user.id,
      loanData.customerId,
      loanData.loanType,
      loanData.requestedAmount,
      loanData.purpose,
      loanData.status,
      loanData.notes || null
    ).run();

    return c.json({
      success: true,
      loan: { id: loanId, ...loanData }
    });
  } catch (error) {
    console.error('Create loan application error:', error);
    return c.json({ error: 'Failed to create loan application' }, 500);
  }
});

businessRouter.get('/loans', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    const loans = await c.env.DB.prepare(`
      SELECT l.*, c.name as customer_name, c.email as customer_email
      FROM loan_applications l
      LEFT JOIN customers c ON l.customer_id = c.id
      WHERE l.tenant_id = ?
      ORDER BY l.created_at DESC
    `).bind(user.tenantId || user.id).all();

    return c.json({
      loans: loans.results || []
    });
  } catch (error) {
    console.error('Get loans error:', error);
    return c.json({ error: 'Failed to retrieve loan applications' }, 500);
  }
});

businessRouter.put('/loans/:id/status', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  const loanId = c.req.param('id');
  const { status, notes } = await c.req.json();

  if (!['pending', 'approved', 'rejected', 'disbursed'].includes(status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  try {
    await c.env.DB.prepare(`
      UPDATE loan_applications 
      SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND tenant_id = ?
    `).bind(status, notes || null, loanId, user.tenantId || user.id).run();

    return c.json({
      success: true,
      message: 'Loan status updated successfully'
    });
  } catch (error) {
    console.error('Update loan status error:', error);
    return c.json({ error: 'Failed to update loan status' }, 500);
  }
});

// CSV Import Routes
businessRouter.post('/csv/import', zValidator('json', csvImportSchema), async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  const { dataType, fileName, data } = c.req.valid('json');

  // Validate CSV data contains only allowed columns
  const allowedColumns = {
    customers: ['name', 'email', 'phone', 'kyc_status', 'business_type'],
    loans: ['customer_name', 'loan_type', 'requested_amount', 'purpose', 'status'],
    expenses: ['category', 'description', 'date', 'staff_name'],
    staff: ['name', 'email', 'role', 'department', 'hire_date']
  };

  const prohibitedColumns = [
    'amount', 'balance', 'transaction_id', 'payment_status',
    'gateway_response', 'account_number', 'card_number'
  ];

  // Check for prohibited columns
  for (const row of data) {
    const columns = Object.keys(row);
    const hasProhibited = columns.some(col => 
      prohibitedColumns.includes(col.toLowerCase())
    );
    
    if (hasProhibited) {
      return c.json({
        error: 'CBMP Compliance: CSV contains prohibited payment-related columns',
        prohibitedColumns: columns.filter(col => 
          prohibitedColumns.includes(col.toLowerCase())
        )
      }, 400);
    }
  }

  try {
    const importId = crypto.randomUUID();
    
    // Store import record
    await c.env.DB.prepare(`
      INSERT INTO business_data (id, tenant_id, data_type, file_name, data_json, imported_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      importId,
      user.tenantId || user.id,
      dataType,
      fileName,
      JSON.stringify(data)
    ).run();

    return c.json({
      success: true,
      importId,
      recordsImported: data.length,
      message: 'Business data imported successfully'
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return c.json({ error: 'Failed to import CSV data' }, 500);
  }
});

businessRouter.get('/csv/imports', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'User not found' }, 401);

  try {
    const imports = await c.env.DB.prepare(`
      SELECT id, data_type, file_name, imported_at,
             json_array_length(data_json) as record_count
      FROM business_data 
      WHERE tenant_id = ? 
      ORDER BY imported_at DESC
    `).bind(user.tenantId || user.id).all();

    return c.json({
      imports: imports.results || []
    });
  } catch (error) {
    console.error('Get imports error:', error);
    return c.json({ error: 'Failed to retrieve import history' }, 500);
  }
});

export { businessRouter };