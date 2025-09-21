/**
 * Test setup and utilities
 * Provides database switching between production and test environments
 */

// Detect if we're in test environment
export const isTestEnvironment = () => {
  return typeof process !== 'undefined' && process.env.NODE_ENV === 'test' || 
         typeof globalThis.vitest !== 'undefined' ||
         typeof globalThis.__vitest__ !== 'undefined';
};

// Import appropriate database based on environment
export const getDatabase = async () => {
  if (isTestEnvironment()) {
    const testDb = await import('../models/database.test.js');
    return testDb.default;
  } else {
    const prodDb = await import('../models/database.js');
    return prodDb.default;
  }
};

// Initialize database for tests
export const setupTestDatabase = async () => {
  const database = await getDatabase();
  await database.initialize();
  return database;
};

// Clean up test database
export const cleanupTestDatabase = async () => {
  if (isTestEnvironment()) {
    const database = await getDatabase();
    if (database.reset) {
      database.reset();
    }
  }
};

// Reset test database to clean state
export const resetTestDatabase = async () => {
  if (isTestEnvironment()) {
    const database = await getDatabase();
    if (database.reset) {
      database.reset();
    }
    await database.initialize();
  }
};