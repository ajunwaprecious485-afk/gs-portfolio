const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const { category, search, sort, featured, brand } = req.query;
    let query = { active: true };
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (brand) query.brand = brand;
    if (search) query.$text = { $search: search };
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'popular') sortOption = { salesCount: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(limit);
    const categories = await Product.distinct('category');
    const totalPages = Math.ceil(total / limit);
    res.render('products/index', {
      title: search ? `Search: "${search}"` : featured === 'true' ? 'Featured Products' : 'All Products',
      products, categories, currentCategory: category || '', currentSort: sort || '',
      searchTerm: search || '', currentPage: page, totalPages, total
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', message: 'Failed to load products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).render('error', { title: 'Not Found', message: 'Product not found' });
    product.viewCount += 1;
    await product.save();
    const related = await Product.find({ category: product.category, _id: { $ne: product._id }, active: true }).limit(4);
    res.render('products/show', { title: product.name, product, related });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', message: 'Failed to load product' });
  }
});

module.exports = router;
