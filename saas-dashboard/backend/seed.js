import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js';
import Subscription from './models/Subscription.js';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Subscription.deleteMany({});
    console.log('Cleared existing data');

    const demo = await User.create({
      name: 'Demo User',
      email: 'demo@saasly.com',
      password: 'demo1234',
      role: 'admin'
    });

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await Subscription.create({
      user: demo._id,
      plan: 'pro',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      usage: { apiCalls: 1247, storage: 34, teamMembers: 4 },
      limits: { apiCalls: 50000, storage: 100, teamMembers: 10 }
    });

    console.log('Demo user created: demo@saasly.com / demo1234');
  } catch (error) {
    console.error('Seed error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
