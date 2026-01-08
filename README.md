# RR QA Automation Assignment

Comprehensive test automation suite for TMDB Discover application using TypeScript + Playwright with Page Object Model, structured logging, and automated reporting.

## 📁 Project Structure
```
├── src/
│   ├── pages/          # Page Object Models
│   ├── fixtures/       # Custom Playwright fixtures
│   ├── utils/          # Logger, API helpers
│   └── config/         # Environment configuration
├── tests/
│   ├── e2e/           # End-to-end user journey tests
│   ├── api/           # API contract & network interception tests
│   └── ui/            # UI component tests
├── reports/
│   ├── html/          # Detailed Playwright HTML report
│   └── report.html    # Auto-generated summary report
├── docs/
│   ├── test-cases.md  # Test scenarios
│   └── defects.md     # Known issues
├── documentation.md   # Q&A format documentation
└── scripts/          # Summary report generator

## 🎯 Test Strategy
**Layered approach with clear segregation:**
- **E2E (12 tests):** Critical user journeys (filters, pagination, error handling)
- **API (26 tests):** Contract validation, network interception, mocking scenarios
- **UI (6 tests):** Component-level checks (accessibility, responsiveness, state management)

**Key principles:**
- Risk-based coverage focusing on high-value features
- Page Object Model for maintainability
- Route interception for deterministic network testing
- Structured logging with Pino for observability
- Automated summary report generation post-test


## ⚙️ Setup & Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation Steps
```bash
# Clone the repository
git clone https://github.com/vikramganesh94-stack/rr-qaautomation-assignment.git
cd rr-qaautomation-assignment

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Environment Configuration (Optional)
Create a `.env` file:
```
BASE_URL=https://tmdb-discover.surge.sh
HEADLESS=true
LOG_LEVEL=info
```

## 🚀 Running Tests

```bash
# Run all tests (default: single browser)
npm test

# Run specific test categories
npx playwright test tests/e2e/
npx playwright test tests/api/
npx playwright test tests/ui/

# Debug mode
npm run test:debug

# Headed mode (see browser)
npm run test:headed

# View reports
npm run report              # Opens detailed HTML report
# Or view summary: reports/report.html (auto-generated after npm test)
```

## 📊 Test Results & Artifacts
**Latest execution:** 44 tests | 42 passed | 0 failed | 2 skipped

**Reports:**
- Detailed HTML: `reports/html/index.html`
- Summary: `reports/report.html` (auto-generated post-test)
- JSON: `reports/results.json`
- Artifacts: `test-results/` (screenshots, videos, traces)


## 🛠️ Framework Details

**Tech Stack:**
- **Test Runner:** Playwright 1.41.x
- **Language:** TypeScript 5.x
- **Logging:** Pino with structured logs
- **Patterns:** Page Object Model, Custom Fixtures, Route Interception
- **Reporters:** List + HTML + JSON + Custom Summary Generator

**Design Techniques:**
- Equivalence Partitioning
- Boundary Value Analysis
- Decision Tables
- State Transition Testing
- Error Guessing

## 🐛 Defects Found
1. **Pagination controls absent:** Some builds don't render pagination (2 tests skipped)
2. **Console warnings:** Non-blocking warnings on first paint (tracked, not failing)

Full details: [docs/defects.md](docs/defects.md)

## 📄 Documentation
- **[documentation.md](documentation.md)** - Q&A format covering strategy, cases, framework, design techniques
- **[docs/test-cases.md](docs/test-cases.md)** - Detailed test scenarios
- **[docs/defects.md](docs/defects.md)** - Known issues log

## 🔧 CI/CD Ready
- GitHub Actions workflow configured
- Browser matrix support (chromium/webkit)
- Artifact uploads for traces/videos
- Automated report generation

## 📝 Assignment Deliverables
✅ Test automation framework with E2E, API, and UI tests  
✅ Documentation answering all assignment questions  
✅ Automated reporting (HTML + custom summary)  
✅ Full git history preserved  
✅ Public repository ready for review

---
**Repository:** https://github.com/vikramganesh94-stack/rr-qaautomation-assignment
