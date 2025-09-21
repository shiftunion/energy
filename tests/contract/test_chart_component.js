/**
 * Contract Test: Chart Component
 * Tests the EnergyChart component per chart-component.md contract
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('EnergyChart Component Contract', () => {
  let chartComponent;
  let mockContainer;

  beforeEach(() => {
    // Create mock DOM container
    mockContainer = document.createElement('div');
    mockContainer.id = 'test-chart';
    document.body.appendChild(mockContainer);
    
    // This will fail until EnergyChart is implemented
    // chartComponent = new EnergyChart(mockContainer);
  });

  afterEach(() => {
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer);
    }
  });

  it('should initialize chart with container element', () => {
    expect(chartComponent).toBeDefined();
    expect(chartComponent.container).toBe(mockContainer);
    expect(chartComponent.chart).toBeDefined(); // Chart.js instance
  });

  it('should render daily consumption bar chart', async () => {
    expect(chartComponent).toBeDefined();
    
    const testData = [
      { name: 'Refrigerator', daily_kwh: 3.6 },
      { name: 'Computer', daily_kwh: 2.4 },
      { name: 'TV', daily_kwh: 1.2 }
    ];
    
    await chartComponent.renderDaily(testData);
    
    // Verify chart configuration
    expect(chartComponent.chart.config.type).toBe('bar');
    expect(chartComponent.chart.data.labels).toEqual(['Refrigerator', 'Computer', 'TV']);
    expect(chartComponent.chart.data.datasets[0].data).toEqual([3.6, 2.4, 1.2]);
    expect(chartComponent.chart.data.datasets[0].label).toBe('Daily Consumption (kWh)');
  });

  it('should render weekly consumption comparison', async () => {
    expect(chartComponent).toBeDefined();
    
    const testData = [
      { name: 'Weekday Computer', weekly_kwh: 12.0, usage_days: 5 },
      { name: 'Weekend TV', weekly_kwh: 2.4, usage_days: 2 },
      { name: 'Always-on Fridge', weekly_kwh: 25.2, usage_days: 7 }
    ];
    
    await chartComponent.renderWeekly(testData);
    
    expect(chartComponent.chart.config.type).toBe('bar');
    expect(chartComponent.chart.data.labels).toEqual(['Weekday Computer', 'Weekend TV', 'Always-on Fridge']);
    expect(chartComponent.chart.data.datasets[0].data).toEqual([12.0, 2.4, 25.2]);
    expect(chartComponent.chart.data.datasets[0].label).toBe('Weekly Consumption (kWh)');
  });

  it('should support pie chart for consumption breakdown', async () => {
    expect(chartComponent).toBeDefined();
    
    const testData = [
      { name: 'Heating', daily_kwh: 8.0 },
      { name: 'Appliances', daily_kwh: 4.5 },
      { name: 'Lighting', daily_kwh: 1.5 }
    ];
    
    await chartComponent.renderPieChart(testData);
    
    expect(chartComponent.chart.config.type).toBe('pie');
    expect(chartComponent.chart.data.labels).toEqual(['Heating', 'Appliances', 'Lighting']);
    expect(chartComponent.chart.data.datasets[0].data).toEqual([8.0, 4.5, 1.5]);
  });

  it('should update chart data dynamically', async () => {
    expect(chartComponent).toBeDefined();
    
    // Initial data
    const initialData = [
      { name: 'Device A', daily_kwh: 2.0 }
    ];
    
    await chartComponent.renderDaily(initialData);
    expect(chartComponent.chart.data.labels).toHaveLength(1);
    
    // Updated data
    const updatedData = [
      { name: 'Device A', daily_kwh: 2.5 },
      { name: 'Device B', daily_kwh: 1.8 }
    ];
    
    await chartComponent.updateData(updatedData);
    
    expect(chartComponent.chart.data.labels).toHaveLength(2);
    expect(chartComponent.chart.data.datasets[0].data).toEqual([2.5, 1.8]);
  });

  it('should be accessible with proper ARIA labels', () => {
    expect(chartComponent).toBeDefined();
    
    const canvas = mockContainer.querySelector('canvas');
    expect(canvas).toBeDefined();
    
    // Per WCAG 2.1 AA requirements from constitution
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toContain('Energy consumption chart');
    expect(canvas.getAttribute('tabindex')).toBe('0');
  });

  it('should provide keyboard navigation support', async () => {
    expect(chartComponent).toBeDefined();
    
    const testData = [
      { name: 'Device A', daily_kwh: 2.0 },
      { name: 'Device B', daily_kwh: 1.5 }
    ];
    
    await chartComponent.renderDaily(testData);
    
    const canvas = mockContainer.querySelector('canvas');
    
    // Test keyboard events
    const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    canvas.dispatchEvent(keydownEvent);
    
    // Should have focus indicator or announce data point
    expect(chartComponent.currentFocus).toBeDefined();
  });

  it('should respect color contrast requirements', () => {
    expect(chartComponent).toBeDefined();
    
    const defaultColors = chartComponent.getDefaultColors();
    
    // Colors should meet WCAG contrast requirements
    expect(defaultColors).toEqual(expect.arrayContaining([
      expect.stringMatching(/#[0-9a-fA-F]{6}/) // Valid hex colors
    ]));
    
    // Should provide high contrast mode
    chartComponent.setHighContrast(true);
    const highContrastColors = chartComponent.getColors();
    expect(highContrastColors).not.toEqual(defaultColors);
  });

  it('should handle empty data gracefully', async () => {
    expect(chartComponent).toBeDefined();
    
    await chartComponent.renderDaily([]);
    
    // Should show "No data available" message
    const noDataElement = mockContainer.querySelector('.no-data-message');
    expect(noDataElement).toBeDefined();
    expect(noDataElement.textContent).toContain('No data available');
  });

  it('should validate data format before rendering', async () => {
    expect(chartComponent).toBeDefined();
    
    // Invalid data format
    const invalidData = [
      { invalid: 'structure' },
      { name: 'Valid', daily_kwh: 'invalid_number' }
    ];
    
    await expect(chartComponent.renderDaily(invalidData)).rejects.toMatchObject({
      error: 'VALIDATION_ERROR',
      message: expect.stringContaining('Invalid data format')
    });
  });

  it('should render within performance requirements', async () => {
    expect(chartComponent).toBeDefined();
    
    // Large dataset to test performance
    const largeData = Array.from({ length: 50 }, (_, i) => ({
      name: `Device ${i}`,
      daily_kwh: Math.random() * 10
    }));
    
    const startTime = performance.now();
    await chartComponent.renderDaily(largeData);
    const endTime = performance.now();
    
    // Per constitution: <100ms UI feedback requirement
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should support responsive design', () => {
    expect(chartComponent).toBeDefined();
    
    // Test different container sizes
    mockContainer.style.width = '300px';
    chartComponent.resize();
    
    expect(chartComponent.chart.options.responsive).toBe(true);
    expect(chartComponent.chart.options.maintainAspectRatio).toBe(false);
  });

  it('should export chart data and image', async () => {
    expect(chartComponent).toBeDefined();
    
    const testData = [
      { name: 'Test Device', daily_kwh: 2.0 }
    ];
    
    await chartComponent.renderDaily(testData);
    
    // Export as image
    const imageData = chartComponent.exportAsImage('png');
    expect(imageData).toMatch(/^data:image\/png;base64,/);
    
    // Export data as CSV
    const csvData = chartComponent.exportAsCSV();
    expect(csvData).toContain('Name,Daily Consumption (kWh)');
    expect(csvData).toContain('Test Device,2.0');
  });

  it('should handle chart.js errors gracefully', async () => {
    expect(chartComponent).toBeDefined();
    
    // Simulate Chart.js error
    const originalChart = chartComponent.chart;
    chartComponent.chart = null;
    
    await expect(chartComponent.renderDaily([])).rejects.toMatchObject({
      error: 'CHART_ERROR',
      message: expect.stringContaining('Chart initialization failed')
    });
    
    // Should recover gracefully
    chartComponent.chart = originalChart;
  });
});