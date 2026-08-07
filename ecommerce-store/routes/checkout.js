require('dotenv').config();
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { isAuthenticated } = require('../middleware/auth');

function calculateTotal(cart) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

router.get('/', isAuthenticated, (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');
  const { subtotal, shipping, tax, total } = calculateTotal(cart);
  res.render('checkout/index', { title: 'Checkout', cart, subtotal, shipping, tax, total });
});

router.post('/place-order', isAuthenticated, async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');
    for (const item of cart) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) return res.redirect('/cart');
    }
    const { subtotal, shipping, tax, total } = calculateTotal(cart);
    const order = await Order.create({
      user: req.session.userId,
      items: cart.map(item => ({
        product: item.productId,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant || ''
      })),
      shippingAddress: {
        fullName: req.body.fullName || req.session.userName,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        country: req.body.country || 'Nigeria'
      },
      paymentMethod: req.body.paymentMethod || 'cod',
      subtotal, shippingCost: shipping, tax,
      totalAmount: total,
      status: 'confirmed'
    });
    order.statusHistory.push({ status: 'confirmed', note: 'Order placed successfully' });
    await order.save();
    for (const item of cart) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity, salesCount: item.quantity } });
    }
    req.session.cart = [];
    res.redirect(`/checkout/success/${order._id}`);
  } catch (err) {
    res.redirect('/checkout');
  }
});

router.get('/success/:id', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order || order.user.toString() !== req.session.userId.toString()) return res.redirect('/');
    res.render('checkout/success', { title: 'Order Confirmed', order });
  } catch (err) {
    res.redirect('/');
  }
});

module.exports = router;
