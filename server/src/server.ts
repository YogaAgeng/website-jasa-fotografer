import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import wwebjs from 'whatsapp-web.js';
const { Client: WAClient, LocalAuth } = wwebjs as any;
import QRCode from 'qrcode';

const app = express();
app.use(cors({ origin: /http:\/\/localhost:\d+$/, credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'schema',
  waitForConnections: true,
  connectionLimit: 10,
});

type JWTPayload = { uid: string; role: 'ADMIN'|'MANAGER'|'CLIENT'; name: string };

function toMySQLDateTime(isoOrDate: string | Date) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}.${ms}`;
}

function auth(requiredRoles?: Array<JWTPayload['role']>) {
  return (req: any, res: any, next: any) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      if (requiredRoles && !requiredRoles.includes(payload.role)) return res.status(403).json({ message: 'Forbidden' });
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  
  const [rows] = await pool.query("SELECT id, role, name, email FROM users WHERE email = ? LIMIT 1", [email]);
  const user = (rows as any[])[0];
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // For demo purposes, all users have the same password: 'password123'
  const isValidPassword = password === 'password123';
  
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const payload: JWTPayload = { uid: user.id, role: user.role, name: user.name };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
  res.json({ accessToken, user: payload });
});

app.get('/auth/me', auth(), async (req: any, res) => {
  res.json({ user: req.user });
});

app.post('/auth/logout', (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

// WhatsApp Web JS client
const waClient = new WAClient({ authStrategy: new LocalAuth({ clientId: 'photobooking' }) });
let waReady = false;
let waQR: string | null = null;

waClient.on('qr', (qr: string) => {
  waReady = false;
  waQR = qr;
});

waClient.on('ready', () => {
  waReady = true;
  waQR = null;
  console.log('WhatsApp client ready');
});

waClient.on('disconnected', () => {
  waReady = false;
});

waClient.initialize().catch(() => {});

app.get('/wa/status', auth(['ADMIN','MANAGER']), async (_req, res) => {
  if (waReady) return res.json({ ready: true });
  if (waQR) {
    const dataUrl = await QRCode.toDataURL(waQR);
    return res.json({ ready: false, qr: dataUrl });
  }
  return res.json({ ready: false });
});

app.post('/wa/send', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { phone, message } = req.body as { phone: string; message: string };
  if (!waReady) return res.status(400).json({ message: 'WhatsApp not connected' });
  if (!phone || !message) return res.status(400).json({ message: 'phone and message required' });
  const to = phone.replace(/^\+?62/, '62') + '@c.us';
  await waClient.sendMessage(to, message);
  res.json({ ok: true });
});

app.get('/staff', auth(['ADMIN','MANAGER']), async (_req, res) => {
  const [rows] = await pool.query('SELECT id, staff_type as staffType, name, active FROM staff WHERE active = 1');
  res.json(rows);
});

app.post('/staff', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { staffType, name, phone, email, homeBase, active } = req.body as any;
  try {
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO staff (id, staff_type, name, phone, email, home_base, active) VALUES (?,?,?,?,?,?,?)',
      [id, staffType, name, phone || null, email || null, homeBase || null, active ? 1 : 1]
    );
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});

app.put('/staff/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  const { staffType, name, phone, email, homeBase, active } = req.body as any;
  const fields: string[] = [];
  const params: any[] = [];
  if (staffType) { fields.push('staff_type = ?'); params.push(staffType); }
  if (name) { fields.push('name = ?'); params.push(name); }
  if (phone !== undefined) { fields.push('phone = ?'); params.push(phone || null); }
  if (email !== undefined) { fields.push('email = ?'); params.push(email || null); }
  if (homeBase !== undefined) { fields.push('home_base = ?'); params.push(homeBase || null); }
  if (active !== undefined) { fields.push('active = ?'); params.push(active ? 1 : 0); }
  if (!fields.length) return res.json({ ok: true });
  params.push(id);
  try {
    await pool.query(`UPDATE staff SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});

app.delete('/staff/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  try {
    await pool.query('DELETE FROM staff WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});

app.get('/bookings', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { status, q, from, to } = req.query as any;
  const params: any[] = [];
  let sql = `SELECT b.id,
                    b.status,
                    b.start_at as start,
                    b.end_at as end,
                    b.staff_id as staffId,
                    u.name as clientName,
                    b.address as location,
                    b.client_phone as clientPhone
             FROM bookings b JOIN users u ON u.id = b.client_id WHERE 1=1`;
  if (status) { sql += ' AND b.status = ?'; params.push(status); }
  if (from) { sql += ' AND b.start_at >= ?'; params.push(from); }
  if (to) { sql += ' AND b.end_at <= ?'; params.push(to); }
  if (q) { sql += ' AND (u.name LIKE ? OR b.address LIKE ? )'; params.push(`%${q}%`, `%${q}%`); }
  sql += ' ORDER BY b.start_at ASC LIMIT 500';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

app.post('/bookings', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { clientId, clientName, clientEmail, clientPhone, packageId, staffId, start, end, address, status } = req.body as any;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let finalClientId = clientId as string | undefined;

    if (!finalClientId) {
      if (!clientName && !clientEmail) {
        throw new Error('clientId or clientName is required');
      }
      // Try find by email first
      if (clientEmail) {
        const [rows] = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', [clientEmail]);
        const found = (rows as any[])[0];
        if (found) finalClientId = found.id;
      }
      // If not found, try find by exact name
      if (!finalClientId && clientName) {
        const [rows] = await conn.query('SELECT id FROM users WHERE name = ? AND role = "CLIENT" LIMIT 1', [clientName]);
        const found = (rows as any[])[0];
        if (found) finalClientId = found.id;
      }
      // Create new client user
      if (!finalClientId) {
        finalClientId = crypto.randomUUID();
        await conn.query(
          'INSERT INTO users (id, role, name, email) VALUES (?, "CLIENT", ?, ?)',
          [finalClientId, clientName || 'Client', clientEmail || null]
        );
      }
    }
    const id = crypto.randomUUID();
    const eventDate = new Date(start).toISOString().slice(0,10);
    await conn.query(
      `INSERT INTO bookings (id, client_id, package_id, staff_id, event_date, start_at, end_at, address, client_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalClientId, packageId, staffId || null, eventDate, toMySQLDateTime(start), toMySQLDateTime(end), address || null, clientPhone || null, status || 'INQUIRY']
    );
    // Optional create time_blocks of type BOOKING per assigned staff via further endpoints
    await conn.commit();
    res.status(201).json({ id });
  } catch (e: any) {
    await conn.rollback();
    const msg = e?.sqlMessage || e?.message || 'Error';
    res.status(400).json({ message: msg });
  } finally {
    conn.release();
  }
});

// Get booking detail
app.get('/bookings/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  const [rows] = await pool.query(
    `SELECT b.id, b.client_id as clientId, b.package_id as packageId, b.event_date as eventDate,
            b.start_at as start, b.end_at as end, b.address, b.status,
            b.subtotal, b.discount, b.total
     FROM bookings b WHERE b.id = ? LIMIT 1`,
    [id]
  );
  const data = (rows as any[])[0];
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.json(data);
});

// Update booking
app.put('/bookings/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  const { start, end, address, status, staffId, clientPhone } = req.body as any;
  const fields: string[] = [];
  const params: any[] = [];
  if (start) { fields.push('start_at = ?'); params.push(toMySQLDateTime(start)); }
  if (end) { fields.push('end_at = ?'); params.push(toMySQLDateTime(end)); }
  if (address !== undefined) { fields.push('address = ?'); params.push(address); }
  if (status) { fields.push('status = ?'); params.push(status); }
  if (staffId !== undefined) { fields.push('staff_id = ?'); params.push(staffId || null); }
  if (clientPhone !== undefined) { fields.push('client_phone = ?'); params.push(clientPhone || null); }
  if (fields.length === 0) return res.json({ ok: true });
  params.push(id);
  await pool.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, params);
  res.json({ ok: true });
});

// Delete booking
app.delete('/bookings/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  // Hard delete, atau bisa soft delete (tambahkan kolom deleted_at di schema untuk produksi)
  await pool.query('DELETE FROM booking_items WHERE booking_id = ?', [id]);
  await pool.query('DELETE FROM assignments WHERE booking_id = ?', [id]);
  await pool.query('DELETE FROM time_blocks WHERE booking_id = ?', [id]);
  await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
  res.json({ ok: true });
});

// Update booking status + log
app.post('/bookings/:id/status', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  const { toStatus, note } = req.body as { toStatus: string; note?: string };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[row]]: any = await conn.query('SELECT status FROM bookings WHERE id = ? LIMIT 1', [id]);
    const fromStatus = row?.status || null;
    await conn.query('UPDATE bookings SET status = ? WHERE id = ?', [toStatus, id]);
    await conn.query(
      'INSERT INTO status_log (id, booking_id, from_status, to_status, actor_id, note) VALUES (?,?,?,?,?,?)',
      [crypto.randomUUID(), id, fromStatus, toStatus, (req as any).user?.uid || null, note || null]
    );
    await conn.commit();
    res.json({ ok: true });
  } catch (e: any) {
    await conn.rollback();
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  } finally {
    conn.release();
  }
});

// /assignments route removed (not needed)

// Add-ons endpoints
app.get('/add-ons', auth(['ADMIN','MANAGER']), async (_req, res) => {
  const [rows] = await pool.query('SELECT id, name, price, requires_crew as requiresCrew FROM add_ons ORDER BY name ASC');
  res.json(rows);
});

app.post('/add-ons', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { name, price, requiresCrew } = req.body as any;
  try {
    const id = crypto.randomUUID();
    await pool.query('INSERT INTO add_ons (id, name, price, requires_crew) VALUES (?,?,?,?)', [id, name, price, requiresCrew ? 1 : 0]);
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});

app.put('/add-ons/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  const { name, price, requiresCrew } = req.body as any;
  const fields: string[] = [];
  const params: any[] = [];
  if (name) { fields.push('name = ?'); params.push(name); }
  if (price !== undefined) { fields.push('price = ?'); params.push(price); }
  if (requiresCrew !== undefined) { fields.push('requires_crew = ?'); params.push(requiresCrew ? 1 : 0); }
  if (!fields.length) return res.json({ ok: true });
  params.push(id);
  try {
    await pool.query(`UPDATE add_ons SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});

app.delete('/add-ons/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  try {
    await pool.query('DELETE FROM add_ons WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});

// Booking items (list by booking, update, delete)
app.get('/bookings/:id/items', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  const [rows] = await pool.query(
    `SELECT bi.id, bi.qty, bi.price, ao.id as addOnId, ao.name
     FROM booking_items bi JOIN add_ons ao ON ao.id = bi.add_on_id
     WHERE bi.booking_id = ? ORDER BY ao.name ASC`, [id]
  );
  res.json(rows);
});

app.put('/booking-items/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  const { qty, price } = req.body as any;
  const fields: string[] = [];
  const params: any[] = [];
  if (qty !== undefined) { fields.push('qty = ?'); params.push(qty); }
  if (price !== undefined) { fields.push('price = ?'); params.push(price); }
  if (!fields.length) return res.json({ ok: true });
  params.push(id);
  try {
    await pool.query(`UPDATE booking_items SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});

app.delete('/booking-items/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  try {
    await pool.query('DELETE FROM booking_items WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});

app.post('/booking-items', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { bookingId, addOnId, qty, price } = req.body as any;
  try {
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO booking_items (id, booking_id, add_on_id, qty, price) VALUES (?,?,?,?,?)',
      [id, bookingId, addOnId, qty || 1, price]
    );
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});


// Payments endpoints
app.get('/payments', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { bookingId, from, to } = req.query as any;
  const params: any[] = [];
  let sql = `SELECT p.id, p.booking_id as bookingId, p.method, p.amount, p.paid_at as paidAt,
                    b.start_at as bookingStart, b.end_at as bookingEnd, u.name as clientName
             FROM payments p
             JOIN bookings b ON b.id = p.booking_id
             JOIN users u ON u.id = b.client_id
             WHERE 1=1`;
  if (bookingId) { sql += ' AND p.booking_id = ?'; params.push(bookingId); }
  if (from) { sql += ' AND p.paid_at >= ?'; params.push(from); }
  if (to) { sql += ' AND p.paid_at <= ?'; params.push(to); }
  sql += ' ORDER BY p.paid_at DESC LIMIT 500';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

app.post('/payments', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { bookingId, method, amount, paidAt } = req.body as any;
  if (!bookingId || !method || typeof amount !== 'number') {
    return res.status(400).json({ message: 'bookingId, method, and amount are required' });
  }
  const id = crypto.randomUUID();
  const paidAtMySQL = toMySQLDateTime(paidAt ? new Date(paidAt) : new Date());
  await pool.query(
    'INSERT INTO payments (id, booking_id, method, amount, paid_at) VALUES (?,?,?,?,?)',
    [id, bookingId, method, amount, paidAtMySQL]
  );
  res.status(201).json({ id });
});

app.delete('/payments/:id', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { id } = req.params as any;
  await pool.query('DELETE FROM payments WHERE id = ?', [id]);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));


