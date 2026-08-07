import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { protect } from '../middleware/auth.js';
import { checkDB } from '../config/db.js';

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
      return res.status(503).json({ error: 'Stripe is not configured. Add your Stripe API key to the backend .env file.' });
    }

    const { plan, interval } = req.body;
    const user = await User.findById(req.userId);
    const subscription = await Subscription.findOne({ user: req.userId });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await s.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      subscription.stripeCustomerId = customerId;
    }

    const session = await s.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: PLANS[plan][interval], quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: { userId: user._id.toString(), plan }
    });

    await subscription.save();
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
    if (!s) {
      return res.status(503).json({ error: 'Stripe is not configured.' });
    }

    const subscription = await Subscription.findOne({ user: req.userId });

    if (!subscription?.stripeCustomerId) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const session = await s.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
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
    const subscription = await Subscription.findOne({
      stripeCustomerId: session.customer
    });

    if (subscription) {
      subscription.stripeSubscriptionId = session.subscription;
      subscription.plan = session.metadata.plan;
      subscription.status = 'active';
      subscription.currentPeriodEnd = new Date(session.current_period_end * 1000);
      await subscription.save();
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const stripeSubscription = event.data.object;
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (subscription) {
      subscription.status = stripeSubscription.status;
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      await subscription.save();
    }
  }

  res.json({ received: true });
});

export default router;
