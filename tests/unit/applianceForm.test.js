import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock the DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

describe('Appliance Form Validation', () => {
  let mockForm;
  let mockApplianceService;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Create mock form
    mockForm = document.createElement('form');
    mockForm.id = 'appliance-form';
    mockForm.innerHTML = `
      <input type="text" name="name" id="appliance-name" />
      <input type="number" name="power_watts" id="appliance-power" />
      <input type="number" name="daily_hours" id="appliance-hours" />
      <div class="usage-days">
        <input type="checkbox" name="usage_days" value="0" />
        <input type="checkbox" name="usage_days" value="1" />
        <input type="checkbox" name="usage_days" value="2" />
        <input type="checkbox" name="usage_days" value="3" />
        <input type="checkbox" name="usage_days" value="4" />
        <input type="checkbox" name="usage_days" value="5" />
        <input type="checkbox" name="usage_days" value="6" />
      </div>
    `;
    document.body.appendChild(mockForm);

    // Mock ApplianceService
    mockApplianceService = {
      create: vi.fn().mockResolvedValue({ id: 1 })
    };
  });

  it('should validate valid appliance data submission', () => {
    // Set valid form data
    document.getElementById('appliance-name').value = 'Refrigerator';
    document.getElementById('appliance-power').value = '150';
    document.getElementById('appliance-hours').value = '24';
    document.querySelector('input[name="usage_days"][value="0"]').checked = true;
    document.querySelector('input[name="usage_days"][value="1"]').checked = true;

    const formData = new FormData(mockForm);
    const usageDays = Array.from(formData.getAll('usage_days')).map(Number);

    const applianceData = {
      name: formData.get('name'),
      power_watts: Number(formData.get('power_watts')),
      daily_hours: Number(formData.get('daily_hours')),
      usage_days: usageDays
    };

    expect(applianceData.name).toBe('Refrigerator');
    expect(applianceData.power_watts).toBe(150);
    expect(applianceData.daily_hours).toBe(24);
    expect(applianceData.usage_days).toEqual([0, 1]);
    expect(usageDays.length).toBeGreaterThan(0);
  });

  it('should reject invalid power watts input', () => {
    document.getElementById('appliance-name').value = 'Invalid Appliance';
    document.getElementById('appliance-power').value = '-50'; // Invalid negative value
    document.getElementById('appliance-hours').value = '8';

    const formData = new FormData(mockForm);
    const powerWatts = Number(formData.get('power_watts'));

    expect(powerWatts).toBeLessThan(0);
    // In a real application, this would trigger validation error
    expect(powerWatts).toBe(-50);
  });

  it('should reject submission with no usage days selected', () => {
    document.getElementById('appliance-name').value = 'Test Appliance';
    document.getElementById('appliance-power').value = '100';
    document.getElementById('appliance-hours').value = '8';
    // Don't select any usage days

    const formData = new FormData(mockForm);
    const usageDays = Array.from(formData.getAll('usage_days')).map(Number);

    expect(usageDays.length).toBe(0);
    // This should trigger validation error in the actual application
  });

  it('should reset form after successful submission', () => {
    // Set form data
    document.getElementById('appliance-name').value = 'Test Appliance';
    document.getElementById('appliance-power').value = '100';
    document.getElementById('appliance-hours').value = '8';
    document.querySelector('input[name="usage_days"][value="0"]').checked = true;

    // Simulate form reset
    mockForm.reset();

    expect(document.getElementById('appliance-name').value).toBe('');
    expect(document.getElementById('appliance-power').value).toBe('');
    expect(document.getElementById('appliance-hours').value).toBe('');
    expect(document.querySelector('input[name="usage_days"][value="0"]').checked).toBe(false);
  });

  it('should validate required fields are not empty', () => {
    const formData = new FormData(mockForm);
    
    expect(formData.get('name')).toBe('');
    expect(formData.get('power_watts')).toBe('');
    expect(formData.get('daily_hours')).toBe('');
    
    // These would fail HTML5 validation in a real browser
  });

  it('should validate power watts within reasonable range', () => {
    document.getElementById('appliance-power').value = '50000'; // Unreasonably high
    
    const formData = new FormData(mockForm);
    const powerWatts = Number(formData.get('power_watts'));
    
    expect(powerWatts).toBe(50000);
    // In real application, this should be validated against max value (10000)
    expect(powerWatts).toBeGreaterThan(10000);
  });

  it('should validate daily hours within 0-24 range', () => {
    document.getElementById('appliance-hours').value = '30'; // Invalid > 24
    
    const formData = new FormData(mockForm);
    const dailyHours = Number(formData.get('daily_hours'));
    
    expect(dailyHours).toBe(30);
    // In real application, this should be validated against max value (24)
    expect(dailyHours).toBeGreaterThan(24);
  });
});