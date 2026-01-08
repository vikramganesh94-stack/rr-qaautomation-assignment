Overview

This project is a production-quality QA automation framework built for the TMDB Discover application using TypeScript and Playwright.
The goal of this assignment is to demonstrate test strategy, automation design, code organization, and quality thinking, rather than only test execution.

The framework supports UI, API, and End-to-End testing, follows Page Object Model (POM) principles, and includes logging, reporting, and CI readiness.

Key Capabilities

• End-to-End user journey automation
• API contract validation and network interception
• UI component and behavior validation
• Page Object Model for maintainability
• Deterministic testing using mocked network responses
• Structured logging for observability
• Automated HTML and summary reporting
• CI/CD ready (GitHub Actions compatible)

Test Strategy

A layered testing approach is used to balance coverage, speed, and reliability.

E2E Tests (12 tests)
• Validate critical user workflows
• Filters, pagination, and error handling
• Focus on real user behavior and business risk

API Tests (26 tests)
• API contract and schema validation
• Network interception and mocking
• Positive, negative, and edge-case scenarios

UI Tests (6 tests)
• Component-level validation
• Accessibility and responsiveness checks
• UI state and rendering verification

Test coverage is risk-based, focusing on high-impact and failure-prone areas.

Test Design Techniques Applied

• Equivalence Partitioning
• Boundary Value Analysis
• Decision Table Testing
• State Transition Testing
• Error Guessing

These techniques ensure meaningful coverage rather than redundant test cases.

Setup & Execution

Prerequisites:
• Node.js 16+
• npm or yarn

Installation steps:

Clone the repository

Install dependencies using npm install

Install Playwright browsers

Environment variables (optional):
BASE_URL=https://tmdb-discover.surge.sh

HEADLESS=true
LOG_LEVEL=info

Test execution:
• Run all tests using npm test
• Run E2E, API, or UI tests independently
• Debug and headed modes supported

Reports & Results

Latest execution summary:
44 total tests
42 passed
0 failed
2 skipped

Reports generated:
• Detailed Playwright HTML report
• Custom execution summary report
• JSON results for CI consumption
• Screenshots, videos, and traces for failures

Reports are automatically generated after test execution.

Defects & Observations

Pagination controls are not rendered in certain builds
• Related tests are skipped intentionally

Console warnings during first page load
• Observed and logged
• Non-blocking and not treated as failures

All known issues are documented clearly and transparently.

Repository
https://github.com/vikramganesh94-stack/rr-qaautomation-assignment
