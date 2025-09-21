/**
 * Main application entry point
 * Initializes database and application components
 */

import database from './models/database.js';

/**
 * Initialize the application
 */
async function initializeApp() {
  const loadingElement = document.querySelector('.loading');
  
  try {
    // Show initialization progress
    updateLoadingMessage('Initializing database...');
    
    // Initialize SQLite database
    await database.initialize();
    
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
              <h2 id="chart-heading">7-Day Forecast</h2>
              <div id="chart-container"></div>
            </section>
          </div>
        </main>
        
        <footer class="app-footer">
          <p>&copy; 2025 Household Power Estimator</p>
        </footer>
      </div>
    `;
    
    // Apply basic styles
    applyBaseStyles();
    
    updateLoadingMessage('Application ready!');
    
    // Hide loading indicator
    setTimeout(() => {
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
    }, 500);
    
    console.log('Application initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    showError('Failed to initialize application. Please refresh the page.');
  }
}

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
document.addEventListener('DOMContentLoaded', initializeApp);

// Cleanup database connection when page unloads
window.addEventListener('beforeunload', () => {
  database.close();
});