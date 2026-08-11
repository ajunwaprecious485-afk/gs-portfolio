import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB, query } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function seed() {
  await initDB();

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const existingUser = await query.get('SELECT id FROM users WHERE email = $1', ['admin@blog.com']);
    let authorId;
    
    if (existingUser) {
      authorId = existingUser.id;
    } else {
      const result = await query.run(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin', 'admin@blog.com', hashedPassword, 'admin']
      );
      authorId = result.lastID;
    }

    // Clear existing posts
    await query.run('DELETE FROM posts');

    // Create sample posts
    const posts = [
      {
        title: 'Getting Started with Web Development in 2026',
        slug: 'getting-started-web-development-2026',
        content: '<h2>The Journey Begins</h2><p>Web development continues to evolve at a rapid pace. In 2026, the landscape looks different from just a few years ago. Let\'s explore what\'s new and how you can get started.</p><h3>Essential Technologies</h3><p>HTML5, CSS3, and JavaScript remain the foundation. But now with modern frameworks like React, Vue, and Svelte, building interactive user interfaces has never been easier.</p><h3>The Modern Stack</h3><p>Full-stack development now commonly includes:</p><ul><li>React or Next.js for frontend</li><li>Node.js or Python for backend</li><li>PostgreSQL or MongoDB for databases</li><li>Docker for containerization</li></ul><p>The key is to start with the fundamentals and build projects. Every expert was once a beginner.</p>',
        excerpt: 'Explore the essential technologies and modern stacks for web development in 2026.',
        category: 'Technology',
        status: 'published'
      },
      {
        title: 'Why Every Business Needs a Website',
        slug: 'why-every-business-needs-website',
        content: '<h2>Your Online Presence Matters</h2><p>In today\'s digital world, a website is not optional - it\'s essential. Whether you\'re a local shop or a global enterprise, your website is often the first impression customers have of your business.</p><h3>Credibility and Trust</h3><p>A professional website builds trust. Studies show that 75% of consumers judge a company\'s credibility based on their website design. Without a website, potential customers may question your legitimacy.</p><h3>24/7 Availability</h3><p>Your website works while you sleep. It provides information, collects leads, and even makes sales around the clock. It\'s like having a salesperson who never takes a break.</p><h3>Cost-Effective Marketing</h3><p>Compared to traditional advertising, a website offers incredible ROI. With SEO, you can attract organic traffic for years without ongoing ad spend.</p>',
        excerpt: 'Discover why having a professional website is crucial for business success in the digital age.',
        category: 'Business',
        status: 'published'
      },
      {
        title: 'Building a SaaS Product: Lessons Learned',
        slug: 'building-saas-product-lessons-learned',
        content: '<h2>From Idea to Launch</h2><p>Building a Software as a Service product is both exciting and challenging. Here are the key lessons I\'ve learned from building and launching SaaS applications.</p><h3>Start with the Problem</h3><p>The biggest mistake founders make is building technology first and looking for a problem later. Start with a real pain point. Talk to potential customers. Validate your idea before writing a single line of code.</p><h3>Keep It Simple</h3><p>Your MVP (Minimum Viable Product) should do one thing exceptionally well. Don\'t try to build everything at once. Launch with core features and iterate based on user feedback.</p><h3>Pricing Strategy</h3><p>Don\'t underprice your product. If you\'re solving a real problem for businesses, they\'ll pay for it. Consider tiered pricing with a free trial to reduce friction.</p><h3>Focus on Retention</h3><p>Acquiring customers is expensive. Keeping them is where the real value lies. Invest in onboarding, customer support, and continuous improvement.</p>',
        excerpt: 'Key lessons learned from building and launching SaaS products successfully.',
        category: 'Technology',
        status: 'published'
      }
    ];

    for (const post of posts) {
      await query.run(
        'INSERT INTO posts (title, slug, content, excerpt, category, status, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [post.title, post.slug, post.content, post.excerpt, post.category, post.status, authorId]
      );
    }

    console.log('Seed completed!');
    console.log('Admin login: admin@blog.com / admin123');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    process.exit(0);
  }
}

seed();