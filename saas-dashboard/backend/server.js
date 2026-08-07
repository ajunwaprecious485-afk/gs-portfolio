import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import subscriptionRoutes from './routes/subscriptions.js';
import stripeRoutes from './routes/stripe.js';

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/stripe', stripeRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
