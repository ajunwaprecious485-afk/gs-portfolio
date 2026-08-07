# SaaSly Deployment Guide

## Option 1: Vercel + Railway (Recommended — Free)

### Frontend → Vercel
1. Push this repo to GitHub
2. Go to https://vercel.com
3. Click "New Project" → Import your GitHub repo
4. Set root directory to `frontend`
5. Deploy — you get a URL like `saasly.vercel.app`

### Backend → Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select this repo, root directory: `backend`
4. Add environment variables:
   - MONGODB_URI=your_mongo_uri
   - JWT_SECRET=your_secret
   - STRIPE_SECRET_KEY=sk_test_xxx
   - STRIPE_WEBHOOK_SECRET=whsec_xxx
   - CLIENT_URL=https://saasly.vercel.app
5. Deploy — you get a URL like `saasly-backend.up.railway.app`

### Connect Them
1. In Vercel, add env var: `VITE_API_URL` = your Railway URL
2. In Railway, update `CLIENT_URL` to your Vercel URL
3. Redeploy both

## Option 2: Render (Alternative Free Tier)

### Backend → Render
1. Go to https://render.com
2. New → Web Service → Connect GitHub
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Add same env vars as above

### Frontend → Netlify
1. Build the frontend: `cd frontend && npm run build`
2. Drag `frontend/dist` to https://app.netlify.com/drop

## Stripe Webhook Setup
After deployment, update your Stripe webhook URL:
1. Go to https://dashboard.stripe.com/webhooks
2. Edit your endpoint URL to: `https://your-backend-url/api/stripe/webhook`
