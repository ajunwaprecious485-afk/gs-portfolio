const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');

router.use(isAdmin);

router.get('/', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const revenue = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user');
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const lowStock = await Product.countDocuments({ stock: { $lte: 5 }, active: true });
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { totalOrders, totalProducts, totalUsers, revenue: revenue[0] ? revenue[0].total : 0, pendingOrders, lowStock },
      recentOrders
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', message: 'Failed to load dashboard' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render('admin/products', { title: 'Manage Products', products });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', message: 'Failed to load products' });
  }
});

router.get('/products/new', (req, res) => {
  res.render('admin/product-form', { title: 'Add Product', product: null });
});

router.post('/products', async (req, res) => {
  try {
    const { name, description, shortDescription, price, comparePrice, category, brand, stock, featured, image, tags, sku } = req.body;
    const imageData = (image && image.trim()) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';
    await Product.create({
      name, description, shortDescription,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      category, brand, sku,
      stock: parseInt(stock) || 0,
      featured: featured === 'on',
      image: imageData,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
    });
    res.redirect('/admin/products');
  } catch (err) {
    res.render('admin/product-form', { title: 'Add Product', product: null, error: 'Failed to create product.' });
  }
});

router.get('/products/:id/edit', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect('/admin/products');
    res.render('admin/product-form', { title: 'Edit Product', product });
  } catch (err) {
    res.redirect('/admin/products');
  }
});

router.post('/products/:id', async (req, res) => {
  try {
    const { name, description, shortDescription, price, comparePrice, category, brand, stock, featured, image, tags, sku } = req.body;
    const updateData = {
      name, description, shortDescription,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
      category, brand, sku,
      stock: parseInt(stock) || 0,
      featured: featured === 'on',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    if (image && image.trim()) updateData.image = image.trim();
    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/admin/products');
  } catch (err) {
    const product = await Product.findById(req.params.id);
    res.render('admin/product-form', { title: 'Edit Product', product, error: 'Failed to update product.' });
  }
});

router.post('/products/:id/delete', async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); } catch {}
  res.redirect('/admin/products');
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user');
    res.render('admin/orders', { title: 'Manage Orders', orders });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', message: 'Failed to load orders' });
  }
});

router.post('/orders/:id/status', async (req, res) => {
  try {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
    if (validStatuses.includes(req.body.status)) {
      await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    }
  } catch {}
  res.redirect('/admin/orders');
});

module.exports = router;
