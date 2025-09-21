/**
 * Contract Test: Update Appliance
 * Tests the applianceService.update() method per appliance-api.md contract
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApplianceService } from '../../src/services/ApplianceService.js';
import { resetTestDatabase } from '../../src/utils/test-setup.js';

describe('ApplianceService.update() Contract', () => {
  let applianceService;

  beforeEach(async () => {
    await resetTestDatabase();
    applianceService = new ApplianceService();
    await applianceService.initialize();
  });

  it('should update existing appliance with valid data', async () => {
    expect(applianceService).toBeDefined();
    
    // Create test appliance
    const created = await applianceService.create({
      name: 'Original Name',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    const updates = {
      name: 'Updated Name',
      power_watts: 150,
      daily_hours: 10
    };
    
    const result = await applianceService.update(created.id, updates);
    
    expect(result).toMatchObject({
      id: created.id,
      name: 'Updated Name',
      power_watts: 150,
      daily_hours: 10,
      usage_days: [1, 2, 3, 4, 5], // Unchanged
      updated_at: expect.any(String)
    });
    
    // Updated_at should be newer than created_at
    expect(new Date(result.updated_at).getTime()).toBeGreaterThan(
      new Date(created.created_at).getTime()
    );
  });

  it('should allow partial updates', async () => {
    expect(applianceService).toBeDefined();
    
    const created = await applianceService.create({
      name: 'Test Device',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    // Update only power consumption
    const result = await applianceService.update(created.id, {
      power_watts: 200
    });
    
    expect(result.power_watts).toBe(200);
    expect(result.name).toBe('Test Device'); // Unchanged
    expect(result.daily_hours).toBe(8); // Unchanged
  });

  it('should validate updated fields using same rules as create', async () => {
    expect(applianceService).toBeDefined();
    
    const created = await applianceService.create({
      name: 'Valid Device',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    // Test invalid power_watts
    await expect(applianceService.update(created.id, {
      power_watts: -10 // Invalid
    })).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'power_watts'
    });
    
    // Test invalid daily_hours
    await expect(applianceService.update(created.id, {
      daily_hours: 25 // Invalid
    })).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      field: 'daily_hours'
    });
  });

  it('should return NOT_FOUND error for non-existent appliance', async () => {
    expect(applianceService).toBeDefined();
    
    const nonExistentId = 99999;
    
    await expect(applianceService.update(nonExistentId, {
      name: 'New Name'
    })).rejects.toMatchObject({
      error: 'NOT_FOUND',
      message: 'Appliance not found',
      id: nonExistentId
    });
  });

  it('should sanitize text inputs in updates', async () => {
    expect(applianceService).toBeDefined();
    
    const created = await applianceService.create({
      name: 'Safe Name',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    const result = await applianceService.update(created.id, {
      name: '<script>alert("xss")</script>'
    });
    
    expect(result.name).not.toContain('<script>');
    expect(result.name).not.toContain('alert');
  });

  it('should require at least one field to update', async () => {
    expect(applianceService).toBeDefined();
    
    const created = await applianceService.create({
      name: 'Test Device',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    await expect(applianceService.update(created.id, {})).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      message: expect.stringContaining('at least one field')
    });
  });

  it('should handle database errors gracefully', async () => {
    expect(applianceService).toBeDefined();
    
    const created = await applianceService.create({
      name: 'Test Device',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5]
    });
    
    // Simulate database failure
    applianceService.database = null;
    
    await expect(applianceService.update(created.id, {
      name: 'New Name'
    })).rejects.toMatchObject({
      error: 'DATABASE_ERROR'
    });
  });
});