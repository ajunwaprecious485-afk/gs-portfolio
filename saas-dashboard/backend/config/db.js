import pg from 'pg';
const { Pool } = pg;

let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
};

const connectDB = async () => {
  try {
    const p = getPool();
    const res = await p.query('NOW()');
    console.log('PostgreSQL connected:', res.rows[0].now);
    await initTables();
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Server will start but database operations will fail.');
  }
};

const initTables = async () => {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(255) DEFAULT '',
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      plan VARCHAR(50) DEFAULT 'free',
      status VARCHAR(50) DEFAULT 'active',
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      stripe_price_id VARCHAR(255),
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      usage_api_calls INTEGER DEFAULT 0,
      usage_storage INTEGER DEFAULT 0,
      usage_team_members INTEGER DEFAULT 1,
      limits_api_calls INTEGER DEFAULT 1000,
      limits_storage INTEGER DEFAULT 5,
      limits_team_members INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Tables initialized');
};

export const checkDB = () => {
  if (!pool) {
    throw new Error('Database not connected.');
  }
};

export default connectDB;
