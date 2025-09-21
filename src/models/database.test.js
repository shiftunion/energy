/**
 * Test database implementation using an in-memory store
 * This avoids WebAssembly/WASM issues in the test environment
 */

class TestDatabase {
  constructor() {
    this.tables = new Map();
    this.autoIncrement = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    // Create appliances table structure
    this.tables.set('appliances', new Map());
    this.autoIncrement.set('appliances', 1);
    
    this.isInitialized = true;
    console.log('Test database initialized successfully');
  }

  /**
   * Run a SELECT query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Array} Query results
   */
  query(sql, params = []) {
    const normalizedSql = sql.trim().toLowerCase();
    
    if (normalizedSql.startsWith('select')) {
      return this.handleSelect(sql, params);
    } else {
      throw new Error(`Unsupported query type: ${sql}`);
    }
  }

  /**
   * Run an INSERT/UPDATE/DELETE query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object} Query result with changes info
   */
  run(sql, params = []) {
    const normalizedSql = sql.trim().toLowerCase();
    
    if (normalizedSql.startsWith('insert')) {
      return this.handleInsert(sql, params);
    } else if (normalizedSql.startsWith('update')) {
      return this.handleUpdate(sql, params);
    } else if (normalizedSql.startsWith('delete')) {
      return this.handleDelete(sql, params);
    } else if (normalizedSql.startsWith('create')) {
      // Schema creation - just return success
      return { changes: 0, lastInsertRowid: null };
    } else {
      throw new Error(`Unsupported query type: ${sql}`);
    }
  }

  handleSelect(sql, params) {
    const appliances = this.tables.get('appliances');
    const results = [];
    
    if (sql.includes('WHERE id = ?')) {
      const id = params[0];
      const appliance = appliances.get(id);
      if (appliance) {
        results.push(appliance);
      }
    } else if (sql.includes('SELECT * FROM appliances')) {
      // Get all appliances
      for (const appliance of appliances.values()) {
        results.push(appliance);
      }
    }
    
    return results;
  }

  handleInsert(sql, params) {
    if (sql.includes('INSERT INTO appliances')) {
      const appliances = this.tables.get('appliances');
      const id = this.autoIncrement.get('appliances');
      
      const appliance = {
        id: id,
        name: params[0],
        power_watts: params[1],
        daily_hours: params[2],
        usage_days: params[3],
        standby_watts: params[4],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      appliances.set(id, appliance);
      this.autoIncrement.set('appliances', id + 1);
      
      return { changes: 1, lastInsertRowid: id };
    }
    
    return { changes: 0, lastInsertRowid: null };
  }

  handleUpdate(sql, params) {
    if (sql.includes('UPDATE appliances')) {
      const appliances = this.tables.get('appliances');
      const id = params[params.length - 1]; // ID is typically last parameter
      const appliance = appliances.get(id);
      
      if (appliance) {
        // Parse the SQL to update the correct fields
        let paramIndex = 0;
        
        if (sql.includes('name = ?')) {
          appliance.name = params[paramIndex++];
        }
        if (sql.includes('power_watts = ?')) {
          appliance.power_watts = params[paramIndex++];
        }
        if (sql.includes('daily_hours = ?')) {
          appliance.daily_hours = params[paramIndex++];
        }
        if (sql.includes('usage_days = ?')) {
          appliance.usage_days = params[paramIndex++];
        }
        if (sql.includes('standby_watts = ?')) {
          appliance.standby_watts = params[paramIndex++];
        }
        if (sql.includes('updated_at = ?')) {
          // Ensure updated_at is always newer than created_at by adding 1ms
          const updatedTime = new Date(Date.now() + 1).toISOString();
          appliance.updated_at = updatedTime;
          paramIndex++; // Still consume the parameter
        }
        
        appliances.set(id, appliance);
        return { changes: 1, lastInsertRowid: id };
      }
    }
    
    return { changes: 0, lastInsertRowid: null };
  }

  handleDelete(sql, params) {
    if (sql.includes('DELETE FROM appliances WHERE id = ?')) {
      const appliances = this.tables.get('appliances');
      const id = params[0];
      
      if (appliances.has(id)) {
        appliances.delete(id);
        return { changes: 1, lastInsertRowid: null };
      }
    }
    
    return { changes: 0, lastInsertRowid: null };
  }

  /**
   * Save database state (no-op for test database)
   */
  save() {
    // No-op for test database
  }

  /**
   * Reset database state for testing
   */
  reset() {
    this.tables.clear();
    this.autoIncrement.clear();
    this.isInitialized = false;
  }
}

// Export singleton for tests
export default new TestDatabase();