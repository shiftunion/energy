# Quickstart: Household Power Consumption Estimator

**Generated**: 2025-09-21  
**For Feature**: 001-build-an-application  
**Test Scenarios**: Integration validation for complete user workflows

## Quick Setup

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Local development server (Vite dev server)
- No external dependencies or accounts required

### Installation & Launch
1. Clone repository and navigate to project directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open browser to `http://localhost:5173`
5. Application should display empty appliance list with "Add Appliance" button

## Core User Journey Testing

### Scenario 1: First-Time User Setup
**Goal**: Verify new user can quickly understand and use the application.

**Test Steps**:
1. **Initial Load**
   - Open application in fresh browser (clear localStorage/indexedDB)
   - Verify welcome message or empty state is clear
   - Confirm "Add Appliance" button is prominent and accessible

2. **Add First Appliance** 
   - Click "Add Appliance" button
   - Enter: "Refrigerator", 150 watts, 24 hours, all days selected
   - Submit form
   - **Expected**: Appliance appears in list, shows 3.6 kWh daily consumption

3. **View Initial Chart**
   - Navigate to or scroll to chart section
   - **Expected**: Chart displays 7-day forecast with consistent 3.6 kWh per day
   - Hover over any bar
   - **Expected**: Tooltip shows "Refrigerator: 3.6 kWh (100%)"

**Success Criteria**:
- [ ] Application loads without errors
- [ ] Form validation provides clear feedback
- [ ] Calculations are accurate (150W × 24h = 3.6 kWh)
- [ ] Chart renders correctly with data
- [ ] Interface is intuitive for first-time users

### Scenario 2: Managing Multiple Appliances
**Goal**: Verify complex appliance management and accurate calculations.

**Test Steps**:
1. **Add Weekday-Only Appliance**
   - Add "Washing Machine": 500W, 1 hour, weekdays only (Mon-Fri)
   - **Expected**: Weekly total increases by 2.5 kWh (5 days × 0.5 kWh)

2. **Add Weekend Appliance**
   - Add "Electric Lawn Mower": 1200W, 0.5 hours, weekends only (Sat-Sun)  
   - **Expected**: Chart shows different weekend consumption pattern

3. **Edit Existing Appliance**
   - Edit refrigerator to 120W instead of 150W
   - **Expected**: All calculations update immediately, chart reflects changes

4. **Complex Schedule Testing**
   - Add "Air Conditioner": 3000W, 8 hours, specific days (Wed, Thu, Fri)
   - **Expected**: Chart shows consumption spikes on specified days only

**Success Criteria**:
- [ ] Partial week schedules calculate correctly  
- [ ] Chart updates in real-time when appliances are modified
- [ ] Total consumption aggregates properly across all appliances
- [ ] Visual indicators clearly show which days have higher consumption

### Scenario 3: Data Persistence & Export
**Goal**: Ensure data survives browser sessions and can be exported.

**Test Steps**:
1. **Add Multiple Appliances**
   - Create at least 5 different appliances with varied schedules
   - Note total weekly consumption value

2. **Browser Refresh Test**
   - Refresh page (F5)
   - **Expected**: All appliances and data persist correctly
   - **Expected**: Chart and calculations match pre-refresh state

3. **Export Functionality**
   - Use export feature (button/menu option)
   - **Expected**: Download contains all appliance data in readable format
   - **Expected**: Export includes consumption estimates and settings

4. **Browser Close/Reopen Test**
   - Close browser completely
   - Reopen and navigate to application
   - **Expected**: All data still present and accurate

**Success Criteria**:
- [ ] SQLite database persists data correctly
- [ ] No data loss on browser refresh or restart
- [ ] Export includes all necessary data for backup/transfer
- [ ] Import functionality works with exported data

### Scenario 4: Accessibility & Usability
**Goal**: Verify application is fully accessible and usable by all users.

**Test Steps**:
1. **Keyboard Navigation**
   - Navigate entire application using only keyboard (Tab, Enter, arrows)
   - Add appliance using keyboard only
   - Navigate chart using arrow keys
   - **Expected**: All functionality accessible via keyboard

2. **Screen Reader Testing** (with screen reader enabled)
   - Listen to page structure announcement
   - Add appliance with screen reader feedback
   - Navigate to chart and hear data description
   - **Expected**: All content and actions are announced clearly

3. **High Contrast Mode**
   - Enable system high contrast mode
   - **Expected**: All text remains readable, focus indicators visible

4. **Mobile/Touch Testing**
   - Test on mobile device or resize browser to mobile width
   - **Expected**: Touch targets are appropriate size, interface responsive

**Success Criteria**:
- [ ] Full keyboard navigation support
- [ ] Screen reader announcements are informative
- [ ] High contrast mode doesn't break layout
- [ ] Mobile interface is usable and responsive
- [ ] Focus indicators are always visible

### Scenario 5: Error Handling & Edge Cases
**Goal**: Verify application handles errors gracefully and provides helpful feedback.

**Test Steps**:
1. **Invalid Input Testing**
   - Try negative wattage values
   - Enter text in numeric fields
   - Submit form with missing required fields
   - **Expected**: Clear, helpful validation messages

2. **Extreme Values**
   - Add appliance with very high wattage (9999W)
   - Set usage to maximum hours (24)
   - **Expected**: Application warns about high consumption but allows valid values

3. **Empty States**
   - Delete all appliances
   - **Expected**: Chart shows appropriate empty state message
   - **Expected**: Helpful guidance on how to add first appliance

4. **Data Corruption Simulation**
   - Manually corrupt localStorage/IndexedDB data (dev tools)
   - Refresh application
   - **Expected**: Application detects corruption and resets gracefully

**Success Criteria**:
- [ ] Validation messages are clear and actionable
- [ ] Extreme but valid values are handled appropriately
- [ ] Empty states provide helpful guidance
- [ ] Data corruption is detected and handled gracefully

## Performance Validation

### Timing Benchmarks
Test with stopwatch or performance tools:

- [ ] **Initial Load**: <3 seconds on standard broadband
- [ ] **Add Appliance**: Form submission completes <100ms
- [ ] **Chart Update**: Data changes reflect in chart <50ms
- [ ] **Calculation Update**: Consumption recalculation <200ms
- [ ] **Large Dataset**: 50+ appliances still perform smoothly

### Memory Usage
Monitor browser developer tools:
- [ ] **Memory Growth**: No significant memory leaks during extended use
- [ ] **Bundle Size**: Total JavaScript bundle <5MB
- [ ] **Database Size**: SQLite database stays reasonable with typical usage

## Cross-Browser Testing

### Required Browser Tests
- [ ] **Chrome 90+**: All functionality works correctly
- [ ] **Firefox 88+**: All functionality works correctly  
- [ ] **Safari 14+**: All functionality works correctly
- [ ] **Edge 90+**: All functionality works correctly

### Mobile Browser Tests
- [ ] **Mobile Safari**: Touch interactions work properly
- [ ] **Chrome Mobile**: Responsive design functions correctly

## Production Readiness Checklist

### Security Validation
- [ ] Input sanitization prevents XSS
- [ ] No sensitive data in localStorage
- [ ] Client-side validation only (no security dependency)

### Accessibility Compliance
- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader testing completed
- [ ] Keyboard navigation fully functional

### Performance Standards Met
- [ ] All timing benchmarks passed
- [ ] Memory usage within acceptable limits
- [ ] Bundle size optimized

### Error Handling Complete
- [ ] All error scenarios have appropriate user feedback
- [ ] Graceful degradation for unsupported features
- [ ] Data recovery mechanisms in place

## Integration Test Results

**Date Tested**: _[Fill in during testing]_  
**Browser**: _[Fill in during testing]_  
**Tested By**: _[Fill in during testing]_

**Overall Status**: ⚪ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

**Critical Issues Found**: _[Document any blocking issues]_

**Minor Issues Found**: _[Document any usability issues]_

**Performance Results**: _[Record actual timing measurements]_

**Accessibility Results**: _[Record any accessibility issues found]_

---

*This quickstart guide serves as both user acceptance testing and integration validation. All scenarios should pass before considering the feature complete.*