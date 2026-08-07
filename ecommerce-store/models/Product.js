const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: String,
  verified: { type: Boolean, default: false }
}, { timestamps: true });

const variantSchema = new mongoose.Schema({
  name: String,
  options: [{ label: String, value: String, stock: Number, price: Number }]
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, min: 0 },
  costPrice: { type: Number, min: 0 },
  category: { type: String, required: true, enum: ['electronics', 'clothing', 'home', 'books', 'sports', 'beauty', 'toys', 'other'] },
  brand: String,
  tags: [String],
  images: [{ url: String, alt: String }],
  image: { type: String, default: '' },
  variants: [variantSchema],
  sku: String,
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  weight: Number,
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  salesCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  }
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 150) + '...';
  }
  next();
});

productSchema.methods.getAverageRating = function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
};

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
