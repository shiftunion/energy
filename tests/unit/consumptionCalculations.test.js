import { describe, it, expect } from 'vitest';

// Function to calculate daily kWh from watts and hours
const calculateDailyKWh = (watts, hours) => (watts * hours) / 1000;

// Function to estimate monthly consumption
const estimateMonthlyConsumption = (dailyKWh) => dailyKWh * 30;

// Function to calculate cost
const calculateCost = (kWh, rate) => kWh * rate;

// Function to calculate total consumption of multiple appliances
const totalConsumption = (appliances) => appliances.reduce((total, { watts, hours }) => total + calculateDailyKWh(watts, hours), 0);

// Unit tests
describe('Energy Consumption Calculations', () => {
    describe('Daily kWh Calculation', () => {
        it('should calculate daily kWh correctly for given watts and hours', () => {
            expect(calculateDailyKWh(1000, 5)).toBe(5);
            expect(calculateDailyKWh(500, 2)).toBe(1);
        });

        it('should return 0 for 0 watts or 0 hours', () => {
            expect(calculateDailyKWh(0, 5)).toBe(0);
            expect(calculateDailyKWh(1000, 0)).toBe(0);
        });
    });

    describe('Monthly Consumption Estimation', () => {
        it('should estimate monthly consumption based on daily kWh', () => {
            expect(estimateMonthlyConsumption(5)).toBe(150);
            expect(estimateMonthlyConsumption(0)).toBe(0);
        });
    });

    describe('Cost Calculation', () => {
        it('should calculate cost based on kWh and rate', () => {
            expect(calculateCost(5, 0.12)).toBe(0.6);
            expect(calculateCost(0, 0.12)).toBe(0);
        });
    });

    describe('Total Consumption for Multiple Appliances', () => {
        it('should calculate total consumption correctly for multiple appliances', () => {
            const appliances = [
                { watts: 1000, hours: 5 },
                { watts: 500, hours: 2 },
            ];
            expect(totalConsumption(appliances)).toBe(6);
        });

        it('should return 0 for empty appliance list', () => {
            expect(totalConsumption([])).toBe(0);
        });
    });
});
