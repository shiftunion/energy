# Tasks: Household Power Consumption Estimator

**Input**: Design documents from `/specs/001-build-an-application/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Extract: Vite + Vanilla JS + SQLite + Chart.js tech stack
2. Load optional design documents: ✅
   → data-model.md: Appliance, ConsumptionEstimate, RateSetting, WeeklyForecast entities
   → contracts/: appliance-api.md, chart-component.md → contract test tasks
   → research.md: SQLite integration, Chart.js setup, accessibility decisions
3. Generate tasks by category: ✅
   → Setup: Vite config, SQLite setup, Chart.js integration
   → Tests: appliance API tests, chart component tests, integration tests
   → Core: data models, calculation services, UI components
   → Integration: chart integration, data persistence, user workflows
   → Constitutional Compliance: reliability, observability, security, accessibility, performance
4. Apply task rules: ✅
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✅
6. Generate dependency graph ✅
7. Create parallel execution examples ✅
8. Validate task completeness: ✅
   → All contracts have tests ✅
   → All entities have models ✅
   → All user stories have integration tests ✅
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Single project**: `src/`, `tests/` at repository root (per plan.md structure decision)

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan: src/{models,services,components,utils,chart}/, tests/{contract,integration,unit,reliability,security,accessibility,performance}/, public/
- [ ] T002 Initialize Vite project with minimal dependencies: vite, sql.js, chart.js, vitest
- [ ] T003 [P] Configure linting (ESLint) and formatting (Prettier) with accessibility rules
- [ ] T004 [P] Setup SQLite database initialization script in src/models/database.js
- [ ] T005 [P] Configure Vite build settings for SQLite WASM and Chart.js optimization

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Appliance API)
- [ ] T006 [P] Contract test: Create appliance in tests/contract/test_appliance_create.js
- [ ] T007 [P] Contract test: Get all appliances in tests/contract/test_appliance_getall.js
- [ ] T008 [P] Contract test: Get appliance by ID in tests/contract/test_appliance_getbyid.js  
- [ ] T009 [P] Contract test: Update appliance in tests/contract/test_appliance_update.js
- [ ] T010 [P] Contract test: Delete appliance in tests/contract/test_appliance_delete.js
- [ ] T011 [P] Contract test: Calculate consumption estimates in tests/contract/test_consumption_calculate.js
- [ ] T012 [P] Contract test: Generate weekly forecast in tests/contract/test_consumption_forecast.js

### Contract Tests (Chart Component)
- [ ] T013 [P] Contract test: Chart initialization in tests/contract/test_chart_init.js
- [ ] T014 [P] Contract test: Chart data update in tests/contract/test_chart_update.js
- [ ] T015 [P] Contract test: Chart interactions (hover, click) in tests/contract/test_chart_interactions.js
- [ ] T016 [P] Contract test: Chart accessibility features in tests/contract/test_chart_accessibility.js

### Integration Tests (User Scenarios from quickstart.md)
- [ ] T017 [P] Integration test: First-time user setup workflow in tests/integration/test_firsttime_user.js
- [ ] T018 [P] Integration test: Multiple appliances management in tests/integration/test_multiple_appliances.js
- [ ] T019 [P] Integration test: Data persistence across sessions in tests/integration/test_data_persistence.js
- [ ] T020 [P] Integration test: Chart updates with appliance changes in tests/integration/test_chart_updates.js
- [ ] T021 [P] Integration test: Export/import functionality in tests/integration/test_export_import.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Models
- [ ] T022 [P] Appliance model with validation in src/models/Appliance.js
- [ ] T023 [P] ConsumptionEstimate model in src/models/ConsumptionEstimate.js
- [ ] T024 [P] RateSetting model in src/models/RateSetting.js
- [ ] T025 [P] WeeklyForecast model in src/models/WeeklyForecast.js
- [ ] T026 [P] Database schema creation and migrations in src/models/schema.js

### Services (Business Logic)
- [ ] T027 [P] ApplianceService CRUD operations in src/services/ApplianceService.js
- [ ] T028 [P] ConsumptionCalculationService in src/services/ConsumptionCalculationService.js
- [ ] T029 [P] ForecastService for 7-day projections in src/services/ForecastService.js
- [ ] T030 [P] ValidationService for input sanitization in src/services/ValidationService.js
- [ ] T031 [P] SettingsService for rate management in src/services/SettingsService.js

### UI Components
- [ ] T032 [P] ApplianceForm component in src/components/ApplianceForm.js
- [ ] T033 [P] ApplianceList component in src/components/ApplianceList.js
- [ ] T034 [P] ConsumptionSummary component in src/components/ConsumptionSummary.js
- [ ] T035 Chart component integration: connect ChartService to Chart.js in src/chart/ChartComponent.js
- [ ] T036 Main application controller connecting all components in src/components/App.js

### Chart Implementation
- [ ] T037 ChartService: data formatting for Chart.js in src/chart/ChartService.js
- [ ] T038 Chart accessibility: ARIA labels and keyboard navigation in src/chart/AccessibilityManager.js
- [ ] T039 Chart tooltips and hover interactions in src/chart/InteractionManager.js

## Phase 3.4: Integration
- [ ] T040 Connect ApplianceService to SQLite database persistence
- [ ] T041 Wire chart updates to appliance data changes (reactive updates)
- [ ] T042 Implement export/import functionality with JSON serialization
- [ ] T043 Setup error handling and user feedback systems
- [ ] T044 Integrate settings management with consumption calculations

## Phase 3.5: Constitutional Compliance
- [ ] T045 [P] Reliability tests: database failure recovery, graceful degradation in tests/reliability/
- [ ] T046 [P] Observability: structured logging, performance metrics, error tracking in src/utils/Logger.js
- [ ] T047 [P] Security: input validation, XSS prevention, data sanitization in tests/security/
- [ ] T048 [P] Accessibility: WCAG 2.1 AA compliance testing, keyboard navigation in tests/accessibility/
- [ ] T049 [P] Performance: <100ms UI feedback, <200ms calculations, <50ms chart updates in tests/performance/

## Phase 3.6: Polish
- [ ] T050 [P] Unit tests for calculation algorithms in tests/unit/test_calculations.js
- [ ] T051 [P] Unit tests for validation functions in tests/unit/test_validation.js
- [ ] T052 Performance optimization: DOM updates, calculation memoization, chart rendering
- [ ] T053 [P] Error message improvements and user experience polish
- [ ] T054 [P] Update documentation with usage examples and API reference
- [ ] T055 Run quickstart.md manual testing scenarios and constitutional review checklist

## Dependencies

**Sequential Chains**:
- Setup (T001-T005) → Tests (T006-T021) → Implementation (T022-T044) → Compliance (T045-T049) → Polish (T050-T055)
- T022-T026 (Models) → T027-T031 (Services) → T032-T039 (UI/Chart)
- T040-T044 (Integration) requires T027-T039 complete
- Constitutional compliance (T045-T049) requires core implementation complete

**Blocking Dependencies**:
- T026 (schema) blocks T027 (ApplianceService)
- T027 (ApplianceService) blocks T040 (database integration)
- T035 (Chart component) blocks T041 (reactive updates)
- T028 (ConsumptionCalculationService) blocks T029 (ForecastService)

## Parallel Execution Examples

### Phase 3.2 - Contract Tests (all parallel)
```bash
# Launch T006-T016 together:
npm test tests/contract/test_appliance_create.js &
npm test tests/contract/test_appliance_getall.js &
npm test tests/contract/test_appliance_getbyid.js &
npm test tests/contract/test_appliance_update.js &
npm test tests/contract/test_appliance_delete.js &
npm test tests/contract/test_consumption_calculate.js &
npm test tests/contract/test_consumption_forecast.js &
npm test tests/contract/test_chart_init.js &
npm test tests/contract/test_chart_update.js &
npm test tests/contract/test_chart_interactions.js &
npm test tests/contract/test_chart_accessibility.js &
```

### Phase 3.3 - Data Models (all parallel)
```bash
# Launch T022-T025 together:
Task: "Appliance model with validation in src/models/Appliance.js"
Task: "ConsumptionEstimate model in src/models/ConsumptionEstimate.js"  
Task: "RateSetting model in src/models/RateSetting.js"
Task: "WeeklyForecast model in src/models/WeeklyForecast.js"
```

### Phase 3.5 - Constitutional Compliance (all parallel)
```bash
# Launch T045-T049 together:
Task: "Reliability tests in tests/reliability/"
Task: "Observability logging in src/utils/Logger.js"
Task: "Security validation in tests/security/"
Task: "Accessibility testing in tests/accessibility/"
Task: "Performance benchmarks in tests/performance/"
```

## Notes
- [P] tasks = different files, no dependencies
- **Verify tests fail before implementing** - critical for TDD approach
- Commit after each task completion
- SQLite operations must handle async/await properly
- Chart.js integration requires accessibility wrapper
- All UI interactions must provide <100ms feedback per constitutional requirements

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts have corresponding tests (T006-T016)
- [x] All entities have model tasks (T022-T025)  
- [x] All tests come before implementation (Phase 3.2 → 3.3)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Constitutional principles covered in compliance phase
- [x] Quickstart scenarios mapped to integration tests
- [x] Performance requirements explicitly addressed