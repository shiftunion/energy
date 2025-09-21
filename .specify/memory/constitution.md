<!--
Sync Impact Report:
- Version change: N/A → 1.0.0 (initial constitution)
- Added principles: I. Reliability, II. Observability, III. Security, IV. Accessibility, V. Performance
- Added sections: Quality Standards, Development Workflow
- Templates requiring updates:
  ✅ updated plan-template.md - Constitution Check section
  ✅ updated spec-template.md - aligned requirement validation
  ✅ updated tasks-template.md - added principle-based task categories
- Follow-up TODOs: None - all placeholders resolved
-->

# Energy Project Constitution

## Core Principles

### I. Reliability
All systems MUST maintain consistent functionality under expected load and failure scenarios. 
Components MUST handle graceful degradation during partial failures. Circuit breakers and 
retry mechanisms are mandatory for external dependencies. System state MUST be recoverable 
from any partial failure within 30 seconds. Every feature MUST include failure scenario testing.

### II. Observability
All system behaviors MUST be observable through structured logging, metrics, and tracing. 
Every user-facing action MUST generate audit logs with unique correlation IDs. Performance 
metrics MUST be captured at component boundaries. Error states MUST include sufficient 
context for debugging. Monitoring dashboards are required for all production services.

### III. Security
Security MUST be built-in, not bolted-on. All data inputs MUST be validated and sanitized. 
Authentication and authorization checks are mandatory for all protected resources. Secrets 
MUST never appear in logs, code, or configuration files. Security reviews are required 
for any feature handling sensitive data or external communications.

### IV. Accessibility
All user interfaces MUST comply with WCAG 2.1 AA standards. Features MUST be usable via 
keyboard navigation and screen readers. Color MUST NOT be the only means of conveying 
information. All interactive elements MUST have appropriate focus indicators. Accessibility 
testing is mandatory before any UI feature release.

### V. Performance
System responses MUST meet defined performance benchmarks. API endpoints MUST respond 
within 200ms for 95th percentile requests. UI interactions MUST provide feedback within 
100ms. Database queries MUST be optimized and indexed appropriately. Performance regression 
testing is required for any change affecting critical paths.

## Quality Standards

All code MUST pass automated quality gates including linting, security scanning, and 
performance benchmarking. Technical debt MUST be tracked and addressed in each sprint. 
Breaking changes require migration guides and backwards compatibility periods. All public 
APIs MUST maintain semantic versioning. Documentation MUST be updated synchronously with 
code changes.

## Development Workflow

Test-Driven Development (TDD) is mandatory: tests MUST be written before implementation. 
All features MUST follow the specification-driven workflow: /specify → /plan → /tasks → 
/implement. Code reviews MUST verify constitutional compliance before merge. Continuous 
integration MUST validate all principles automatically. Emergency hotfixes require 
post-incident constitutional compliance review within 48 hours.

## Governance

This constitution supersedes all other development practices and guidelines. All pull requests 
MUST demonstrate constitutional compliance before merge approval. Constitutional violations 
MUST be documented and justified in the Complexity Tracking section of feature plans. 
Amendment proposals require documentation of impact analysis and migration strategy.

Version increments follow semantic versioning: MAJOR for backward-incompatible governance 
changes, MINOR for new principles or sections, PATCH for clarifications. All team members 
MUST validate constitutional compliance during code reviews. Agent-specific guidance files 
(`.github/copilot-instructions.md`, `CLAUDE.md`, etc.) MUST reference current constitution 
version for development context.

**Version**: 1.0.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21