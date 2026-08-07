require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  {
    name: 'Wireless Bluetooth Headphones Pro',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Crystal clear audio with deep bass. Designed for audiophiles who demand the best sound quality.',
    shortDescription: 'Premium noise-cancelling headphones with 30-hour battery life.',
    price: 79.99, comparePrice: 99.99, category: 'electronics', brand: 'SoundMax',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=1200&fit=crop', alt: 'Headphones front' }],
    stock: 50, featured: true, rating: 4.5, numReviews: 128, tags: ['audio', 'wireless', 'headphones'],
    reviews: [
      { name: 'Alex M.', rating: 5, title: 'Amazing sound quality', comment: 'Best headphones I have ever owned. The noise cancellation is incredible.', verified: true },
      { name: 'Sarah K.', rating: 4, title: 'Great value', comment: 'Very comfortable for long listening sessions. Battery lasts forever.', verified: true }
    ]
  },
  {
    name: 'Smart Watch Ultra',
    description: 'Track your fitness, receive notifications, and stay connected. Water-resistant with 7-day battery life. Advanced health monitoring including heart rate, SpO2, and sleep tracking.',
    shortDescription: 'Advanced smartwatch with 7-day battery and health monitoring.',
    price: 199.99, comparePrice: 249.99, category: 'electronics', brand: 'TechWear',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=1200&fit=crop', alt: 'Smart watch' }],
    stock: 30, featured: true, rating: 4.7, numReviews: 89, tags: ['smartwatch', 'fitness', 'wearable'],
    reviews: [
      { name: 'James L.', rating: 5, title: 'Perfect fitness companion', comment: 'Does everything I need and more. Battery lasts a full week.', verified: true }
    ]
  },
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Soft, sustainable organic cotton t-shirt. Pre-shrunk and pre-washed for a perfect fit from day one. Available in multiple colors.',
    shortDescription: 'Sustainable organic cotton tee. Soft and pre-shrunk.',
    price: 29.99, category: 'clothing', brand: 'EcoWear',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=1200&fit=crop', alt: 'T-Shirt' }],
    stock: 100, featured: false, rating: 4.2, numReviews: 256, tags: ['clothing', 'cotton', 'sustainable'],
    variants: [
      { name: 'Size', options: [
        { label: 'S', value: 'S', stock: 20, price: 0 },
        { label: 'M', value: 'M', stock: 30, price: 0 },
        { label: 'L', value: 'L', stock: 30, price: 0 },
        { label: 'XL', value: 'XL', stock: 20, price: 2 }
      ]},
      { name: 'Color', options: [
        { label: 'Black', value: 'black', stock: 50 },
        { label: 'White', value: 'white', stock: 50 },
        { label: 'Navy', value: 'navy', stock: 50 }
      ]}
    ]
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket with modern slim fit. Premium quality cotton denim that gets better with age. A wardrobe essential.',
    shortDescription: 'Timeless slim-fit denim jacket. Premium quality.',
    price: 89.99, comparePrice: 119.99, category: 'clothing', brand: 'UrbanStyle',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&h=1200&fit=crop', alt: 'Denim Jacket' }],
    stock: 40, featured: true, rating: 4.6, numReviews: 67, tags: ['denim', 'jacket', 'outerwear']
  },
  {
    name: 'Minimalist LED Desk Lamp',
    description: 'Sleek LED desk lamp with adjustable brightness and 3 color temperatures. Built-in USB charging port. Touch controls with memory function.',
    shortDescription: 'Adjustable LED desk lamp with USB charging port.',
    price: 45.99, category: 'home', brand: 'LumiHome',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab87a?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab87a?w=1200&h=1200&fit=crop', alt: 'Desk Lamp' }],
    stock: 60, featured: true, rating: 4.4, numReviews: 142, tags: ['lamp', 'desk', 'LED']
  },
  {
    name: 'Artisan Ceramic Mug Set',
    description: 'Set of 4 handcrafted ceramic mugs with a unique speckled glaze. Each mug holds 12oz. Dishwasher and microwave safe.',
    shortDescription: 'Set of 4 handcrafted ceramic mugs. 12oz each.',
    price: 34.99, category: 'home', brand: 'CraftHome',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1200&h=1200&fit=crop', alt: 'Coffee Mugs' }],
    stock: 75, featured: false, rating: 4.3, numReviews: 93, tags: ['mugs', 'ceramic', 'kitchen']
  },
  {
    name: 'Clean Code: A Handbook',
    description: 'The definitive guide to writing clean, maintainable code. Essential reading for software developers at every level.',
    shortDescription: 'Essential guide to writing clean, maintainable code.',
    price: 24.99, category: 'books', brand: 'TechPress',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=1200&fit=crop', alt: 'Book' }],
    stock: 80, featured: false, rating: 4.8, numReviews: 312, tags: ['books', 'programming', 'development']
  },
  {
    name: 'Professional Yoga Mat',
    description: 'Extra thick 6mm non-slip yoga mat with alignment lines. Includes carrying strap. Eco-friendly TPE material.',
    shortDescription: '6mm non-slip yoga mat with alignment lines and strap.',
    price: 39.99, comparePrice: 49.99, category: 'sports', brand: 'ZenFit',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=1200&h=1200&fit=crop', alt: 'Yoga Mat' }],
    stock: 45, featured: true, rating: 4.5, numReviews: 78, tags: ['yoga', 'fitness', 'mat']
  },
  {
    name: 'Insulated Water Bottle 750ml',
    description: 'Double-wall vacuum insulated stainless steel bottle. Keeps drinks cold for 24hrs or hot for 12hrs. BPA-free with leak-proof lid.',
    shortDescription: 'Double-wall insulated bottle. Cold 24hrs, hot 12hrs.',
    price: 19.99, category: 'sports', brand: 'HydroLife',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&h=1200&fit=crop', alt: 'Water Bottle' }],
    stock: 120, featured: false, rating: 4.6, numReviews: 201, tags: ['bottle', 'hydration', 'sports']
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Compact waterproof speaker with 360-degree surround sound. 12-hour battery life. IPX7 rated for pool and beach use.',
    shortDescription: 'Waterproof speaker with 360-degree sound and 12hr battery.',
    price: 59.99, comparePrice: 79.99, category: 'electronics', brand: 'SoundMax',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200&h=1200&fit=crop', alt: 'Speaker' }],
    stock: 55, featured: false, rating: 4.4, numReviews: 167, tags: ['speaker', 'bluetooth', 'waterproof']
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Genuine full-grain leather crossbody bag with adjustable strap. Multiple compartments. Perfect for everyday carry.',
    shortDescription: 'Full-grain leather crossbody bag. Adjustable strap.',
    price: 69.99, category: 'clothing', brand: 'UrbanStyle',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&h=1200&fit=crop', alt: 'Leather Bag' }],
    stock: 35, featured: true, rating: 4.7, numReviews: 54, tags: ['bag', 'leather', 'accessories']
  },
  {
    name: 'Premium Soy Candle Set',
    description: 'Set of 3 hand-poured soy wax candles: Lavender Fields, Vanilla Bean, and Sandalwood. 40-hour burn time each. Cotton wicks.',
    shortDescription: '3-pack soy candles: Lavender, Vanilla, Sandalwood.',
    price: 28.99, category: 'home', brand: 'CraftHome',
    image: 'https://images.unsplash.com/photo-1602607006956-4a0571e32dd4?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1602607006956-4a0571e32dd4?w=1200&h=1200&fit=crop', alt: 'Candles' }],
    stock: 90, featured: false, rating: 4.5, numReviews: 118, tags: ['candles', 'soy', 'home']
  },
  {
    name: 'Running Shoes Elite',
    description: 'Lightweight performance running shoes with responsive cushioning and breathable mesh upper. Designed for speed and comfort.',
    shortDescription: 'Lightweight running shoes with responsive cushioning.',
    price: 129.99, comparePrice: 159.99, category: 'sports', brand: 'StridePro',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=1200&fit=crop', alt: 'Running Shoes' }],
    stock: 60, featured: true, rating: 4.8, numReviews: 234, tags: ['running', 'shoes', 'sports'],
    variants: [
      { name: 'Size', options: [
        { label: 'US 7', value: '7', stock: 10 },
        { label: 'US 8', value: '8', stock: 15 },
        { label: 'US 9', value: '9', stock: 15 },
        { label: 'US 10', value: '10', stock: 10 },
        { label: 'US 11', value: '11', stock: 10 }
      ]},
      { name: 'Color', options: [
        { label: 'Black', value: 'black', stock: 30 },
        { label: 'Red', value: 'red', stock: 15 },
        { label: 'White', value: 'white', stock: 15 }
      ]}
    ]
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast 15W wireless charging pad compatible with all Qi-enabled devices. Anti-slip surface. LED indicator. Includes USB-C cable.',
    shortDescription: '15W fast wireless charger. Qi-compatible.',
    price: 24.99, category: 'electronics', brand: 'TechWear',
    image: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?w=1200&h=1200&fit=crop', alt: 'Charger' }],
    stock: 100, featured: false, rating: 4.3, numReviews: 189, tags: ['charger', 'wireless', 'phone']
  },
  {
    name: 'Polarized Aviator Sunglasses',
    description: 'Classic aviator sunglasses with UV400 polarized lenses. Lightweight metal frame with spring hinges. Includes hard case.',
    shortDescription: 'UV400 polarized aviator sunglasses with case.',
    price: 49.99, comparePrice: 69.99, category: 'clothing', brand: 'VisionCraft',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&h=1200&fit=crop', alt: 'Sunglasses' }],
    stock: 70, featured: false, rating: 4.4, numReviews: 95, tags: ['sunglasses', 'aviator', 'accessories']
  },
  {
    name: 'Ceramic Plant Pot Set',
    description: 'Set of 3 minimalist ceramic plant pots in matte white. Includes drainage holes and bamboo saucers. Small, medium, and large sizes.',
    shortDescription: '3-pack matte white ceramic pots with drainage.',
    price: 32.99, category: 'home', brand: 'LumiHome',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop',
    images: [{ url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200&h=1200&fit=crop', alt: 'Plant Pots' }],
    stock: 45, featured: false, rating: 4.6, numReviews: 72, tags: ['plants', 'pots', 'home']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await Product.deleteMany({});
    console.log('Cleared existing products');
    for (const p of products) {
      p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      await Product.create(p);
    }
    console.log(`Seeded ${products.length} products`);
    const adminExists = await User.findOne({ email: 'admin@shop.com' });
    if (!adminExists) {
      await User.create({ name: 'Admin', email: 'admin@shop.com', password: 'admin123', role: 'admin' });
      console.log('Admin user created: admin@shop.com / admin123');
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
