import express from 'express';
import bcrypt from 'bcryptjs';
import { getPool, checkDB } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

router.put('/me', protect, async (req, res) => {
  try {
    checkDB();
    const { name, email, password, currentPassword } = req.body;

    if (password) {
      const result = await getPool().query('SELECT password FROM users WHERE id = $1', [req.userId]);
      const valid = await bcrypt.compare(currentPassword || '', result.rows[0].password);
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
      const hashed = await bcrypt.hash(password, 12);
      await getPool().query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.userId]);
    }

    if (name || email) {
      const result = await getPool().query(
        'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = NOW() WHERE id = $3 RETURNING id, name, email, avatar, role, created_at',
        [name, email?.toLowerCase(), req.userId]
      );
      return res.json(result.rows[0]);
    }

    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
