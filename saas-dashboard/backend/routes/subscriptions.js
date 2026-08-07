import express from 'express';
import { getPool, checkDB } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const PLAN_LIMITS = {
  free: { apiCalls: 1000, storage: 5, teamMembers: 1 },
  pro: { apiCalls: 50000, storage: 100, teamMembers: 10 },
  enterprise: { apiCalls: -1, storage: -1, teamMembers: -1 }
};

router.get('/me', protect, async (req, res) => {
  try {
    checkDB();
    const result = await getPool().query('SELECT * FROM subscriptions WHERE user_id = $1', [req.userId]);
    const sub = result.rows[0];
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    res.json({
      plan: sub.plan,
      status: sub.status,
      stripeCustomerId: sub.stripe_customer_id,
      stripeSubscriptionId: sub.stripe_subscription_id,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      usage: { apiCalls: sub.usage_api_calls, storage: sub.usage_storage, teamMembers: sub.usage_team_members },
      limits: { apiCalls: sub.limits_api_calls, storage: sub.limits_storage, teamMembers: sub.limits_team_members }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upgrade', protect, async (req, res) => {
  try {
    checkDB();
    const { plan } = req.body;
    const limits = PLAN_LIMITS[plan];
    if (!limits) return res.status(400).json({ error: 'Invalid plan' });

    const result = await getPool().query(
      `UPDATE subscriptions SET plan = $1, limits_api_calls = $2, limits_storage = $3, limits_team_members = $4, updated_at = NOW()
       WHERE user_id = $5 RETURNING *`,
      [plan, limits.apiCalls, limits.storage, limits.teamMembers, req.userId]
    );
    const sub = result.rows[0];
    res.json({
      plan: sub.plan, status: sub.status,
      usage: { apiCalls: sub.usage_api_calls, storage: sub.usage_storage, teamMembers: sub.usage_team_members },
      limits: { apiCalls: sub.limits_api_calls, storage: sub.limits_storage, teamMembers: sub.limits_team_members }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/usage', protect, async (req, res) => {
  try {
    checkDB();
    const { apiCalls, storage, teamMembers } = req.body;
    const result = await getPool().query('SELECT * FROM subscriptions WHERE user_id = $1', [req.userId]);
    const sub = result.rows[0];
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    const newApi = apiCalls !== undefined ? sub.usage_api_calls + apiCalls : sub.usage_api_calls;
    const newStorage = storage !== undefined ? sub.usage_storage + storage : sub.usage_storage;
    const newTeam = teamMembers !== undefined ? teamMembers : sub.usage_team_members;

    const updated = await getPool().query(
      `UPDATE subscriptions SET usage_api_calls = $1, usage_storage = $2, usage_team_members = $3, updated_at = NOW()
       WHERE user_id = $4 RETURNING *`,
      [newApi, newStorage, newTeam, req.userId]
    );
    const u = updated.rows[0];
    res.json({
      plan: u.plan, status: u.status,
      usage: { apiCalls: u.usage_api_calls, storage: u.usage_storage, teamMembers: u.usage_team_members },
      limits: { apiCalls: u.limits_api_calls, storage: u.limits_storage, teamMembers: u.limits_team_members }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
