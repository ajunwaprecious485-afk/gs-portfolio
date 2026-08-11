import express from 'express';
import { query } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Get all published posts (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;
    let sql = `
      SELECT p.*, u.name as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.status = 'published'
    `;
    const params = [];

    if (category) {
      params.push(category);
      sql += ` AND p.category = $${params.length}`;
    }

    sql += ' ORDER BY p.created_at DESC';
    params.push(limit, offset);
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const rows = await query.all(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all posts including drafts (admin)
router.get('/all', protect, async (req, res) => {
  try {
    const rows = await query.all(`
      SELECT p.*, u.name as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const row = await query.get(`
      SELECT p.*, u.name as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.slug = $1 AND p.status = 'published'
    `, [req.params.slug]);

    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get stats
router.get('/admin/stats', protect, async (req, res) => {
  try {
    const totalRow = await query.get('SELECT COUNT(*) as count FROM posts');
    const publishedRow = await query.get("SELECT COUNT(*) as count FROM posts WHERE status = 'published'");
    const draftsRow = await query.get("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'");
    const categories = await query.all('SELECT DISTINCT category FROM posts');

    res.json({
      total: totalRow.count,
      published: publishedRow.count,
      drafts: draftsRow.count,
      categories: categories.map(r => r.category)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single post by ID (admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const row = await query.get(`
      SELECT p.*, u.name as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = $1
    `, [req.params.id]);

    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create post
router.post('/', protect, async (req, res) => {
  const { title, content, excerpt, featured_image, category, status } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    let slug = slugify(title);
    const existing = await query.get('SELECT id FROM posts WHERE slug = $1', [slug]);
    if (existing) {
      slug = slug + '-' + Date.now();
    }

    const result = await query.run(`
      INSERT INTO posts (title, slug, content, excerpt, featured_image, category, status, author_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [title, slug, content, excerpt || '', featured_image || '', category || 'General', status || 'draft', req.user.id]);

    const newPost = await query.get('SELECT * FROM posts WHERE id = $1', [result.lastID]);
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update post
router.put('/:id', protect, async (req, res) => {
  const { title, content, excerpt, featured_image, category, status } = req.body;

  try {
    let slug = slugify(title);
    const existing = await query.get('SELECT id FROM posts WHERE slug = $1 AND id != $2', [slug, req.params.id]);
    if (existing) {
      slug = slug + '-' + Date.now();
    }

    await query.run(`
      UPDATE posts 
      SET title = $1, slug = $2, content = $3, excerpt = $4, featured_image = $5, 
          category = $6, status = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `, [title, slug, content, excerpt || '', featured_image || '', category || 'General', status || 'draft', req.params.id]);

    const updated = await query.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (!updated) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await query.get('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    await query.run('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;