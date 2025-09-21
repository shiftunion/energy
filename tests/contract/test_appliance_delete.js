/**
 * Contract Test: Delete Appliance  
 * Tests the applianceService.delete() method per appliance-api.md contract
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApplianceService } from '../../src/services/ApplianceService.js';
import { resetTestDatabase } from '../../src/utils/test-setup.js';

describe('ApplianceService.delete() Contract', () => {
  let applianceService;

  beforeEach(async () => {
    await resetTestDatabase();
    applianceService = new ApplianceService();
    await applianceService.initialize();
  });

  it('should delete existing appliance and return confirmation', async () => {
    expect(applianceService).toBeDefined();
    
    const created = await applianceService.create({
      name: 'Temporary Device',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    const result = await applianceService.delete(created.id);
    
    expect(result).toMatchObject({
      success: true,
      id: created.id,
      message: 'Appliance deleted successfully'
    });
    
    // Verify appliance no longer exists
    await expect(applianceService.getById(created.id)).rejects.toMatchObject({
      error: 'NOT_FOUND'
    });
  });

  it('should return NOT_FOUND error for non-existent appliance', async () => {
    expect(applianceService).toBeDefined();
    
    const nonExistentId = 99999;
    
    await expect(applianceService.delete(nonExistentId)).rejects.toMatchObject({
      error: 'NOT_FOUND',
      message: 'Appliance not found',
      id: nonExistentId
    });
  });

  it('should validate id parameter is provided', async () => {
    expect(applianceService).toBeDefined();
    
    await expect(applianceService.delete()).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'id',
      message: expect.stringContaining('required')
    });
    
    await expect(applianceService.delete(null)).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'id'
    });
    
    await expect(applianceService.delete('')).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'id'
    });
  });

  it('should validate id parameter is numeric', async () => {
    expect(applianceService).toBeDefined();
    
    await expect(applianceService.delete('invalid')).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'id',
      message: expect.stringContaining('numeric')
    });
  });

  it('should handle database errors gracefully', async () => {
    expect(applianceService).toBeDefined();
    
    // Create appliance first
    const created = await applianceService.create({
      name: 'Test Device',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    // Simulate database failure
    applianceService.database = null;
    
    await expect(applianceService.delete(created.id)).rejects.toMatchObject({
      error: 'DATABASE_ERROR'
    });
  });

  it('should not affect other appliances when deleting one', async () => {
    expect(applianceService).toBeDefined();
    
    const appliance1 = await applianceService.create({
      name: 'Keep This',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    const appliance2 = await applianceService.create({
      name: 'Delete This',
      power_watts: 50,
      daily_hours: 4,
      usage_days: [0, 6] // Sunday and Saturday
    });
    
    // Delete second appliance
    await applianceService.delete(appliance2.id);
    
    // First appliance should still exist
    const remaining = await applianceService.getById(appliance1.id);
    expect(remaining).toMatchObject({
      id: appliance1.id,
      name: 'Keep This'
    });
  });

  it('should complete deletion within performance requirements', async () => {
    expect(applianceService).toBeDefined();
    
    const created = await applianceService.create({
      name: 'Performance Test',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    const startTime = performance.now();
    await applianceService.delete(created.id);
    const endTime = performance.now();
    
    // Per constitution: <100ms UI feedback requirement
    expect(endTime - startTime).toBeLessThan(100);
  });
});