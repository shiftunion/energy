/**
 * Contract Test: Get Appliance by ID  
 * Tests the applianceService.getById() method per appliance-api.md contract
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApplianceService } from '../../src/services/ApplianceService.js';
import { resetTestDatabase } from '../../src/utils/test-setup.js';

describe('ApplianceService.getById() Contract', () => {
  let applianceService;

  beforeEach(async () => {
    await resetTestDatabase();
    applianceService = new ApplianceService();
    await applianceService.initialize();
  });

  it('should return specific appliance by ID', async () => {
    expect(applianceService).toBeDefined();
    
    // Create test appliance
    const created = await applianceService.create({
      name: 'Test Appliance',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    const result = await applianceService.getById(created.id);
    
    expect(result).toMatchObject({
      id: created.id,
      name: 'Test Appliance',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5],
      consumption_estimates: {
        daily_kwh: expect.any(Number),
        weekly_kwh: expect.any(Number),
        monthly_kwh: expect.any(Number)
      }
    });
  });

  it('should return NOT_FOUND error for non-existent ID', async () => {
    expect(applianceService).toBeDefined();
    
    const nonExistentId = 99999;
    
    await expect(applianceService.getById(nonExistentId)).rejects.toMatchObject({
      error: 'NOT_FOUND',
      message: 'Appliance not found',
      id: nonExistentId
    });
  });

  it('should validate ID parameter type', async () => {
    expect(applianceService).toBeDefined();
    
    // Test invalid ID types
    await expect(applianceService.getById('invalid')).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'id'
    });
    
    await expect(applianceService.getById(null)).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'id'
    });
  });

  it('should include calculated consumption estimates', async () => {
    expect(applianceService).toBeDefined();
    
    // Create appliance with known consumption pattern
    const created = await applianceService.create({
      name: 'Predictable Device',
      power_watts: 1000, // 1kW
      daily_hours: 2,    // 2 hours
      usage_days: [0, 1, 2, 3, 4, 5, 6] // All days
    });
    
    const result = await applianceService.getById(created.id);
    
    // 1kW × 2h = 2 kWh/day
    expect(result.consumption_estimates.daily_kwh).toBeCloseTo(2.0, 1);
    expect(result.consumption_estimates.weekly_kwh).toBeCloseTo(14.0, 1); // 2 × 7
  });

  it('should handle standby power consumption', async () => {
    expect(applianceService).toBeDefined();
    
    const created = await applianceService.create({
      name: 'Device with Standby',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5], // Weekdays
      standby_watts: 5 // 5W standby
    });
    
    const result = await applianceService.getById(created.id);
    
    expect(result.standby_watts).toBe(5);
    // Consumption should account for both active and standby power
    expect(result.consumption_estimates.daily_kwh).toBeGreaterThan(0.8); // Active use
  });

  it('should handle database query errors gracefully', async () => {
    expect(applianceService).toBeDefined();
    
    // Simulate database failure
    applianceService.database = null;
    
    await expect(applianceService.getById(1)).rejects.toMatchObject({
      error: 'DATABASE_ERROR'
    });
  });
});