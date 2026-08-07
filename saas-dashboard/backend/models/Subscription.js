import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  status: { type: String, enum: ['active', 'canceled', 'past_due', 'trialing'], default: 'active' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  stripePriceId: { type: String },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  usage: {
    apiCalls: { type: Number, default: 0 },
    storage: { type: Number, default: 0 },
    teamMembers: { type: Number, default: 1 }
  },
  limits: {
    apiCalls: { type: Number, default: 1000 },
    storage: { type: Number, default: 5 },
    teamMembers: { type: Number, default: 1 }
  }
}, { timestamps: true });

const PLAN_LIMITS = {
  free: { apiCalls: 1000, storage: 5, teamMembers: 1 },
  pro: { apiCalls: 50000, storage: 100, teamMembers: 10 },
  enterprise: { apiCalls: -1, storage: -1, teamMembers: -1 }
};

subscriptionSchema.methods.upgradePlan = function (newPlan) {
  this.plan = newPlan;
  this.limits = PLAN_LIMITS[newPlan];
  return this.save();
};

export default mongoose.model('Subscription', subscriptionSchema);
