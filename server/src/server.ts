import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

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

app.get('/staff', auth(['ADMIN','MANAGER']), async (_req, res) => {
  const [rows] = await pool.query('SELECT id, staff_type as staffType, name, active FROM staff WHERE active = 1');
  res.json(rows);
});

app.get('/bookings', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { status, q, from, to } = req.query as any;
  const params: any[] = [];
  let sql = `SELECT b.id, b.status, b.start_at as start, b.end_at as end, u.name as clientName, b.address as location
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
  const { clientId, packageId, start, end, address, status } = req.body as any;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = crypto.randomUUID();
    const eventDate = new Date(start).toISOString().slice(0,10);
    await conn.query(
      `INSERT INTO bookings (id, client_id, package_id, event_date, start_at, end_at, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, clientId, packageId, eventDate, start, end, address || null, status || 'INQUIRY']
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

app.get('/time-blocks', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { staffIds, from, to } = req.query as any;
  const ids = staffIds ? (Array.isArray(staffIds) ? staffIds : String(staffIds).split(',')) : [];
  const params: any[] = [];
  let sql = 'SELECT id, staff_id as staffId, booking_id as bookingId, type, start_at as start, end_at as end FROM time_blocks WHERE 1=1';
  if (ids.length) { sql += ` AND staff_id IN (${ids.map(()=>'?').join(',')})`; params.push(...ids); }
  if (from) { sql += ' AND end_at >= ?'; params.push(from); }
  if (to) { sql += ' AND start_at <= ?'; params.push(to); }
  sql += ' ORDER BY start_at ASC LIMIT 1000';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

app.post('/time-blocks', auth(['ADMIN','MANAGER']), async (req, res) => {
  const { staffId, bookingId, type, start, end } = req.body as any;
  try {
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO time_blocks (id, staff_id, booking_id, type, start_at, end_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, staffId, bookingId || null, type, start, end]
    );
    res.status(201).json({ id });
  } catch (e: any) {
    res.status(400).json({ message: e?.sqlMessage || e?.message || 'Error' });
  }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));


