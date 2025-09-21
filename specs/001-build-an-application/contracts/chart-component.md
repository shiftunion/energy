# Chart Visualization Contract

**Version**: 1.0  
**Generated**: 2025-09-21  
**Type**: Client-side Chart Component API

## Overview
This contract defines the interface for the interactive 7-day power consumption chart component. The chart displays consumption forecasts with appliance breakdowns and accessibility features.

## Chart Component API

### ChartComponent.initialize(container, options)
Initialize the chart in a DOM container.

**Parameters**:
```javascript
{
  container: HTMLElement,     // DOM element to render chart
  options: {
    width?: number,           // Chart width in pixels
    height?: number,          // Chart height in pixels  
    accessibility: boolean,   // Enable accessibility features
    theme?: 'light' | 'dark', // Visual theme
    responsive: boolean       // Enable responsive behavior
  }
}
```

**Response**: Chart instance object

### ChartComponent.updateData(chartData)
Update chart with new consumption data.

**Data Format**:
```javascript
{
  labels: string[],           // Day labels ["Mon", "Tue", ...]
  datasets: [
    {
      label: string,          // "Total Consumption"
      data: number[],         // Daily kWh values [3.2, 4.1, ...]
      backgroundColor: string,
      borderColor: string,
      breakdown: [            // Appliance breakdown for each day
        [
          {
            appliance: string,     // Appliance name
            consumption: number,   // kWh for this appliance
            percentage: number     // % of total for this day
          }
        ]
      ]
    }
  ]
}
```

**Performance Requirements**:
- Chart update must complete within 50ms
- Smooth animations for data transitions
- Efficient rendering for up to 100 appliances per day

### ChartComponent.setInteractionCallbacks(callbacks)
Configure chart interaction handlers.

**Callbacks**:
```javascript
{
  onHover: (dataPoint, event) => {
    // dataPoint: {day, totalKwh, appliances[]}
    // Display tooltip with breakdown
  },
  
  onClick: (dataPoint, event) => {
    // Navigate to detailed view or edit appliances
  },
  
  onKeyboardNavigation: (direction, currentPoint) => {
    // Handle arrow key navigation
    // direction: 'left' | 'right' | 'up' | 'down'
  }
}
```

## Accessibility Features

### Screen Reader Support
Chart must provide alternative data presentation:

```javascript
// ARIA live region updates
chartComponent.announceDataChange(newData) => {
  // Generate screen reader announcement:
  // "Chart updated. Monday: 3.2 kilowatt hours. 
  //  Tuesday: 4.1 kilowatt hours. Weekly total: 24.8 kilowatt hours."
}
```

### Keyboard Navigation
- Tab: Focus chart area
- Arrow keys: Navigate between data points  
- Enter/Space: Activate data point for details
- Escape: Exit chart focus

### Alternative Data Display
```javascript
chartComponent.getDataTable() => {
  // Return HTML table element with same data
  // For users who prefer tabular format
}

chartComponent.getTextSummary() => {
  // Return descriptive text of chart data
  // "Weekly forecast shows highest consumption on Wednesday..."
}
```

## Tooltip Contract

### Hover Tooltip Display
**Content Structure**:
```javascript
{
  day: string,                    // "Monday, Sept 23"
  totalConsumption: {
    value: number,                // 4.2
    unit: string,                 // "kWh"
    cost: number                  // 0.50
  },
  applianceBreakdown: [
    {
      name: string,               // "Refrigerator"
      consumption: number,        // 2.1
      percentage: number,         // 50
      cost: number               // 0.25
    }
  ],
  weeklyComparison: {
    averageDay: number,          // 3.8 kWh
    trend: 'higher' | 'lower' | 'average'
  }
}
```

**Positioning Rules**:
- Tooltip appears above data point when space available
- Falls back to below when near top edge
- Horizontally centered on data point
- Never extends beyond chart container

## Chart Configuration

### Visual Styling
```javascript
{
  colors: {
    primary: '#2563eb',        // Main bar color
    hover: '#1d4ed8',          // Hover state
    accent: '#10b981',         // Highlight color
    text: '#374151',           // Text color
    grid: '#e5e7eb'            // Grid lines
  },
  
  typography: {
    fontFamily: 'system-ui, sans-serif',
    fontSize: {
      title: 16,
      labels: 12,
      values: 14
    }
  },
  
  accessibility: {
    highContrast: boolean,     // High contrast mode
    reducedMotion: boolean,    // Respect prefers-reduced-motion
    focusIndicator: string     // Focus ring style
  }
}
```

### Responsive Behavior
- Container width < 600px: Stack labels, reduce font size
- Container width < 400px: Show abbreviated day names (M, T, W...)
- Container height < 300px: Reduce padding, compact layout
- Touch devices: Increase touch target size to 44px minimum

## Data Validation

### Input Validation
```javascript
validateChartData(data) => {
  // Validate required fields exist
  // Check data types are correct
  // Ensure arrays have consistent length
  // Verify numerical values are reasonable
  // Return validation result with errors
}
```

### Error States
```javascript
// No data available
chartComponent.showEmptyState() => {
  // Display message: "Add appliances to see consumption forecast"
  // Include call-to-action button
}

// Data loading error  
chartComponent.showErrorState(error) => {
  // Display user-friendly error message
  // Provide retry action
  // Log technical details for debugging
}

// Calculation error
chartComponent.showCalculationError(details) => {
  // Show partial data if available
  // Indicate which calculations failed
  // Provide manual calculation option
}
```

## Performance Monitoring

### Metrics to Track
- Chart render time (target: <50ms)
- Data update time (target: <20ms)
- Memory usage (target: <5MB for chart data)
- Animation frame rate (target: 60fps)

### Performance Optimization
- Use requestAnimationFrame for smooth animations
- Implement virtual scrolling for large datasets
- Cache rendered chart elements
- Debounce rapid data updates
- Use CSS transforms for better performance

## Integration Requirements

### DOM Structure
```html
<div class="chart-container" role="img" aria-labelledby="chart-title">
  <h3 id="chart-title">Weekly Power Consumption Forecast</h3>
  
  <div class="chart-canvas-wrapper">
    <canvas id="consumption-chart" 
            role="img" 
            aria-describedby="chart-description">
    </canvas>
  </div>
  
  <div id="chart-description" class="sr-only">
    <!-- Auto-generated description of chart data -->
  </div>
  
  <table class="chart-data-table sr-only" aria-label="Chart data in table format">
    <!-- Alternative table representation -->
  </table>
  
  <div class="chart-controls" role="toolbar">
    <button type="button" aria-label="Show data as table">Table View</button>
    <button type="button" aria-label="Export chart data">Export</button>
  </div>
</div>
```

### CSS Classes Required
- `.chart-container`: Main container styling
- `.chart-canvas-wrapper`: Canvas positioning
- `.chart-tooltip`: Tooltip styling
- `.chart-loading`: Loading state
- `.chart-error`: Error state styling
- `.sr-only`: Screen reader only content