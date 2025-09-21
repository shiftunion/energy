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

// Mock Chart.js for test environment
if (isTestEnvironment()) {
  // Mock Chart constructor directly
  class MockChart {
    constructor(ctx, config) {
      this.ctx = ctx;
      this.config = config;
      this.data = config.data || { labels: [], datasets: [] };
      this.options = config.options || {};
      this.type = config.type || 'line';
    }
    
    update() {}
    destroy() {}
    resize() {}
    
    toBase64Image() {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }

  // Add static properties to the Chart class
  MockChart.register = () => {};
  MockChart.defaults = {
    plugins: {
      legend: {}
    },
    responsive: true
  };

  // Set Chart as the constructor function
  globalThis.Chart = MockChart;
  
  // Mock HTML Canvas for Chart.js
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = function(type) {
      return {
        canvas: this,
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: [] }),
        putImageData: () => {},
        createImageData: () => ({ data: [] }),
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => ({ width: 0 }),
        transform: () => {},
        rect: () => {},
        clip: () => {}
      };
    };
  }
}