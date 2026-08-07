import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js';
import Subscription from './models/Subscription.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saasly';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Subscription.deleteMany({});
    console.log('Cleared existing data');

    const demo = await User.create({
      name: 'Alex Morgan',
      email: 'demo@saasly.com',
      password: 'demo1234',
      avatar: '',
      role: 'admin'
    });

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await Subscription.create({
      user: demo._id,
      plan: 'pro',
      status: 'active',
      stripeCustomerId: 'cus_demo123',
      stripeSubscriptionId: 'sub_demo123',
      stripePriceId: 'price_1U1RkbJH0ZulOpf4vxV5y8nK',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      usage: {
        apiCalls: 1247,
        storage: 34,
        teamMembers: 4
      },
      limits: {
        apiCalls: 50000,
        storage: 100,
        teamMembers: 10
      }
    });

    console.log('Demo user created: demo@saasly.com / demo1234');
    console.log('Plan: Pro (active) | Usage: 1,247 API calls, 34GB storage, 4 team members');
  } catch (error) {
    console.error('Seed error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Done');
  }
}

seed();
