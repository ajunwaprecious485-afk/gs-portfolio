import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { checkDB } from '../config/db.js';

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  try {
    checkDB();
    const user = await User.findById(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me', protect, async (req, res) => {
  try {
    checkDB();
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...(name && { name }), ...(avatar && { avatar }) },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
