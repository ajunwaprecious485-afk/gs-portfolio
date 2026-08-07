import express from 'express';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { generateToken } from '../middleware/auth.js';
import { checkDB } from '../config/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    checkDB();
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });
    await Subscription.create({ user: user._id });

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    checkDB();
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
