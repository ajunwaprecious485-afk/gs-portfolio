import express from 'express';
import Subscription from '../models/Subscription.js';
import { protect } from '../middleware/auth.js';
import { checkDB } from '../config/db.js';

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  try {
    checkDB();
    const subscription = await Subscription.findOne({ user: req.userId });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upgrade', protect, async (req, res) => {
  try {
    checkDB();
    const { plan } = req.body;
    const subscription = await Subscription.findOne({ user: req.userId });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await subscription.upgradePlan(plan);
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/usage', protect, async (req, res) => {
  try {
    checkDB();
    const { apiCalls, storage, teamMembers } = req.body;
    const subscription = await Subscription.findOne({ user: req.userId });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (apiCalls !== undefined) subscription.usage.apiCalls += apiCalls;
    if (storage !== undefined) subscription.usage.storage += storage;
    if (teamMembers !== undefined) subscription.usage.teamMembers = teamMembers;

    await subscription.save();
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
