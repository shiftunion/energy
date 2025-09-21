# Appliance API Contract

**Version**: 1.0  
**Generated**: 2025-09-21  
**Type**: Client-side JavaScript API

## Overview
This contract defines the JavaScript API for managing household appliances in the power consumption estimator. All operations are client-side using SQLite via sql.js.

## API Methods

### POST /appliances (createAppliance)
Create a new appliance entry.

**JavaScript Function**: `applianceService.create(appliance)`

**Request Body**:
```javascript
{
  name: string,           // Required: 1-100 characters
  power_watts: number,    // Required: 0.1-10000 watts
  daily_hours: number,    // Required: 0-24 hours
  usage_days: number[],   // Required: array of 0-6 (Sunday=0)
  standby_watts?: number  // Optional: 0-1000 watts, default 0
}
```

**Response**:
```javascript
{
  id: number,
  name: string,
  power_watts: number,
  daily_hours: number,
  usage_days: number[],
  standby_watts: number,
  created_at: string,     // ISO 8601 timestamp
  updated_at: string      // ISO 8601 timestamp
}
```

**Validation Rules**:
- `name`: Must be 1-100 characters, sanitized for XSS
- `power_watts`: Must be 0.1-10000 (reasonable household appliance range)
- `daily_hours`: Must be 0-24
- `usage_days`: Must contain at least one day (0-6)
- `standby_watts`: Must be 0-1000 if provided

**Error Responses**:
```javascript
// Validation Error
{
  error: "VALIDATION_ERROR",
  message: "Invalid power consumption value",
  field: "power_watts",
  value: -5
}

// Database Error
{
  error: "DATABASE_ERROR", 
  message: "Failed to save appliance",
  details: "SQLite error details"
}
```

### GET /appliances (getAllAppliances)
Retrieve all appliances with current consumption estimates.

**JavaScript Function**: `applianceService.getAll()`

**Response**:
```javascript
{
  appliances: [
    {
      id: number,
      name: string,
      power_watts: number,
      daily_hours: number,
      usage_days: number[],
      standby_watts: number,
      created_at: string,
      updated_at: string,
      consumption_estimates: {
        daily_kwh: number,
        weekly_kwh: number,
        monthly_kwh: number
      }
    }
  ],
  total_consumption: {
    daily_kwh: number,
    weekly_kwh: number,
    monthly_kwh: number
  }
}
```

### GET /appliances/:id (getAppliance)
Retrieve specific appliance by ID.

**JavaScript Function**: `applianceService.getById(id)`

**Parameters**:
- `id` (number): Appliance ID

**Response**: Same as single appliance object from getAll()

**Error Responses**:
```javascript
{
  error: "NOT_FOUND",
  message: "Appliance not found",
  id: 123
}
```

### PUT /appliances/:id (updateAppliance)
Update existing appliance.

**JavaScript Function**: `applianceService.update(id, updates)`

**Request Body**: Same as createAppliance (all fields optional except at least one must be provided)

**Response**: Updated appliance object

**Validation**: Same rules as createAppliance

### DELETE /appliances/:id (deleteAppliance)
Delete appliance and associated consumption data.

**JavaScript Function**: `applianceService.delete(id)`

**Response**:
```javascript
{
  success: true,
  deleted_id: number,
  message: "Appliance deleted successfully"
}
```

## Consumption Calculation API

### GET /consumption/estimates (getConsumptionEstimates)
Calculate consumption estimates for all appliances.

**JavaScript Function**: `consumptionService.calculateEstimates(appliances?, period?)`

**Parameters**:
- `appliances` (optional): Array of appliance IDs to calculate
- `period` (optional): 'daily' | 'weekly' | 'monthly' | 'all'

**Response**:
```javascript
{
  estimates: [
    {
      appliance_id: number,
      appliance_name: string,
      period_type: string,
      consumption_kwh: number,
      cost_estimate: number,
      calculation_timestamp: string
    }
  ],
  totals: {
    daily_kwh: number,
    weekly_kwh: number, 
    monthly_kwh: number,
    daily_cost: number,
    weekly_cost: number,
    monthly_cost: number
  }
}
```

### GET /consumption/forecast (getWeeklyForecast)
Generate 7-day consumption forecast.

**JavaScript Function**: `consumptionService.generateForecast(startDate?)`

**Parameters**:
- `startDate` (optional): ISO date string, defaults to today

**Response**:
```javascript
{
  forecast_date: string,
  daily_projections: [
    {
      date: string,           // ISO date
      day_of_week: number,    // 0-6
      total_kwh: number,
      estimated_cost: number,
      appliance_breakdown: [
        {
          appliance_id: number,
          appliance_name: string,
          consumption_kwh: number
        }
      ]
    }
  ],
  total_weekly_kwh: number,
  total_estimated_cost: number
}
```

## Settings API

### GET /settings (getSettings)
Retrieve current application settings.

**JavaScript Function**: `settingsService.getAll()`

**Response**:
```javascript
{
  rate_per_kwh: number,
  currency: string,
  time_of_use_enabled: boolean,
  peak_rate?: number,
  off_peak_rate?: number
}
```

### PUT /settings (updateSettings)  
Update application settings.

**JavaScript Function**: `settingsService.update(settings)`

**Request Body**:
```javascript
{
  rate_per_kwh?: number,      // 0.01-1.00
  currency?: string,          // ISO currency code
  time_of_use_enabled?: boolean,
  peak_rate?: number,
  off_peak_rate?: number
}
```

**Response**: Updated settings object

## Error Handling

### Common Error Types
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Requested resource doesn't exist  
- `DATABASE_ERROR`: SQLite operation failed
- `CALCULATION_ERROR`: Consumption calculation failed

### Error Response Format
```javascript
{
  error: string,        // Error type
  message: string,      // Human-readable message
  field?: string,       // Field that caused validation error
  value?: any,          // Invalid value that was provided
  details?: string      // Technical details for debugging
}
```

## Performance Requirements
- All operations must complete within 100ms
- Database queries must be optimized with appropriate indexes
- Calculation operations must handle up to 100 appliances efficiently
- Real-time updates must not block UI interactions

## Accessibility Requirements
- All API responses must include data needed for screen reader announcements
- Error messages must be descriptive and actionable
- Calculation results must be provided in formats suitable for assistive technologies