const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'bitnet.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Companies table
  db.run(`CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id)
  )`);

  // Reset tokens table
  db.run(`CREATE TABLE IF NOT EXISTS reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Database helper functions
const dbHelpers = {
  // User operations
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      const { email, password_hash, firstName, lastName } = userData;
      db.run(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
        [email, password_hash, firstName, lastName],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, email, firstName, lastName });
        }
      );
    });
  },

  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  updateUserPassword: (userId, hashedPassword) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, userId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  // Company operations
  createCompany: (companyData) => {
    return new Promise((resolve, reject) => {
      const { ownerId, name, description, industry, contactEmail, contactPhone, website, address } = companyData;
      db.run(
        'INSERT INTO companies (owner_id, name, description, industry, contact_email, contact_phone, website, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [ownerId, name, description, industry, contactEmail, contactPhone, website, address],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...companyData });
        }
      );
    });
  },

  getCompanyByOwnerId: (ownerId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM companies WHERE owner_id = ?', [ownerId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getCompanyById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM companies WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  updateCompany: (ownerId, companyData) => {
    return new Promise((resolve, reject) => {
      const { name, description, industry, contactEmail, contactPhone, website, address } = companyData;
      db.run(
        'UPDATE companies SET name = ?, description = ?, industry = ?, contact_email = ?, contact_phone = ?, website = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE owner_id = ?',
        [name, description, industry, contactEmail, contactPhone, website, address, ownerId],
        function(err) {
          if (err) reject(err);
          else resolve({ id: ownerId, ...companyData });
        }
      );
    });
  },

  getAllCompanies: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM companies', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Reset token operations
  createResetToken: (email, token, expiresAt) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expiresAt],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, email, token, expiresAt });
        }
      );
    });
  },

  getResetToken: (token) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM reset_tokens WHERE token = ?', [token], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  deleteResetToken: (token) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM reset_tokens WHERE token = ?', [token], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

module.exports = { db, dbHelpers };