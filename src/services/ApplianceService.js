/**
 * ApplianceService - Manages household appliances and their power consumption data
 * Implements the contract defined in specs/001-build-an-application/contracts/appliance-api.md
 */

import { getDatabase } from '../utils/test-setup.js';

export class ApplianceService {
  constructor() {
    this.database = null;
  }

  /**
   * Initialize the service with database connection
   */
  async initialize() {
    this.database = await getDatabase();
    await this.database.initialize();
  }

  /**
   * Validate appliance data according to contract specifications
   */
  _validateApplianceData(data, isUpdate = false) {
    const errors = [];

    // Name validation (required for create, optional for update)
    if (!isUpdate && (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0)) {
      errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
    }
    
    if (data.name && typeof data.name === 'string' && data.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Name must be 100 characters or less' });
    }

    // Power watts validation
    if (data.power_watts !== undefined) {
      if (typeof data.power_watts !== 'number' || isNaN(data.power_watts)) {
        errors.push({ field: 'power_watts', message: 'Power watts must be a valid number' });
      } else if (data.power_watts < 0.1 || data.power_watts > 10000) {
        errors.push({ field: 'power_watts', message: 'Power watts must be between 0.1 and 10000' });
      }
    } else if (!isUpdate) {
      errors.push({ field: 'power_watts', message: 'Power watts is required' });
    }

    // Daily hours validation
    if (data.daily_hours !== undefined) {
      if (typeof data.daily_hours !== 'number' || isNaN(data.daily_hours)) {
        errors.push({ field: 'daily_hours', message: 'Daily hours must be a valid number' });
      } else if (data.daily_hours < 0 || data.daily_hours > 24) {
        errors.push({ field: 'daily_hours', message: 'Daily hours must be between 0 and 24' });
      }
    } else if (!isUpdate) {
      errors.push({ field: 'daily_hours', message: 'Daily hours is required' });
    }

    // Usage days validation
    if (data.usage_days !== undefined) {
      if (!Array.isArray(data.usage_days)) {
        errors.push({ field: 'usage_days', message: 'Usage days must be an array' });
      } else if (data.usage_days.length === 0) {
        errors.push({ field: 'usage_days', message: 'At least one usage day must be specified' });
      } else {
        const invalidDays = data.usage_days.filter(day => 
          typeof day !== 'number' || day < 0 || day > 6
        );
        if (invalidDays.length > 0) {
          errors.push({ field: 'usage_days', message: 'Usage days must be numbers between 0 (Sunday) and 6 (Saturday)' });
        }
      }
    } else if (!isUpdate) {
      errors.push({ field: 'usage_days', message: 'Usage days are required' });
    }

    // For updates, ensure at least one field is being updated
    if (isUpdate) {
      const updateFields = ['name', 'power_watts', 'daily_hours', 'usage_days'];
      const hasUpdates = updateFields.some(field => data[field] !== undefined);
      if (!hasUpdates) {
        errors.push({ field: 'update', message: 'Update requires at least one field to be provided' });
      }
    }

    return errors;
  }

  /**
   * Sanitize text input to prevent XSS attacks
   * Removes script tags and other potentially dangerous content
   */
  _sanitizeText(text) {
    if (typeof text !== 'string') return text;
    
    return text
      // Remove script tags and their content completely
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove other potentially dangerous tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      // Remove javascript: and data: URLs
      .replace(/javascript:[^"']*/gi, '')
      .replace(/data:[^"']*/gi, '')
      // Escape remaining HTML special characters
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * Create a new appliance
   */
  async create(applianceData) {
    try {
      // Validate input data
      const validationErrors = this._validateApplianceData(applianceData);
      if (validationErrors.length > 0) {
        throw {
          error: 'VALIDATION_ERROR',
          field: validationErrors[0].field,
          message: validationErrors[0].message,
          details: validationErrors
        };
      }

      // Sanitize text inputs and set defaults
      const sanitizedData = {
        ...applianceData,
        name: this._sanitizeText(applianceData.name),
        standby_watts: applianceData.standby_watts || 0  // Default to 0
      };

      // Insert into database
      const now = new Date().toISOString();
      const usageDaysJson = JSON.stringify(sanitizedData.usage_days);
      
      const result = await this.database.run(`
        INSERT INTO appliances (name, power_watts, daily_hours, usage_days, standby_watts, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        sanitizedData.name,
        sanitizedData.power_watts,
        sanitizedData.daily_hours,
        usageDaysJson,
        sanitizedData.standby_watts,
        now,
        now
      ]);

      // Return the created appliance
      return {
        id: result.lastInsertRowid,
        name: sanitizedData.name,
        power_watts: sanitizedData.power_watts,
        daily_hours: sanitizedData.daily_hours,
        usage_days: sanitizedData.usage_days,
        standby_watts: sanitizedData.standby_watts,
        created_at: now,
        updated_at: now
      };

    } catch (error) {
      // Handle database errors
      if (error.error === 'VALIDATION_ERROR') {
        throw error;
      }
      
      throw {
        error: 'DATABASE_ERROR',
        message: 'Failed to create appliance',
        details: error.message
      };
    }
  }

  /**
   * Get appliance by ID
   */
  async getById(id) {
    try {
      // Validate ID
      if (id === undefined || id === null || id === '') {
        throw {
          error: 'VALIDATION_ERROR',
          field: 'id',
          message: 'ID is required'
        };
      }

      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw {
          error: 'VALIDATION_ERROR',
          field: 'id',
          message: 'ID must be numeric'
        };
      }

      // Query database
      const appliance = await this.database.query(`
        SELECT * FROM appliances WHERE id = ?
      `, [numericId]);

      if (!appliance || appliance.length === 0) {
        throw {
          error: 'NOT_FOUND',
          message: 'Appliance not found',
          id: numericId
        };
      }

      const result = appliance[0];
      
      // Parse usage_days JSON (handle both string and already parsed array)
      let usageDays;
      if (typeof result.usage_days === 'string') {
        usageDays = JSON.parse(result.usage_days);
      } else if (Array.isArray(result.usage_days)) {
        usageDays = result.usage_days;
      } else {
        throw new Error('Invalid usage_days format');
      }
      
      // Calculate consumption including standby power
      const activeKwh = (result.power_watts * result.daily_hours) / 1000;
      const standbyWatts = result.standby_watts || 0;
      const standbyHours = 24 - result.daily_hours;
      const standbyKwh = (standbyWatts * standbyHours) / 1000;
      const dailyKwh = activeKwh + standbyKwh;
      const weeklyKwh = dailyKwh * usageDays.length;
      const monthlyKwh = weeklyKwh * 4.33; // Average weeks per month

      return {
        id: result.id,
        name: result.name,
        power_watts: result.power_watts,
        daily_hours: result.daily_hours,
        usage_days: usageDays,
        standby_watts: result.standby_watts || 0,
        created_at: result.created_at,
        updated_at: result.updated_at,
        consumption_estimates: {
          daily_kwh: parseFloat(dailyKwh.toFixed(1)),
          weekly_kwh: parseFloat(weeklyKwh.toFixed(1)),
          monthly_kwh: parseFloat(monthlyKwh.toFixed(1))
        }
      };

    } catch (error) {
      if (error.error) {
        throw error;
      }
      
      throw {
        error: 'DATABASE_ERROR',
        message: 'Failed to retrieve appliance',
        details: error.message
      };
    }
  }

  /**
   * Get all appliances with consumption estimates
   */
  async getAll() {
    try {
      const appliances = await this.database.query(`
        SELECT * FROM appliances ORDER BY created_at DESC
      `);

      let totalDailyKwh = 0;
      let totalWeeklyKwh = 0;
      let totalMonthlyKwh = 0;
      
      const appliancesWithEstimates = appliances.map(appliance => {
        // Parse usage_days JSON (handle both string and already parsed array)
        let usageDays;
        if (typeof appliance.usage_days === 'string') {
          usageDays = JSON.parse(appliance.usage_days);
        } else if (Array.isArray(appliance.usage_days)) {
          usageDays = appliance.usage_days;
        } else {
          throw new Error('Invalid usage_days format');
        }
        
        // Calculate consumption including standby power
        const activeKwh = (appliance.power_watts * appliance.daily_hours) / 1000;
        const standbyWatts = appliance.standby_watts || 0;
        const standbyHours = 24 - appliance.daily_hours;
        const standbyKwh = (standbyWatts * standbyHours) / 1000;
        const dailyKwh = activeKwh + standbyKwh;
        const weeklyKwh = dailyKwh * usageDays.length;
        const monthlyKwh = weeklyKwh * 4.33; // Average weeks per month
        
        // Sum up totals correctly
        totalDailyKwh += dailyKwh;
        totalWeeklyKwh += weeklyKwh;
        totalMonthlyKwh += monthlyKwh;

        return {
          id: appliance.id,
          name: appliance.name,
          power_watts: appliance.power_watts,
          daily_hours: appliance.daily_hours,
          usage_days: usageDays,
          standby_watts: appliance.standby_watts || 0,
          created_at: appliance.created_at,
          updated_at: appliance.updated_at,
          consumption_estimates: {
            daily_kwh: parseFloat(dailyKwh.toFixed(1)),
            weekly_kwh: parseFloat(weeklyKwh.toFixed(1)),
            monthly_kwh: parseFloat(monthlyKwh.toFixed(1))
          }
        };
      });

      return {
        appliances: appliancesWithEstimates,
        total_consumption: {
          daily_kwh: parseFloat(totalDailyKwh.toFixed(1)),
          weekly_kwh: parseFloat(totalWeeklyKwh.toFixed(1)),
          monthly_kwh: parseFloat(totalMonthlyKwh.toFixed(1))
        }
      };

    } catch (error) {
      throw {
        error: 'DATABASE_ERROR',
        message: 'Failed to retrieve appliances',
        details: error.message
      };
    }
  }

  /**
   * Update an existing appliance
   */
  async update(id, updateData) {
    try {
      // Validate ID
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw {
          error: 'VALIDATION_ERROR',
          field: 'id',
          message: 'ID must be numeric'
        };
      }

      // Validate update data
      const validationErrors = this._validateApplianceData(updateData, true);
      if (validationErrors.length > 0) {
        throw {
          error: 'VALIDATION_ERROR',
          field: validationErrors[0].field,
          message: validationErrors[0].message
        };
      }

      // Check if appliance exists
      const existing = await this.getById(numericId);

      // Sanitize text inputs
      const sanitizedData = { ...updateData };
      if (updateData.name !== undefined) {
        sanitizedData.name = this._sanitizeText(updateData.name);
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      if (sanitizedData.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(sanitizedData.name);
      }
      
      if (sanitizedData.power_watts !== undefined) {
        updateFields.push('power_watts = ?');
        updateValues.push(sanitizedData.power_watts);
      }
      
      if (sanitizedData.daily_hours !== undefined) {
        updateFields.push('daily_hours = ?');
        updateValues.push(sanitizedData.daily_hours);
      }
      
      if (sanitizedData.usage_days !== undefined) {
        updateFields.push('usage_days = ?');
        updateValues.push(JSON.stringify(sanitizedData.usage_days));
      }
      
      if (sanitizedData.standby_watts !== undefined) {
        updateFields.push('standby_watts = ?');
        updateValues.push(sanitizedData.standby_watts);
      }

      // Add updated_at timestamp
      updateFields.push('updated_at = ?');
      const now = new Date().toISOString();
      updateValues.push(now);
      updateValues.push(numericId);

      // Execute update
      await this.database.run(`
        UPDATE appliances SET ${updateFields.join(', ')} WHERE id = ?
      `, updateValues);

      // Return updated appliance
      return await this.getById(numericId);

    } catch (error) {
      if (error.error) {
        throw error;
      }
      
      throw {
        error: 'DATABASE_ERROR',
        message: 'Failed to update appliance',
        details: error.message
      };
    }
  }

  /**
   * Delete an appliance
   */
  async delete(id) {
    try {
      // Validate ID
      if (id === undefined || id === null || id === '') {
        throw {
          error: 'VALIDATION_ERROR',
          field: 'id',
          message: 'ID is required'
        };
      }

      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw {
          error: 'VALIDATION_ERROR',
          field: 'id',
          message: 'ID must be numeric'
        };
      }

      // Check if appliance exists
      await this.getById(numericId);

      // Delete the appliance
      const result = await this.database.run(`
        DELETE FROM appliances WHERE id = ?
      `, [numericId]);

      if (result.changes === 0) {
        throw {
          error: 'NOT_FOUND',
          message: 'Appliance not found',
          id: numericId
        };
      }

      return {
        success: true,
        id: numericId,
        message: 'Appliance deleted successfully'
      };

    } catch (error) {
      if (error.error) {
        throw error;
      }
      
      throw {
        error: 'DATABASE_ERROR',
        message: 'Failed to delete appliance',
        details: error.message
      };
    }
  }
}