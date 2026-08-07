import express from 'express';
import bcrypt from 'bcryptjs';
import { getPool, checkDB } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    checkDB();
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please fill all fields' });
    }

    const existing = await getPool().query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await getPool().query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, avatar, role, created_at',
      [name.trim(), email.toLowerCase(), hashed]
    );

    const user = result.rows[0];
    await getPool().query('INSERT INTO subscriptions (user_id) VALUES ($1)', [user.id]);

    const token = generateToken(user.id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    checkDB();
    const { email, password } = req.body;

    const result = await getPool().query('SELECT * FROM users WHERE email = $1', [email?.toLowerCase()]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    const token = generateToken(user.id);
    res.json({ user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
