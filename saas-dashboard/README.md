# SaaSly - Subscription Dashboard

A full-stack SaaS subscription dashboard with Stripe integration, built with React, Node.js, Express, MongoDB, and Tailwind CSS.

## Features

- **Authentication** — Register/Login with JWT
- **Dashboard** — Real-time usage stats, activity feed, plan overview
- **Pricing** — 3-tier pricing with monthly/yearly toggle
- **Stripe Integration** — Checkout, billing portal, webhooks
- **Invoice History** — View and download past invoices
- **Settings** — Profile management, password update, account deletion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Payments | Stripe (Checkout, Billing Portal, Webhooks) |
| Auth | JWT + bcryptjs |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (test mode)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/saas-dashboard.git
cd saas-dashboard
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # Fill in your env vars
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLIENT_URL` | Frontend URL (http://localhost:5173) |

## Project Structure

```
saas-dashboard/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/User.js, Subscription.js
│   ├── routes/auth.js, users.js, subscriptions.js, stripe.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/Layout.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/Login, Register, Dashboard, Pricing, Billing, Settings
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## License

MIT
