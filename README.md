# Household Power Consumption Estimator

Build household energy awareness with a full-stack-in-the-browser web app that tracks appliance usage, projects consumption costs, and renders an accessible 7-day forecast.

## Table of Contents
- [Overview](#overview)
- [Feature Highlights](#feature-highlights)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Quality Checks](#quality-checks)
- [Project Structure](#project-structure)
- [Key Modules](#key-modules)
- [Data & Persistence](#data--persistence)
- [Accessibility & Performance](#accessibility--performance)
- [Testing Strategy](#testing-strategy)
- [Roadmap Ideas](#roadmap-ideas)
- [Resources](#resources)

## Overview
The Energy project delivers a browser-based appliance catalog that estimates power consumption across daily, weekly, and monthly views. Users can log devices, specify usage schedules, and immediately view updated totals alongside an interactive Chart.js visualization. The application is engineered for reliability, offline-friendly operation, and WCAG 2.1 AA accessibility.

## Feature Highlights
- Appliance management with full CRUD support, validation, and standby power handling
- Real-time consumption and cost estimation with instant feedback as inputs change
- 7-day interactive forecast chart with keyboard navigation, hover breakdowns, and export support
- sqlite-powered persistence (via `sql.js`) for durable data without external services
- Detailed error handling, sanitation, and defensive validation to keep data trustworthy
- Thorough contract and integration test suites covering 60+ user and API scenarios

## Tech Stack
- **Framework & Build**: Vite 5, ECMAScript modules, modern browser APIs
- **Data Layer**: `sql.js` (SQLite compiled to WebAssembly) for local, offline-capable storage
- **Visualization**: Chart.js with custom accessibility utilities
- **Testing**: Vitest (contract + integration), @vitest/ui for exploratory runs
- **Quality Tooling**: ESLint, Prettier, custom Spec Kit documentation workflow

## Getting Started

### Prerequisites
- Node.js 18+ (Vite and Vitest target modern runtimes)
- npm 9+ (bundled with Node 18)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
The dev server launches at `http://localhost:5173/` with hot module replacement.

### Production Build
```bash
npm run build
npm run preview
```
`npm run build` emits static assets under `dist/`. `npm run preview` serves the production bundle locally for smoke testing.

## Quality Checks
```bash
npm run test       # Execute Vitest suites in headless mode
npm run test:ui    # Launch the Vitest UI runner for focused debugging
npm run lint       # Lint JavaScript and HTML with ESLint rules
npm run lint:fix   # Auto-fix lint violations when possible
```

## Project Structure
```text
energy/
├── public/                     # Static assets served by Vite
├── src/
│   ├── chart/                  # Chart.js wrapper & visualization utilities
│   ├── components/             # UI building blocks and views
│   ├── models/                 # SQLite database adapters (prod & test variants)
│   ├── services/               # Domain logic: appliances, consumption, reporting
│   ├── utils/                  # Environment detection & shared helpers
│   └── main.js                 # Application bootstrap & UI wiring
├── tests/
│   ├── contract/               # API contract verification suites
│   └── integration/            # End-to-end workflow validation
├── specs/001-build-an-application/
│   ├── spec.md                 # Feature specification & user stories
│   ├── plan.md                 # Implementation plan & constitution checklist
│   └── research.md             # Technical research and decisions
├── vite.config.js              # Vite build configuration
└── vitest.config.js            # Vitest setup & environment overrides
```

## Key Modules
- `src/services/ApplianceService.js`: Validated CRUD operations, sanitization, and standby logic
- `src/services/ConsumptionService.js`: Daily/weekly/monthly kWh and cost estimations with schedule-aware math
- `src/chart/EnergyChart.js`: Accessible Chart.js implementation with dataset switching and export helpers
- `src/models/database.js`: Production SQLite wrapper handling schema creation, persistence, and migrations
- `src/utils/test-setup.js`: Environment detection, database isolation, and Chart.js mocks for deterministic tests

## Data & Persistence
- Uses an in-browser SQLite database via `sql.js`, backed by WASM for cross-platform consistency
- Appliance schema captures usage days (`0=Sunday ... 6=Saturday`), daily hours, standby watts, and timestamps
- Tests leverage an isolated database implementation (`database.test.js`) to keep suites deterministic
- Data can be extended with rate settings for cost calculations and report exports

## Accessibility & Performance
- Screen-reader friendly forms with semantic HTML, ARIA labels, and focus management
- Keyboard-first navigation across appliance tables, chart controls, and export actions
- Chart fallbacks provide tabular data when canvas rendering is unavailable
- Performance budgets: <100ms UI feedback, <200ms consumption recalculations, <50ms chart updates
- Defensive input validation protects against malformed data, XSS vectors, and runaway calculations

## Testing Strategy
- **Contract tests** assert API/service contracts for appliance CRUD, consumption calculators, and chart data
- **Integration tests** drive complete user workflows, ensuring UI orchestration stays in sync with services
- **Mocked infrastructure** (Chart.js, SQLite adapters) keeps suites fast while exercising domain logic
- **TDD-first workflow** documented in the Spec Kit ensures new features ship with test coverage from day one

## Roadmap Ideas
- Export consumption summaries to CSV/PDF directly from the browser
- Add configurable electricity tariffs per time-of-use period
- Introduce user-defined appliance categories and grouping analytics
- Surface performance metrics and diagnostics in a developer dashboard mode

## Resources
- [Feature Spec](specs/001-build-an-application/spec.md)
- [Implementation Plan](specs/001-build-an-application/plan.md)
- [Research Notes](specs/001-build-an-application/research.md)

Ready to share on GitHub—clone, run, and start optimizing your household energy usage.
