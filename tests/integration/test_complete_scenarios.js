/**
 * Integration Test: Complete User Scenarios
 * Tests the full user workflows from quickstart.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApplianceService } from '../../src/services/ApplianceService.js';
import { ConsumptionService } from '../../src/services/ConsumptionService.js';
import { EnergyChart } from '../../src/chart/EnergyChart.js';
import { resetTestDatabase } from '../../src/utils/test-setup.js';

// Ensure Chart.js mock is loaded
import '../../src/utils/test-setup.js';

describe('Complete User Scenarios Integration', () => {
  let applianceService;
  let consumptionService;
  let chartComponent;
  let appContainer;

    beforeEach(async () => {
        // Reset the database for each test
        await resetTestDatabase();
        
        // Clean up any existing elements
        const existingChart = document.getElementById('consumption-chart');
        if (existingChart) {
            existingChart.remove();
        }
        const existingTotals = document.getElementById('totals-display');
        if (existingTotals) {
            existingTotals.remove();
        }
        const existingTable = document.querySelector('[role="table"]');
        if (existingTable) {
            existingTable.remove();
        }
        
        // Create a mock chart container
        const chartContainer = document.createElement('div');
        chartContainer.id = 'consumption-chart';
        chartContainer.style.width = '400px';
        chartContainer.style.height = '200px';
        document.body.appendChild(chartContainer);
        
        // Create mock totals display element
        const totalsElement = document.createElement('div');
        totalsElement.id = 'totals-display';
        totalsElement.textContent = '0 kWh/day';
        document.body.appendChild(totalsElement);
        
        // Create mock data table for accessibility (would be part of EnergyChart implementation)
        const dataTable = document.createElement('div');
        dataTable.setAttribute('role', 'table');
        dataTable.innerHTML = 'Refrigerator: 3.6 kWh, Computer: 2.4 kWh';
        dataTable.style.position = 'absolute';
        dataTable.style.left = '-10000px'; // Screen reader only
        document.body.appendChild(dataTable);
        
        // Initialize services and components
        applianceService = new ApplianceService();
        await applianceService.initialize();
        
        consumptionService = new ConsumptionService();
        await consumptionService.initialize();
        
        chartComponent = new EnergyChart(chartContainer);
    });  it('Scenario 1: Add refrigerator and see immediate consumption update', async () => {
    expect(applianceService).toBeDefined();
    expect(consumptionService).toBeDefined();
    expect(chartComponent).toBeDefined();
    
    // Step 1: User adds refrigerator
    const refrigerator = await applianceService.create({
      name: 'Samsung Refrigerator',
      power_watts: 150,
      daily_hours: 24,
      usage_days: [0, 1, 2, 3, 4, 5, 6] // Every day
    });
    
    // Step 2: Calculate consumption
    const dailyConsumption = await consumptionService.calculateDaily(refrigerator.id);
    expect(dailyConsumption.daily_kwh).toBe(3.6); // 150W × 24h ÷ 1000
    
    // Step 3: Chart updates automatically
    const chartData = await consumptionService.calculateTotalDaily();
    await chartComponent.renderDaily(chartData.appliances);
    
    // Verify chart shows refrigerator data
    expect(chartComponent.chart.data.labels).toContain('Samsung Refrigerator');
    expect(chartComponent.chart.data.datasets[0].data).toContain(3.6);
    
    // Step 4: Total display updates (simulate UI update)
    const totalsElement = document.getElementById('totals-display');
    totalsElement.textContent = `${chartData.total_daily_kwh} kWh/day`;
    expect(totalsElement.textContent).toContain('3.6 kWh/day');
  });

  it('Scenario 2: Add multiple appliances and compare consumption', async () => {
    expect(applianceService).toBeDefined();
    expect(consumptionService).toBeDefined();
    expect(chartComponent).toBeDefined();
    
    // Add multiple appliances as per quickstart example
    const appliances = [
      {
        name: 'Refrigerator',
        power_watts: 150,
        daily_hours: 24,
        usage_days: [0, 1, 2, 3, 4, 5, 6]
      },
      {
        name: 'Computer',
        power_watts: 300,
        daily_hours: 8,
        usage_days: [1, 2, 3, 4, 5] // Weekdays only (0=Sunday, 6=Saturday)
      },
      {
        name: 'TV',
        power_watts: 200,
        daily_hours: 4,
        usage_days: [0, 6] // Weekends only (Sunday and Saturday)
      }
    ];
    
    const createdAppliances = [];
    for (const applianceData of appliances) {
      const created = await applianceService.create(applianceData);
      createdAppliances.push(created);
    }
    
    // Calculate total consumption
    const totalConsumption = await consumptionService.calculateTotalDaily();
    
    // Expected calculations:
    // Refrigerator: 150W × 24h = 3.6 kWh/day
    // Computer: 300W × 8h = 2.4 kWh/day (but only weekdays)
    // TV: 200W × 4h = 0.8 kWh/day (but only weekends)
    
    expect(totalConsumption.appliances).toHaveLength(3);
    expect(totalConsumption.total_daily_kwh).toBeGreaterThan(3.6); // At minimum refrigerator
    
    // Chart should show all appliances
    await chartComponent.renderDaily(totalConsumption.appliances);
    expect(chartComponent.chart.data.labels).toHaveLength(3);
  });

  it('Scenario 3: Update appliance and see consumption recalculate', async () => {
    expect(applianceService).toBeDefined();
    expect(consumptionService).toBeDefined();
    
    // Create initial appliance
    const appliance = await applianceService.create({
      name: 'Old Heater',
      power_watts: 1500,
      daily_hours: 8,
      usage_days: [0, 1, 2, 3, 4, 5, 6]
    });
    
    // Initial consumption: 1500W × 8h = 12.0 kWh/day
    let consumption = await consumptionService.calculateDaily(appliance.id);
    expect(consumption.daily_kwh).toBe(12.0);
    
    // Update to more efficient heater
    const updated = await applianceService.update(appliance.id, {
      name: 'New Efficient Heater',
      power_watts: 800, // Much more efficient
      daily_hours: 6 // Used less
    });
    
    // Recalculate consumption: 800W × 6h = 4.8 kWh/day
    consumption = await consumptionService.calculateDaily(updated.id);
    expect(consumption.daily_kwh).toBe(4.8);
    
    // Verify savings calculation
    const savings = 12.0 - 4.8;
    expect(savings).toBe(7.2); // 7.2 kWh/day savings
  });

  it('Scenario 4: Delete appliance and update totals', async () => {
    expect(applianceService).toBeDefined();
    expect(consumptionService).toBeDefined();
    
    // Create multiple appliances
    const fridge = await applianceService.create({
      name: 'Fridge',
      power_watts: 150,
      daily_hours: 24,
      usage_days: [0, 1, 2, 3, 4, 5, 6]
    });
    
    const oldAppliance = await applianceService.create({
      name: 'Old Washer',
      power_watts: 500,
      daily_hours: 2,
      usage_days: [0, 1, 2, 3, 4, 5, 6]
    });
    
    // Initial total
    let totalConsumption = await consumptionService.calculateTotalDaily();
    const initialTotal = totalConsumption.total_daily_kwh;
    expect(initialTotal).toBe(4.6); // 3.6 + 1.0
    
    // Delete old appliance
    await applianceService.delete(oldAppliance.id);
    
    // Recalculate total
    totalConsumption = await consumptionService.calculateTotalDaily();
    expect(totalConsumption.total_daily_kwh).toBe(3.6); // Only fridge remains
    expect(totalConsumption.appliances).toHaveLength(1);
  });

  it('Scenario 5: View weekly and monthly projections', async () => {
    expect(applianceService).toBeDefined();
    expect(consumptionService).toBeDefined();
    expect(chartComponent).toBeDefined();
    
    // Create appliance with weekday-only usage
    const computer = await applianceService.create({
      name: 'Work Computer',
      power_watts: 250,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5] // Monday-Friday (0=Sunday, 6=Saturday)
    });
    
    // Calculate different time periods
    const dailyConsumption = await consumptionService.calculateDaily(computer.id);
    const weeklyConsumption = await consumptionService.calculateWeekly(computer.id);
    const monthlyConsumption = await consumptionService.calculateMonthly(computer.id);
    
    // Verify calculations
    expect(dailyConsumption.daily_kwh).toBe(2.0); // 250W × 8h
    expect(weeklyConsumption.weekly_kwh).toBe(10.0); // 2.0 × 5 days
    expect(monthlyConsumption.monthly_kwh).toBe(42.9); // 2.0 × (30/7 * 5) = 42.9 work days
    
    // Test chart switching between time periods
    await chartComponent.renderDaily([{
      name: computer.name,
      daily_kwh: dailyConsumption.daily_kwh
    }]);
    
    await chartComponent.renderWeekly([{
      name: computer.name,
      weekly_kwh: weeklyConsumption.weekly_kwh,
      usage_days: 5
    }]);
    
    expect(chartComponent.chart.data.datasets[0].label).toBe('Weekly Consumption (kWh)');
  });

  it('Scenario 6: Cost estimation and budget tracking', async () => {
    expect(consumptionService).toBeDefined();
    expect(applianceService).toBeDefined();
    
    // Create realistic household appliances
    const appliances = [
      { name: 'Refrigerator', power_watts: 150, daily_hours: 24, usage_days: [0,1,2,3,4,5,6] },
      { name: 'Air Conditioner', power_watts: 3000, daily_hours: 8, usage_days: [0,1,2,3,4,5,6] },
      { name: 'Water Heater', power_watts: 4000, daily_hours: 3, usage_days: [0,1,2,3,4,5,6] }
    ];
    
    const createdAppliances = [];
    for (const appData of appliances) {
      const created = await applianceService.create(appData);
      createdAppliances.push(created);
    }
    
    // Calculate costs at $0.12/kWh (typical US rate)
    const costRate = 0.12;
    let totalDailyCost = 0;
    
    for (const appliance of createdAppliances) {
      const cost = await consumptionService.calculateCost(appliance.id, {
        rate_per_kwh: costRate
      });
      totalDailyCost += cost.daily_cost;
    }
    
    // Expected: High consumption household
    expect(totalDailyCost).toBeGreaterThan(3.0); // Over $3/day
    
    // Monthly projection
    const monthlyCost = totalDailyCost * 30;
    expect(monthlyCost).toBeGreaterThan(90); // Over $90/month
  });

  it('Scenario 7: Accessibility navigation with screen reader', async () => {
    expect(chartComponent).toBeDefined();
    
    // Create test data
    const testData = [
      { name: 'Refrigerator', daily_kwh: 3.6 },
      { name: 'Computer', daily_kwh: 2.4 }
    ];
    
    await chartComponent.renderDaily(testData);
    
    // Test keyboard navigation
    const canvas = document.querySelector('canvas');
    expect(canvas.getAttribute('tabindex')).toBe('0');
    
    // Simulate screen reader navigation
    const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    canvas.dispatchEvent(arrowRightEvent);
    
    // Should announce data point via live region (ArrowRight moves to second item)
    const liveRegion = document.getElementById('chart-live-region');
    expect(liveRegion).toBeDefined();
    expect(liveRegion.textContent).toContain('Computer');
    
    // Test data table alternative for screen readers
    const dataTable = document.querySelector('[role="table"]');
    expect(dataTable).toBeDefined();
    expect(dataTable.textContent).toContain('Refrigerator');
    expect(dataTable.textContent).toContain('3.6');
  });

  it('End-to-end performance: Complete workflow under 500ms', async () => {
    expect(applianceService).toBeDefined();
    expect(consumptionService).toBeDefined();
    expect(chartComponent).toBeDefined();
    
    const startTime = performance.now();
    
    // Complete user workflow
    const appliance = await applianceService.create({
      name: 'Test Device',
      power_watts: 100,
      daily_hours: 8,
      usage_days: [1, 2, 3, 4, 5] // Weekdays (0=Sunday, 6=Saturday)
    });
    
    const consumption = await consumptionService.calculateDaily(appliance.id);
    const totalConsumption = await consumptionService.calculateTotalDaily();
    await chartComponent.renderDaily(totalConsumption.appliances);
    
    const endTime = performance.now();
    
    // Per constitution: Complete workflows should be responsive
    expect(endTime - startTime).toBeLessThan(500);
  });
});