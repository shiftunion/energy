/**
 * Contract Test: Energy Consumption Calculator
 * Tests the consumptionService per consumption calculations from data-model.md
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('ConsumptionService Contract', () => {
  let consumptionService;
  let applianceService;

  beforeEach(() => {
    // This will fail until services are implemented
    // consumptionService = new ConsumptionService();
    // applianceService = new ApplianceService();
  });

  it('should calculate daily consumption for single appliance', async () => {
    expect(consumptionService).toBeDefined();
    
    // Create test appliance: 100W for 8 hours/day
    const appliance = await applianceService.create({
      name: 'Test Appliance',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5, 6, 7] // All days
    });
    
    const dailyConsumption = await consumptionService.calculateDaily(appliance.id);
    
    // Expected: 100W × 8h = 800 Wh = 0.8 kWh
    expect(dailyConsumption).toEqual({
      appliance_id: appliance.id,
      daily_kwh: 0.8,
      calculation: {
        power_watts: 100,
        daily_hours: 8,
        formula: '100W × 8h ÷ 1000 = 0.8 kWh'
      }
    });
  });

  it('should calculate weekly consumption considering usage_days', async () => {
    expect(consumptionService).toBeDefined();
    
    // Weekdays only appliance: 200W for 4 hours on Mon-Fri
    const appliance = await applianceService.create({
      name: 'Weekday Appliance',
      power_watts: 200,
      daily_hours: 4,
      usage_days: [1, 2, 3, 4, 5] // Mon-Fri
    });
    
    const weeklyConsumption = await consumptionService.calculateWeekly(appliance.id);
    
    // Expected: 200W × 4h × 5 days = 4000 Wh = 4.0 kWh
    expect(weeklyConsumption).toEqual({
      appliance_id: appliance.id,
      weekly_kwh: 4.0,
      usage_days: 5,
      calculation: {
        daily_kwh: 0.8, // 200W × 4h ÷ 1000
        active_days: 5,
        formula: '0.8 kWh/day × 5 days = 4.0 kWh'
      }
    });
  });

  it('should calculate monthly consumption (30 day estimate)', async () => {
    expect(consumptionService).toBeDefined();
    
    const appliance = await applianceService.create({
      name: 'Daily Appliance',
      power_watts: 50,
      daily_hours: 12,
      usage_days: [1, 2, 3, 4, 5, 6, 7] // Every day
    });
    
    const monthlyConsumption = await consumptionService.calculateMonthly(appliance.id);
    
    // Expected: 50W × 12h × 30 days = 18000 Wh = 18.0 kWh
    expect(monthlyConsumption).toEqual({
      appliance_id: appliance.id,
      monthly_kwh: 18.0,
      days_per_month: 30,
      calculation: {
        daily_kwh: 0.6, // 50W × 12h ÷ 1000
        active_days_per_week: 7,
        weeks_per_month: 4.29, // 30/7
        formula: '0.6 kWh/day × 30 days = 18.0 kWh'
      }
    });
  });

  it('should calculate total consumption for all appliances', async () => {
    expect(consumptionService).toBeDefined();
    
    // Create multiple appliances
    const appliance1 = await applianceService.create({
      name: 'Refrigerator',
      power_watts: 150,
      daily_hours: 24,
      usage_days: [1, 2, 3, 4, 5, 6, 7]
    });
    
    const appliance2 = await applianceService.create({
      name: 'Computer', 
      power_watts: 300,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    const totalConsumption = await consumptionService.calculateTotalDaily();
    
    // Expected: Refrigerator (3.6) + Computer (2.4) = 6.0 kWh/day
    expect(totalConsumption).toEqual({
      total_daily_kwh: 6.0,
      appliances: [
        { id: appliance1.id, name: 'Refrigerator', daily_kwh: 3.6 },
        { id: appliance2.id, name: 'Computer', daily_kwh: 2.4 }
      ],
      breakdown: expect.any(Array)
    });
  });

  it('should handle appliances not used on certain days', async () => {
    expect(consumptionService).toBeDefined();
    
    // Weekend-only appliance
    const appliance = await applianceService.create({
      name: 'Weekend TV',
      power_watts: 100,
      daily_hours: 6,
      usage_days: [6, 7] // Sat-Sun only
    });
    
    const weeklyConsumption = await consumptionService.calculateWeekly(appliance.id);
    
    // Expected: 100W × 6h × 2 days = 1200 Wh = 1.2 kWh
    expect(weeklyConsumption.weekly_kwh).toBe(1.2);
    expect(weeklyConsumption.usage_days).toBe(2);
  });

  it('should provide cost estimates when rate provided', async () => {
    expect(consumptionService).toBeDefined();
    
    const appliance = await applianceService.create({
      name: 'Test Appliance',
      power_watts: 1000, // 1kW
      daily_hours: 1, // 1 hour
      usage_days: [1, 2, 3, 4, 5, 6, 7] // Daily
    });
    
    const costEstimate = await consumptionService.calculateCost(appliance.id, {
      rate_per_kwh: 0.12 // $0.12 per kWh
    });
    
    expect(costEstimate).toEqual({
      appliance_id: appliance.id,
      daily_cost: 0.12, // 1 kWh × $0.12
      weekly_cost: 0.84, // 1 kWh × 7 days × $0.12
      monthly_cost: 3.60, // 1 kWh × 30 days × $0.12
      rate_per_kwh: 0.12
    });
  });

  it('should validate inputs and handle errors', async () => {
    expect(consumptionService).toBeDefined();
    
    // Non-existent appliance
    await expect(consumptionService.calculateDaily(99999)).rejects.toMatchObject({
      error: 'NOT_FOUND'
    });
    
    // Invalid rate for cost calculation
    const appliance = await applianceService.create({
      name: 'Test',
      power_watts: 100,
      daily_hours: 1,
      usage_days: [1]
    });
    
    await expect(consumptionService.calculateCost(appliance.id, {
      rate_per_kwh: -0.1 // Invalid negative rate
    })).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'rate_per_kwh'
    });
  });

  it('should complete calculations within performance requirements', async () => {
    expect(consumptionService).toBeDefined();
    
    // Create multiple appliances to test performance
    const appliances = [];
    for (let i = 0; i < 10; i++) {
      appliances.push(await applianceService.create({
        name: `Appliance ${i}`,
        power_watts: 100 + i * 10,
        daily_hours: 1 + i,
        usage_days: [1, 2, 3, 4, 5, 6, 7]
      }));
    }
    
    const startTime = performance.now();
    await consumptionService.calculateTotalDaily();
    const endTime = performance.now();
    
    // Per constitution: <100ms UI feedback requirement
    expect(endTime - startTime).toBeLessThan(100);
  });
});