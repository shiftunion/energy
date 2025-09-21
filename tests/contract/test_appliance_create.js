/**
 * Contract Test: Create Appliance
 * Tests the applianceService.create() method per appliance-api.md contract
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApplianceService } from '../../src/services/ApplianceService.js';
import { resetTestDatabase } from '../../src/utils/test-setup.js';

describe('ApplianceService.create() Contract', () => {
  let applianceService;

  beforeEach(async () => {
    await resetTestDatabase();
    applianceService = new ApplianceService();
    await applianceService.initialize();
  });

  it('should create a valid appliance with all required fields', async () => {
    const applianceData = {
      name: 'Refrigerator',
      power_watts: 150,
      daily_hours: 24,
      usage_days: [0, 1, 2, 3, 4, 5, 6], // All days
      standby_watts: 0
    };

    // This test MUST FAIL until implementation exists
    expect(applianceService).toBeDefined();
    
    const result = await applianceService.create(applianceData);
    
    expect(result).toMatchObject({
      id: expect.any(Number),
      name: 'Refrigerator',
      power_watts: 150,
      daily_hours: 24,
      usage_days: [0, 1, 2, 3, 4, 5, 6],
      standby_watts: 0,
      created_at: expect.any(String),
      updated_at: expect.any(String)
    });
  });

  it('should validate power_watts in range 0.1-10000', async () => {
    const invalidAppliance = {
      name: 'Invalid Appliance',
      power_watts: -5, // Invalid: negative
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    };

    expect(applianceService).toBeDefined();
    
    await expect(applianceService.create(invalidAppliance)).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'power_watts'
    });
  });

  it('should validate daily_hours in range 0-24', async () => {
    const invalidAppliance = {
      name: 'Invalid Hours',
      power_watts: 100,
      daily_hours: 25, // Invalid: over 24
      usage_days: [1, 2, 3, 4, 5]
    };

    expect(applianceService).toBeDefined();
    
    await expect(applianceService.create(invalidAppliance)).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'daily_hours'
    });
  });

  it('should require at least one usage day', async () => {
    const invalidAppliance = {
      name: 'No Usage Days',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [] // Invalid: empty array
    };

    expect(applianceService).toBeDefined();
    
    await expect(applianceService.create(invalidAppliance)).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'usage_days'
    });
  });

  it('should sanitize name input for XSS prevention', async () => {
    const maliciousAppliance = {
      name: '<script>alert("xss")</script>',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    };

    expect(applianceService).toBeDefined();
    
    const result = await applianceService.create(maliciousAppliance);
    
    // Should sanitize the script tag
    expect(result.name).not.toContain('<script>');
    expect(result.name).not.toContain('alert');
  });

  it('should handle database errors gracefully', async () => {
    const appliance = {
      name: 'Test Appliance',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    };

    expect(applianceService).toBeDefined();
    
    // Simulate database failure by closing connection
    // This test verifies error handling contract
    applianceService.database = null;
    
    await expect(applianceService.create(appliance)).rejects.toMatchObject({
      error: 'DATABASE_ERROR'
    });
  });
});