/**
 * ConsumptionService - Calculates energy consumption estimates for appliances
 * Implements the contract defined in tests/contract/test_consumption_calculator.js
 */

import { getDatabase } from '../utils/test-setup.js';
import { ApplianceService } from './ApplianceService.js';

export class ConsumptionService {
  constructor() {
    this.database = null;
    this.applianceService = null;
  }

  /**
   * Initialize the service with database connection
   */
  async initialize() {
    this.database = await getDatabase();
    await this.database.initialize();
    
    this.applianceService = new ApplianceService();
    await this.applianceService.initialize();
  }

  /**
   * Calculate daily consumption for a single appliance
   * @param {number} applianceId - The appliance ID
   * @returns {Object} Daily consumption data
   */
  async calculateDaily(applianceId) {
    try {
      // Get appliance details
      const appliance = await this.applianceService.getById(applianceId);
      
      // Calculate daily consumption
      const activeKwh = (appliance.power_watts * appliance.daily_hours) / 1000;
      const standbyWatts = appliance.standby_watts || 0;
      const standbyHours = 24 - appliance.daily_hours;
      const standbyKwh = (standbyWatts * standbyHours) / 1000;
      const dailyKwh = activeKwh + standbyKwh;

      return {
        appliance_id: applianceId,
        daily_kwh: parseFloat(dailyKwh.toFixed(1)),
        calculation: {
          power_watts: appliance.power_watts,
          daily_hours: appliance.daily_hours,
          formula: `${appliance.power_watts}W × ${appliance.daily_hours}h ÷ 1000 = ${dailyKwh.toFixed(1)} kWh`
        }
      };
    } catch (error) {
      if (error.error === 'NOT_FOUND') {
        throw error;
      }
      throw {
        error: 'CALCULATION_ERROR',
        message: 'Failed to calculate daily consumption',
        details: error.message
      };
    }
  }

  /**
   * Calculate weekly consumption for a single appliance
   * @param {number} applianceId - The appliance ID
   * @returns {Object} Weekly consumption data
   */
  async calculateWeekly(applianceId) {
    try {
      // Get appliance details
      const appliance = await this.applianceService.getById(applianceId);
      
      // Calculate daily consumption per usage day
      const activeKwh = (appliance.power_watts * appliance.daily_hours) / 1000;
      const standbyWatts = appliance.standby_watts || 0;
      const standbyHours = 24 - appliance.daily_hours;
      const standbyKwh = (standbyWatts * standbyHours) / 1000;
      const dailyKwh = activeKwh + standbyKwh;
      
      // Calculate weekly consumption based on usage days
      const usageDays = appliance.usage_days.length;
      const weeklyKwh = dailyKwh * usageDays;

      return {
        appliance_id: applianceId,
        weekly_kwh: parseFloat(weeklyKwh.toFixed(1)),
        usage_days: usageDays,
        calculation: {
          daily_kwh: parseFloat(dailyKwh.toFixed(1)),
          active_days: usageDays,
          formula: `${dailyKwh.toFixed(1)} kWh/day × ${usageDays} days = ${weeklyKwh.toFixed(1)} kWh`
        }
      };
    } catch (error) {
      if (error.error === 'NOT_FOUND') {
        throw error;
      }
      throw {
        error: 'CALCULATION_ERROR',
        message: 'Failed to calculate weekly consumption',
        details: error.message
      };
    }
  }

  /**
   * Calculate monthly consumption for a single appliance (30 day estimate)
   * @param {number} applianceId - The appliance ID
   * @returns {Object} Monthly consumption data
   */
  async calculateMonthly(applianceId) {
    try {
      // Get appliance details
      const appliance = await this.applianceService.getById(applianceId);
      
      // Calculate daily consumption per usage day
      const activeKwh = (appliance.power_watts * appliance.daily_hours) / 1000;
      const standbyWatts = appliance.standby_watts || 0;
      const standbyHours = 24 - appliance.daily_hours;
      const standbyKwh = (standbyWatts * standbyHours) / 1000;
      const dailyKwh = activeKwh + standbyKwh;
      
      // Calculate monthly consumption assuming 30 days
      const daysPerMonth = 30;
      const activeDaysPerWeek = appliance.usage_days.length;
      const weeksPerMonth = daysPerMonth / 7;
      const activeDaysPerMonth = (activeDaysPerWeek / 7) * daysPerMonth;
      const monthlyKwh = dailyKwh * activeDaysPerMonth;

      return {
        appliance_id: applianceId,
        monthly_kwh: parseFloat(monthlyKwh.toFixed(1)),
        days_per_month: daysPerMonth,
        calculation: {
          daily_kwh: parseFloat(dailyKwh.toFixed(1)),
          active_days_per_week: activeDaysPerWeek,
          weeks_per_month: parseFloat(weeksPerMonth.toFixed(2)),
          formula: `${dailyKwh.toFixed(1)} kWh/day × ${daysPerMonth} days = ${monthlyKwh.toFixed(1)} kWh`
        }
      };
    } catch (error) {
      if (error.error === 'NOT_FOUND') {
        throw error;
      }
      throw {
        error: 'CALCULATION_ERROR',
        message: 'Failed to calculate monthly consumption',
        details: error.message
      };
    }
  }

  /**
   * Calculate total daily consumption for all appliances
   * @returns {Object} Total consumption data
   */
  async calculateTotalDaily() {
    try {
      // Get all appliances
      const allAppliances = await this.applianceService.getAll();
      
      let totalDailyKwh = 0;
      const applianceBreakdown = [];

      for (const appliance of allAppliances.appliances) {
        // Calculate daily consumption for each appliance
        const activeKwh = (appliance.power_watts * appliance.daily_hours) / 1000;
        const standbyWatts = appliance.standby_watts || 0;
        const standbyHours = 24 - appliance.daily_hours;
        const standbyKwh = (standbyWatts * standbyHours) / 1000;
        const dailyKwh = activeKwh + standbyKwh;
        
        totalDailyKwh += dailyKwh;
        applianceBreakdown.push({
          id: appliance.id,
          name: appliance.name,
          daily_kwh: parseFloat(dailyKwh.toFixed(1))
        });
      }

      return {
        total_daily_kwh: parseFloat(totalDailyKwh.toFixed(1)),
        appliances: applianceBreakdown,
        breakdown: applianceBreakdown
      };
    } catch (error) {
      throw {
        error: 'CALCULATION_ERROR',
        message: 'Failed to calculate total daily consumption',
        details: error.message
      };
    }
  }

  /**
   * Calculate cost estimates for an appliance
   * @param {number} applianceId - The appliance ID
   * @param {Object} options - Cost calculation options
   * @returns {Object} Cost estimate data
   */
  async calculateCost(applianceId, options) {
    try {
      // Validate rate
      if (!options.rate_per_kwh || options.rate_per_kwh <= 0) {
        throw {
          error: 'VALIDATION_ERROR',
          field: 'rate_per_kwh',
          message: 'Rate per kWh must be positive'
        };
      }

      // Get consumption calculations
      const dailyCalc = await this.calculateDaily(applianceId);
      const weeklyCalc = await this.calculateWeekly(applianceId);
      const monthlyCalc = await this.calculateMonthly(applianceId);

      // Calculate costs
      const dailyCost = dailyCalc.daily_kwh * options.rate_per_kwh;
      const weeklyCost = weeklyCalc.weekly_kwh * options.rate_per_kwh;
      const monthlyCost = monthlyCalc.monthly_kwh * options.rate_per_kwh;

      return {
        appliance_id: applianceId,
        daily_cost: parseFloat(dailyCost.toFixed(2)),
        weekly_cost: parseFloat(weeklyCost.toFixed(2)),
        monthly_cost: parseFloat(monthlyCost.toFixed(2)),
        rate_per_kwh: options.rate_per_kwh
      };
    } catch (error) {
      if (error.error === 'NOT_FOUND' || error.error === 'VALIDATION_ERROR') {
        throw error;
      }
      throw {
        error: 'CALCULATION_ERROR',
        message: 'Failed to calculate cost estimates',
        details: error.message
      };
    }
  }
}