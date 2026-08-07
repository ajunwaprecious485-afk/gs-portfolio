require('dotenv').config();
const dns = require('dns');
if (process.env.USE_CUSTOM_DNS === 'true') {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/database');
const { setLocals } = require('./middleware/auth');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB();

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true, secure: process.env.NODE_ENV === 'production' }
}));

app.use(setLocals);

app.get('/', async (req, res) => {
  try {
    const featured = await Product.find({ featured: true, active: true }).limit(8);
    const latest = await Product.find({ active: true }).sort({ createdAt: -1 }).limit(8);
    const bestSellers = await Product.find({ active: true }).sort({ salesCount: -1 }).limit(8);
    res.render('index', { title: 'Home', featured, latest, bestSellers });
  } catch (err) {
    res.render('index', { title: 'Home', featured: [], latest: [], bestSellers: [] });
  }
});

app.get('/about', (req, res) => res.render('about', { title: 'About Us' }));
app.get('/contact', (req, res) => res.render('contact', { title: 'Contact Us' }));
app.post('/contact', (req, res) => res.render('contact', { title: 'Contact Us', success: true }));

// User profile & orders
app.get('/account', async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  try {
    const user = await User.findById(req.session.userId);
    const orders = await Order.find({ user: req.session.userId }).sort({ createdAt: -1 }).populate('items.product');
    res.render('account/index', { title: 'My Account', profile: user, orders });
  } catch (err) {
    res.redirect('/');
  }
});

app.post('/account/profile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  try {
    const { name, email, phone } = req.body;
    await User.findByIdAndUpdate(req.session.userId, { name, email, phone });
    req.session.userName = name;
    req.session.userEmail = email;
    res.redirect('/account');
  } catch (err) {
    res.redirect('/account');
  }
});

app.get('/orders/:id', async (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order || order.user.toString() !== req.session.userId.toString()) return res.redirect('/');
    res.render('account/order-detail', { title: 'Order Details', order });
  } catch (err) {
    res.redirect('/account');
  }
});

app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/checkout', require('./routes/checkout'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).render('error', { title: '404 Not Found', message: 'The page you are looking for does not exist.' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).render('error', { title: 'Server Error', message: 'Something went wrong. Please try again later.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
