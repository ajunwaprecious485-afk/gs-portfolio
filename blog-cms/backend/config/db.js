import pg from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useSQLite = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost');

let db;
let pool;

if (useSQLite) {
  const sqlitePath = path.join(__dirname, '..', 'database.sqlite');
  db = new Database(sqlitePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  console.log('Using SQLite database');
} else {
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  console.log('Using PostgreSQL database');
}

async function initDB() {
  if (useSQLite) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'author',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT DEFAULT '',
        featured_image TEXT DEFAULT '',
        category TEXT DEFAULT 'General',
        status TEXT DEFAULT 'draft',
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'author',
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(300) NOT NULL,
          slug VARCHAR(300) UNIQUE NOT NULL,
          content TEXT NOT NULL,
          excerpt VARCHAR(500) DEFAULT '',
          featured_image VARCHAR(500) DEFAULT '',
          category VARCHAR(100) DEFAULT 'General',
          status VARCHAR(20) DEFAULT 'draft',
          author_id INT REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
    } finally {
      client.release();
    }
  }
  console.log('Database tables initialized');
}

// Convert $1, $2... placeholders to ? for SQLite
function toSQLite(sql) {
  let i = 0;
  return sql.replace(/\$\d+/g, () => '?');
}

// Unified query interface
const query = {
  async run(sql, params = []) {
    if (useSQLite) {
      const stmt = db.prepare(toSQLite(sql));
      const result = stmt.run(...params);
      return { rows: [], lastID: result.lastInsertRowid, changes: result.changes };
    } else {
      const client = await pool.connect();
      try {
        const result = await client.query(sql, params);
        return { rows: result.rows, lastID: result.rows[0]?.id, changes: result.rowCount };
      } finally {
        client.release();
      }
    }
  },

  async get(sql, params = []) {
    if (useSQLite) {
      const stmt = db.prepare(toSQLite(sql));
      return stmt.get(...params) || null;
    } else {
      const client = await pool.connect();
      try {
        const result = await client.query(sql, params);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    }
  },

  async all(sql, params = []) {
    if (useSQLite) {
      const stmt = db.prepare(toSQLite(sql));
      return stmt.all(...params);
    } else {
      const client = await pool.connect();
      try {
        const result = await client.query(sql, params);
        return result.rows;
      } finally {
        client.release();
      }
    }
  }
};

export { pool, db, initDB, query, useSQLite };