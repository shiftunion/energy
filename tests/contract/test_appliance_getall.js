/**
 * Contract Test: Get All Appliances
 * Tests the applianceService.getAll() method per appliance-api.md contract
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApplianceService } from '../../src/services/ApplianceService.js';
import { resetTestDatabase } from '../../src/utils/test-setup.js';

describe('ApplianceService.getAll() Contract', () => {
  let applianceService;

  beforeEach(async () => {
    await resetTestDatabase();
    applianceService = new ApplianceService();
    await applianceService.initialize();
  });

  it('should return all appliances with consumption estimates', async () => {
    // This test MUST FAIL until implementation exists
    expect(applianceService).toBeDefined();
    
    const result = await applianceService.getAll();
    
    expect(result).toMatchObject({
      appliances: expect.any(Array),
      total_consumption: {
        daily_kwh: expect.any(Number),
        weekly_kwh: expect.any(Number),
        monthly_kwh: expect.any(Number)
      }
    });
  });

  it('should include consumption estimates for each appliance', async () => {
    expect(applianceService).toBeDefined();
    
    // Add test appliance first
    await applianceService.create({
      name: 'Test Refrigerator',
      power_watts: 150,
      daily_hours: 24,
      usage_days: [0, 1, 2, 3, 4, 5, 6]
    });
    
    const result = await applianceService.getAll();
    
    expect(result.appliances).toHaveLength(1);
    expect(result.appliances[0]).toMatchObject({
      id: expect.any(Number),
      name: 'Test Refrigerator',
      power_watts: 150,
      daily_hours: 24,
      usage_days: [0, 1, 2, 3, 4, 5, 6],
      consumption_estimates: {
        daily_kwh: expect.any(Number),
        weekly_kwh: expect.any(Number),
        monthly_kwh: expect.any(Number)
      }
    });
  });

  it('should calculate correct consumption estimates', async () => {
    expect(applianceService).toBeDefined();
    
    // Test appliance: 150W × 24h = 3.6 kWh/day
    await applianceService.create({
      name: 'Always-On Device',
      power_watts: 150,
      daily_hours: 24,
      usage_days: [0, 1, 2, 3, 4, 5, 6]
    });
    
    const result = await applianceService.getAll();
    
    expect(result.appliances[0].consumption_estimates.daily_kwh).toBeCloseTo(3.6, 1);
    expect(result.appliances[0].consumption_estimates.weekly_kwh).toBeCloseTo(25.2, 1); // 3.6 × 7
  });

  it('should return empty array when no appliances exist', async () => {
    expect(applianceService).toBeDefined();
    
    const result = await applianceService.getAll();
    
    expect(result.appliances).toEqual([]);
    expect(result.total_consumption.daily_kwh).toBe(0);
    expect(result.total_consumption.weekly_kwh).toBe(0);
    expect(result.total_consumption.monthly_kwh).toBe(0);
  });

  it('should aggregate total consumption across all appliances', async () => {
    expect(applianceService).toBeDefined();
    
    // Add multiple appliances
    await applianceService.create({
      name: 'Refrigerator',
      power_watts: 150,
      daily_hours: 24,
      usage_days: [0, 1, 2, 3, 4, 5, 6]
    });
    
    await applianceService.create({
      name: 'Washing Machine',
      power_watts: 500,
      daily_hours: 1,
      usage_days: [1, 2, 3, 4, 5] // Weekdays only
    });
    
    const result = await applianceService.getAll();
    
    expect(result.appliances).toHaveLength(2);
    
    // Total should be sum of both appliances
    const expectedDaily = 3.6; // Refrigerator always on
    const expectedWeekly = (3.6 * 7) + (0.5 * 5); // Fridge + washing machine weekdays
    
    expect(result.total_consumption.weekly_kwh).toBeCloseTo(expectedWeekly, 1);
  });

  it('should handle database query errors gracefully', async () => {
    expect(applianceService).toBeDefined();
    
    // Simulate database failure
    applianceService.database = null;
    
    await expect(applianceService.getAll()).rejects.toMatchObject({
      error: 'DATABASE_ERROR'
    });
  });
});