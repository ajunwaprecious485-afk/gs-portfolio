import express from 'express';
import Stripe from 'stripe';
import { getPool, checkDB } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

let stripe = null;

const getStripe = () => {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (key && key.startsWith('sk_test_')) {
    stripe = new Stripe(key);
  }
  return stripe;
};

const PLANS = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY || 'price_replace_me',
    yearly: process.env.STRIPE_PRO_YEARLY || 'price_replace_me'
  },
  enterprise: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY || 'price_replace_me',
    yearly: process.env.STRIPE_ENTERPRISE_YEARLY || 'price_replace_me'
  }
};

router.get('/status', (req, res) => {
  res.json({ configured: !!getStripe() });
});

router.post('/checkout', protect, async (req, res) => {
  try {
    checkDB();
    const s = getStripe();
    if (!s) {
      return res.status(503).json({ error: 'Stripe is not configured.' });
    }

    const { plan, interval } = req.body;
    const user = req.user;
    const subResult = await getPool().query('SELECT * FROM subscriptions WHERE user_id = $1', [req.userId]);
    const subscription = subResult.rows[0];

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await s.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: req.userId.toString() }
      });
      customerId = customer.id;
      await getPool().query('UPDATE subscriptions SET stripe_customer_id = $1 WHERE user_id = $2', [customerId, req.userId]);
    }

    const priceId = PLANS[plan]?.[interval];
    if (!priceId || priceId === 'price_replace_me') {
      return res.status(400).json({ error: 'Invalid plan or price not configured' });
    }

    const session = await s.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: { userId: req.userId.toString(), plan }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/portal', protect, async (req, res) => {
  try {
    checkDB();
    const s = getStripe();
    if (!s) return res.status(503).json({ error: 'Stripe is not configured.' });

    const subResult = await getPool().query('SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1', [req.userId]);
    const customerId = subResult.rows[0]?.stripe_customer_id;

    if (!customerId) return res.status(400).json({ error: 'No billing account found' });

    const session = await s.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/billing`
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  const s = getStripe();
  if (!s) return res.status(503).json({ error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = s.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await getPool().query(
      `UPDATE subscriptions SET stripe_subscription_id = $1, plan = $2, status = 'active', current_period_end = to_timestamp($3), updated_at = NOW()
       WHERE stripe_customer_id = $4`,
      [session.subscription, session.metadata.plan, session.current_period_end, session.customer]
    );
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    await getPool().query(
      `UPDATE subscriptions SET status = $1, current_period_end = to_timestamp($2), updated_at = NOW()
       WHERE stripe_subscription_id = $3`,
      [sub.status, sub.current_period_end, sub.id]
    );
  }

  res.json({ received: true });
});

export default router;
