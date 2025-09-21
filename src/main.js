/**
 * Main application entry point
 * Initializes database and application components
 */

console.log('🟢 main.js module loaded');

import database from './models/database.js';
import { ApplianceService } from './services/ApplianceService.js';
import { ConsumptionService } from './services/ConsumptionService.js';
import { EnergyChart } from './chart/EnergyChart.js';

// Application services
let applianceService;
let consumptionService;
let energyChart;

/**
 * Initialize the application
 */
async function initializeApp() {
  console.log('🔥 initializeApp function called');
  const loadingElement = document.querySelector('.loading');
  console.log('🔍 Loading element found:', !!loadingElement);
  
  try {
    console.log('🚀 Starting application initialization...');
    
    // Show initialization progress
    updateLoadingMessage('Initializing database...');
    
    // Initialize SQLite database
    console.log('📂 Initializing database...');
    await database.initialize();
    console.log('✅ Database initialized successfully');
    
    updateLoadingMessage('Initializing services...');
    
    // Initialize application services
    console.log('🔧 Initializing ApplianceService...');
    applianceService = new ApplianceService();
    await applianceService.initialize();
    console.log('✅ ApplianceService initialized');
    
    console.log('🔧 Initializing ConsumptionService...');
    consumptionService = new ConsumptionService();
    await consumptionService.initialize();
    console.log('✅ ConsumptionService initialized');
    
    updateLoadingMessage('Loading application...');
    
    // Create main application structure
    const appElement = document.getElementById('app');
    appElement.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>Household Power Consumption Estimator</h1>
          <p class="app-subtitle">Track and estimate your electrical power usage</p>
        </header>
        
        <main class="app-main" role="main">
          <div class="content-grid">
            <section class="appliances-section" aria-labelledby="appliances-heading">
              <h2 id="appliances-heading">Your Appliances</h2>
              <div id="appliance-form-container"></div>
              <div id="appliance-list-container"></div>
            </section>
            
            <section class="consumption-section" aria-labelledby="consumption-heading">
              <h2 id="consumption-heading">Power Consumption</h2>
              <div id="consumption-summary-container"></div>
            </section>
            
            <section class="chart-section" aria-labelledby="chart-heading">
              <h2 id="chart-heading">Energy Consumption Chart</h2>
              <div id="chart-controls">
                <button id="daily-view" class="chart-btn active">Daily</button>
                <button id="weekly-view" class="chart-btn">Weekly</button>
                <button id="pie-view" class="chart-btn">Breakdown</button>
              </div>
              <div id="chart-container"></div>
              <div id="consumption-summary">
                <div class="summary-item">
                  <span class="label">Daily Total:</span>
                  <span id="daily-total">0 kWh</span>
                </div>
                <div class="summary-item">
                  <span class="label">Monthly Estimate:</span>
                  <span id="monthly-total">0 kWh</span>
                </div>
                <div class="summary-item">
                  <span class="label">Estimated Cost:</span>
                  <span id="cost-estimate">$0.00</span>
                </div>
              </div>
            </section>
          </div>
        </main>
        
        <footer class="app-footer">
          <p>&copy; 2025 Household Power Estimator</p>
        </footer>
      </div>
    `;
    
    // Initialize chart component
    updateLoadingMessage('Setting up charts...');
    console.log('📊 Checking Chart.js availability...');
    
    if (typeof Chart === 'undefined') {
      throw new Error('Chart.js is not loaded. Please ensure Chart.js is included in the page.');
    }
    
    console.log('✅ Chart.js is available');
    const chartContainer = document.getElementById('chart-container');
    console.log('📊 Creating EnergyChart component...');
    energyChart = new EnergyChart(chartContainer);
    console.log('✅ EnergyChart component created');
    
    // Apply basic styles
    applyBaseStyles();
    
    // Initialize application components
    updateLoadingMessage('Setting up controls...');
    await initializeComponents();
    
    updateLoadingMessage('Application ready!');
    
    // Load initial data
    await loadApplianceData();
    
    // Hide loading indicator
    setTimeout(() => {
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
    }, 500);
    
    console.log('🎉 Application initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    updateLoadingMessage('Error loading application. Check console for details.');
    
    // Show error state after a short delay
    setTimeout(() => {
      if (loadingElement) {
        loadingElement.innerHTML = `
          <div style="text-align: center; padding: 2rem;">
            <h2 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h2>
            <p style="margin-bottom: 1rem;">Failed to initialize the application.</p>
            <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem;">Error: ${error.message}</p>
            <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
              Reload Application
            </button>
          </div>
        `;
      }
    }, 1000);
  }
}

/**
 * Initialize application components and event handlers
 */
async function initializeComponents() {
  // Initialize appliance form
  createApplianceForm();
  
  // Initialize chart controls
  initializeChartControls();
  
  // Initialize appliance list
  await refreshApplianceList();
}

/**
 * Create appliance form for adding new appliances
 */
function createApplianceForm() {
  const formContainer = document.getElementById('appliance-form-container');
  
  formContainer.innerHTML = `
    <form id="appliance-form" class="appliance-form">
      <h3>Add New Appliance</h3>
      <div class="form-grid">
        <div class="form-group">
          <label for="appliance-name">Name:</label>
          <input type="text" id="appliance-name" name="name" required placeholder="e.g. Refrigerator">
        </div>
        
        <div class="form-group">
          <label for="appliance-power">Power (Watts):</label>
          <input type="number" id="appliance-power" name="power_watts" min="0.1" max="10000" step="0.1" required placeholder="e.g. 150">
        </div>
        
        <div class="form-group">
          <label for="appliance-hours">Daily Hours:</label>
          <input type="number" id="appliance-hours" name="daily_hours" min="0" max="24" step="0.1" required placeholder="e.g. 8">
        </div>
        
        <div class="form-group full-width">
          <label>Usage Days:</label>
          <div class="usage-days">
            <label><input type="checkbox" name="usage_days" value="0"> Sun</label>
            <label><input type="checkbox" name="usage_days" value="1"> Mon</label>
            <label><input type="checkbox" name="usage_days" value="2"> Tue</label>
            <label><input type="checkbox" name="usage_days" value="3"> Wed</label>
            <label><input type="checkbox" name="usage_days" value="4"> Thu</label>
            <label><input type="checkbox" name="usage_days" value="5"> Fri</label>
            <label><input type="checkbox" name="usage_days" value="6"> Sat</label>
          </div>
        </div>
      </div>
      
      <button type="submit" class="add-btn">Add Appliance</button>
    </form>
  `;
  
  // Add form event handler
  document.getElementById('appliance-form').addEventListener('submit', handleApplianceSubmit);
}

/**
 * Initialize chart control buttons
 */
function initializeChartControls() {
  document.getElementById('daily-view').addEventListener('click', () => switchChartView('daily'));
  document.getElementById('weekly-view').addEventListener('click', () => switchChartView('weekly'));
  document.getElementById('pie-view').addEventListener('click', () => switchChartView('pie'));
}

/**
 * Handle appliance form submission
 */
async function handleApplianceSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const usageDays = Array.from(formData.getAll('usage_days')).map(Number);
  
  if (usageDays.length === 0) {
    alert('Please select at least one usage day');
    return;
  }
  
  const applianceData = {
    name: formData.get('name'),
    power_watts: Number(formData.get('power_watts')),
    daily_hours: Number(formData.get('daily_hours')),
    usage_days: usageDays
  };
  
  try {
    await applianceService.create(applianceData);
    event.target.reset();
    await refreshApplianceList();
    await updateConsumptionData();
    showMessage('Appliance added successfully!', 'success');
  } catch (error) {
    console.error('Error adding appliance:', error);
    showMessage('Failed to add appliance. Please try again.', 'error');
  }
}

/**
 * Switch chart view
 */
async function switchChartView(viewType) {
  // Update active button
  document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`${viewType}-view`).classList.add('active');
  
  try {
    const totalData = await consumptionService.calculateTotalDaily();
    
    switch (viewType) {
      case 'daily':
        await energyChart.renderDaily(totalData.appliances);
        break;
      case 'weekly':
        await energyChart.renderWeekly(totalData.appliances);
        break;
      case 'pie':
        await energyChart.renderPieChart(totalData.appliances);
        break;
    }
  } catch (error) {
    console.error('Error switching chart view:', error);
    showMessage('Failed to update chart', 'error');
  }
}

/**
 * Refresh the appliance list display
 */
async function refreshApplianceList() {
  try {
    const appliances = await applianceService.getAll();
    const listContainer = document.getElementById('appliance-list-container');
    
    if (appliances.length === 0) {
      listContainer.innerHTML = '<p class="no-appliances">No appliances added yet. Add one above to get started!</p>';
      return;
    }
    
    listContainer.innerHTML = `
      <div class="appliance-list">
        ${appliances.map(appliance => `
          <div class="appliance-item" data-id="${appliance.id}">
            <div class="appliance-info">
              <h4>${appliance.name}</h4>
              <div class="appliance-details">
                <span>${appliance.power_watts}W</span>
                <span>${appliance.daily_hours}h/day</span>
                <span>${appliance.estimated_daily_kwh.toFixed(2)} kWh/day</span>
              </div>
            </div>
            <button class="delete-btn" onclick="deleteAppliance(${appliance.id})">×</button>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error loading appliances:', error);
    showMessage('Failed to load appliances', 'error');
  }
}

/**
 * Delete an appliance
 */
async function deleteAppliance(applianceId) {
  if (!confirm('Are you sure you want to delete this appliance?')) {
    return;
  }
  
  try {
    await applianceService.delete(applianceId);
    await refreshApplianceList();
    await updateConsumptionData();
    showMessage('Appliance deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting appliance:', error);
    showMessage('Failed to delete appliance', 'error');
  }
}

/**
 * Load initial appliance data and update displays
 */
async function loadApplianceData() {
  await updateConsumptionData();
}

/**
 * Update consumption data and charts
 */
async function updateConsumptionData() {
  try {
    const totalData = await consumptionService.calculateTotalDaily();
    const monthlyData = await consumptionService.calculateMonthly();
    
    // Update summary displays
    document.getElementById('daily-total').textContent = `${totalData.total_daily_kwh.toFixed(2)} kWh`;
    document.getElementById('monthly-total').textContent = `${(totalData.total_daily_kwh * 30).toFixed(1)} kWh`;
    
    // Calculate cost estimate (using average rate of $0.12/kWh)
    const costData = await consumptionService.calculateCost(totalData.total_daily_kwh, 0.12);
    document.getElementById('cost-estimate').textContent = `$${(costData.daily_cost * 30).toFixed(2)}/month`;
    
    // Update chart (default to daily view)
    if (energyChart && totalData.appliances.length > 0) {
      await energyChart.renderDaily(totalData.appliances);
    }
  } catch (error) {
    console.error('Error updating consumption data:', error);
  }
}

/**
 * Show user messages
 */
function showMessage(message, type = 'info') {
  // Remove existing messages
  const existingMessage = document.querySelector('.user-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `user-message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 1000;
    font-weight: 500;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  document.body.appendChild(messageDiv);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 3000);
}

// Make deleteAppliance globally available
window.deleteAppliance = deleteAppliance;

/**
 * Update loading message for user feedback
 */
function updateLoadingMessage(message) {
  const loadingText = document.querySelector('.loading p');
  if (loadingText) {
    loadingText.textContent = message;
  }
}

/**
 * Show error message to user
 */
function showError(message) {
  const appElement = document.getElementById('app');
  appElement.innerHTML = `
    <div class="error-container">
      <h1>Application Error</h1>
      <p>${message}</p>
      <button onclick="location.reload()">Reload Application</button>
    </div>
  `;
}

/**
 * Apply base CSS styles programmatically
 * This will be replaced by proper CSS files in later tasks
 */
function applyBaseStyles() {
  const styles = `
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      text-align: center;
      padding: 2rem 0;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 2rem;
    }
    
    .app-header h1 {
      color: #1f2937;
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .app-subtitle {
      color: #6b7280;
      font-size: 1.125rem;
    }
    
    .app-main {
      flex: 1;
    }
    
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .appliances-section {
      grid-column: span 2;
    }
    
    .consumption-section,
    .chart-section {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .app-footer {
      text-align: center;
      padding: 1rem 0;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    h2 {
      color: #1f2937;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    /* Form Styles */
    .appliance-form {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    
    .form-group label {
      margin-bottom: 0.25rem;
      font-weight: 500;
      color: #374151;
    }
    
    .form-group input {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }
    
    .usage-days {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .usage-days label {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    .add-btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.25rem;
      font-weight: 500;
      cursor: pointer;
    }
    
    .add-btn:hover {
      background: #1d4ed8;
    }
    
    /* Appliance List Styles */
    .appliance-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .appliance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .appliance-info h4 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }
    
    .appliance-details {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .delete-btn {
      background: #ef4444;
      color: white;
      border: none;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .delete-btn:hover {
      background: #dc2626;
    }
    
    .no-appliances {
      text-align: center;
      color: #6b7280;
      font-style: italic;
      padding: 2rem;
    }
    
    /* Chart Controls */
    #chart-controls {
      margin-bottom: 1rem;
      display: flex;
      gap: 0.5rem;
    }
    
    .chart-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    .chart-btn.active {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }
    
    .chart-btn:hover:not(.active) {
      background: #f3f4f6;
    }
    
    /* Consumption Summary */
    #consumption-summary {
      margin-top: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.25rem;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .summary-item:last-child {
      margin-bottom: 0;
    }
    
    .summary-item .label {
      font-weight: 500;
      color: #374151;
    }
    
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    
    .error-container h1 {
      color: #dc2626;
      margin-bottom: 1rem;
    }
    
    .error-container button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
    }
    
    .error-container button:hover {
      background: #1d4ed8;
    }
    
    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .appliances-section {
        grid-column: span 1;
      }
      
      .app-header h1 {
        font-size: 1.875rem;
      }
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Initialize application when DOM is ready
console.log('🎯 Setting up DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚨 DOMContentLoaded event fired!');
  initializeApp();
});

// Cleanup database connection when page unloads
window.addEventListener('beforeunload', () => {
  database.close();
});