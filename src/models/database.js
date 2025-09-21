/**
 * Database initialization and management for SQLite in browser
 * Uses sql.js to provide SQLite functionality via WebAssembly
 */

import initSqlJs from 'sql.js';

class Database {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize SQLite database
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize sql.js with WebAssembly
      const SQL = await initSqlJs({
        // Use WASM file from public directory
        locateFile: (file) => `/sql.js/${file}`
      });

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem('household_power_db');
      
      if (savedDb) {
        // Restore from saved state
        const uint8Array = new Uint8Array(
          JSON.parse(savedDb).data
        );
        this.db = new SQL.Database(uint8Array);
      } else {
        // Create new database
        this.db = new SQL.Database();
        await this.createSchema();
      }

      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  /**
   * Create database schema with tables and constraints
   * @returns {Promise<void>}
   */
  async createSchema() {
    const schema = `
      -- Appliances table with validation constraints
      CREATE TABLE IF NOT EXISTS appliances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
        power_watts REAL NOT NULL CHECK(power_watts >= 0.1 AND power_watts <= 10000),
        daily_hours REAL NOT NULL CHECK(daily_hours >= 0 AND daily_hours <= 24),
        usage_days TEXT NOT NULL, -- JSON array: [0,1,2,3,4,5,6]
        standby_watts REAL DEFAULT 0 CHECK(standby_watts >= 0 AND standby_watts <= 1000),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Settings for rates and preferences
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_appliances_updated ON appliances(updated_at);
      CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

      -- Initial settings
      INSERT OR IGNORE INTO settings (key, value) VALUES 
        ('rate_per_kwh', '0.12'),
        ('currency', 'USD'),
        ('time_of_use_enabled', 'false');
    `;

    try {
      this.db.exec(schema);
      console.log('Database schema created successfully');
    } catch (error) {
      console.error('Failed to create schema:', error);
      throw error;
    }
  }

  /**
   * Execute a SQL query
   * @param {string} sql - SQL query string
   * @param {Array} params - Query parameters
   * @returns {Array} Query results
   */
  query(sql, params = []) {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    try {
      const stmt = this.db.prepare(sql);
      const results = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Execute a SQL statement that doesn't return data
   * @param {string} sql - SQL statement
   * @param {Array} params - Statement parameters
   * @returns {Object} Result info (lastInsertRowid, changes)
   */
  run(sql, params = []) {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      
      const result = {
        lastInsertRowid: this.db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0],
        changes: this.db.getRowsModified()
      };
      
      stmt.free();
      return result;
    } catch (error) {
      console.error('Database run error:', error);
      throw error;
    }
  }

  /**
   * Save database to localStorage for persistence
   */
  save() {
    if (!this.isInitialized) return;

    try {
      const data = this.db.export();
      localStorage.setItem('household_power_db', JSON.stringify({
        data: Array.from(data),
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }

  /**
   * Close database connection and clean up
   */
  close() {
    if (this.db) {
      this.save(); // Save before closing
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if database is ready for use
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized && this.db !== null;
  }
}

// Singleton instance
const database = new Database();

export default database;