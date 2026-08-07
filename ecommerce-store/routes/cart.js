const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  res.render('cart/index', { title: 'Shopping Cart', cart, subtotal, shipping });
});

router.post('/add', async (req, res) => {
  try {
    const { productId, quantity, variant } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!req.session.cart) req.session.cart = [];
    const qty = parseInt(quantity) || 1;
    const existingItem = req.session.cart.find(item => item.productId === productId && item.variant === (variant || ''));
    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + qty > product.stock) {
      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.status(400).json({ error: 'Not enough stock available' });
      }
      return res.redirect('/cart');
    }
    if (existingItem) {
      existingItem.quantity += qty;
      existingItem.price = product.price;
    } else {
      req.session.cart.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
        variant: variant || ''
      });
    }
    const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true, cartCount });
    }
    res.redirect('/cart');
  } catch (err) {
    res.redirect('/cart');
  }
});

router.post('/update', async (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) req.session.cart = [];
  const qty = parseInt(quantity);
  if (qty <= 0) {
    req.session.cart = req.session.cart.filter(item => item.productId !== productId);
  } else {
    const item = req.session.cart.find(item => item.productId === productId);
    if (item) {
      const product = await Product.findById(productId);
      item.quantity = Math.min(qty, product ? product.stock : qty);
      if (product) item.price = product.price;
    }
  }
  res.redirect('/cart');
});

router.post('/remove', (req, res) => {
  const { productId } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.productId !== productId);
  }
  res.redirect('/cart');
});

router.post('/clear', (req, res) => {
  req.session.cart = [];
  res.redirect('/cart');
});

module.exports = router;
