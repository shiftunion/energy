# Data Model: Household Power Consumption Estimator

**Generated**: 2025-09-21  
**For Feature**: 001-build-an-application

## Core Entities

### Appliance
Represents a household electrical device with power consumption characteristics.

**Attributes**:
- `id` (Integer, Primary Key): Unique identifier for the appliance
- `name` (String, Required): User-friendly name for the appliance (e.g., "Kitchen Refrigerator")
- `power_watts` (Float, Required): Average power consumption in watts during active use
- `daily_hours` (Float, Required): Hours per day the appliance is actively used (0.0-24.0)
- `usage_days` (JSON Array, Required): Days of the week when appliance is used (0=Sunday, 6=Saturday)
- `standby_watts` (Float, Optional): Power consumption when in standby mode (default: 0)
- `created_at` (DateTime): Timestamp when appliance was added
- `updated_at` (DateTime): Timestamp when appliance was last modified

**Validation Rules**:
- `name`: 1-100 characters, no special characters that could cause XSS
- `power_watts`: 0.1-10000 watts (reasonable range for household appliances)
- `daily_hours`: 0.0-24.0 hours
- `usage_days`: Array of integers 0-6, at least one day required
- `standby_watts`: 0.0-1000 watts

**Relationships**:
- One-to-many with ConsumptionEstimate (calculated values)
- One-to-many with ChartDataPoint (visualization data)

### UsageSchedule (Embedded in Appliance)
Represents when and how long an appliance operates.

**Properties**:
- `days_of_week` (Array): Which days the appliance is used
- `hours_per_day` (Float): Duration of daily usage
- `is_continuous` (Boolean): Whether appliance runs continuously (like refrigerators)

**Methods**:
- `getDailyConsumption()`: Calculate kWh consumption for a single day
- `getWeeklyConsumption()`: Calculate total weekly consumption
- `isActiveOnDay(dayOfWeek)`: Check if appliance is used on specific day

### ConsumptionEstimate (Calculated Entity)
Represents calculated energy consumption for specific time periods.

**Attributes**:
- `appliance_id` (Integer): Reference to appliance
- `period_type` (Enum): 'daily', 'weekly', 'monthly'
- `period_date` (Date): Start date for the calculation period
- `consumption_kwh` (Float): Total energy consumption in kilowatt-hours
- `cost_estimate` (Float, Optional): Estimated cost based on current rate
- `calculation_timestamp` (DateTime): When calculation was performed

**Methods**:
- `calculateForAppliance(appliance, periodType)`: Generate consumption estimate
- `aggregateByPeriod(appliances, period)`: Sum consumption across appliances

### RateSetting
Represents electricity pricing configuration for cost calculations.

**Attributes**:
- `rate_per_kwh` (Float): Cost per kilowatt-hour in local currency
- `currency` (String): Currency code (e.g., "USD", "EUR")
- `time_of_use_enabled` (Boolean): Whether to use time-of-use pricing
- `peak_rate` (Float, Optional): Peak hour rate if time-of-use enabled
- `off_peak_rate` (Float, Optional): Off-peak hour rate
- `updated_at` (DateTime): Last modification time

**Validation Rules**:
- `rate_per_kwh`: 0.01-1.00 (reasonable range per kWh)
- `currency`: Valid ISO currency code
- Peak/off-peak rates must be specified if time_of_use_enabled

### WeeklyForecast (Generated Entity)
Represents projected consumption for the next 7 days.

**Attributes**:
- `forecast_date` (Date): Date the forecast was generated
- `daily_projections` (Array): Array of 7 ChartDataPoint objects
- `total_weekly_kwh` (Float): Sum of all daily projections
- `estimated_cost` (Float): Total estimated cost for the week

**Methods**:
- `generateForecast(appliances, startDate)`: Create 7-day forecast
- `updateProjection(dayIndex, newValue)`: Modify specific day's projection

### ChartDataPoint (Visualization Entity)
Represents consumption data for a single day in chart visualization.

**Attributes**:
- `date` (Date): The date this data point represents
- `total_kwh` (Float): Total consumption for this day
- `appliance_breakdown` (Array): List of {appliance_name, consumption_kwh} objects
- `day_of_week` (Integer): Day index (0=Sunday, 6=Saturday)
- `is_projected` (Boolean): Whether this is historical or projected data

**Methods**:
- `getApplianceContribution(applianceName)`: Get specific appliance's consumption
- `formatForChart()`: Return data in format expected by Chart.js
- `getTooltipContent()`: Generate hover tooltip content

## Data Access Patterns

### Create Operations
- Add new appliance with validation
- Initialize default rate settings
- Generate consumption estimates on appliance creation

### Read Operations  
- List all appliances with current consumption estimates
- Get appliance details by ID
- Calculate consumption for date ranges
- Generate chart data for visualization

### Update Operations
- Modify appliance properties with recalculation
- Update rate settings with cost recalculation
- Bulk update consumption estimates when rates change

### Delete Operations
- Remove appliance and associated consumption data
- Cascade delete consumption estimates
- Update chart data after appliance removal

## Database Schema (SQLite)

```sql
-- Main appliances table
CREATE TABLE appliances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
    power_watts REAL NOT NULL CHECK(power_watts >= 0.1 AND power_watts <= 10000),
    daily_hours REAL NOT NULL CHECK(daily_hours >= 0 AND daily_hours <= 24),
    usage_days TEXT NOT NULL, -- JSON array: [0,1,2,3,4,5,6]
    standby_watts REAL DEFAULT 0 CHECK(standby_watts >= 0 AND standby_watts <= 1000),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings for rates and preferences
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_appliances_updated ON appliances(updated_at);
CREATE INDEX idx_settings_key ON settings(key);

-- Initial settings
INSERT INTO settings (key, value) VALUES 
    ('rate_per_kwh', '0.12'),
    ('currency', 'USD'),
    ('time_of_use_enabled', 'false');
```

## Validation and Error Handling

### Input Validation
- Client-side validation for immediate user feedback
- Server-side validation (in SQLite constraints) for data integrity
- Sanitization of all text inputs to prevent XSS

### Error Recovery
- Graceful handling of database connection issues
- Fallback calculations when database is unavailable
- User-friendly error messages with actionable guidance

### Data Integrity
- Foreign key constraints where applicable
- Check constraints for reasonable value ranges
- Transaction support for multi-table operations