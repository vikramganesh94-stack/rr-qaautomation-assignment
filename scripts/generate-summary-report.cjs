// Auto-generate reports/report.html from Playwright JSON results
// Run automatically after npm test via posttest hook

const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, '..', 'reports', 'results.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'reports', 'report.html');

function readJsonSafe(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

function statusFromTest(t) {
  const results = Array.isArray(t.results) ? t.results : [];
  if (results.some(r => r.status === 'failed' || r.status === 'timedOut' || r.status === 'interrupted')) return 'failed';
  if (results.some(r => r.status === 'skipped')) return 'skipped';
  if (results.length && results.every(r => r.status === 'passed')) return 'passed';
  if (t.status && ['passed', 'failed', 'skipped'].includes(t.status)) return t.status;
  if (t.expectedStatus && ['passed', 'failed', 'skipped'].includes(t.expectedStatus)) return t.expectedStatus;
  return 'unknown';
}

function collectTests(node, acc, projectName) {
  if (!node) return;
  // Playwright JSON may nest suites; specs may contain tests
  if (Array.isArray(node.suites)) {
    for (const s of node.suites) collectTests(s, acc, projectName);
  }
  if (Array.isArray(node.specs)) {
    for (const spec of node.specs) {
      const title = spec.title || (spec.file || '').split(path.sep).pop();
      if (Array.isArray(spec.tests)) {
        for (const t of spec.tests) {
          const status = statusFromTest(t);
          const pName = t.projectName || projectName || 'default';
          // Try to extract error message
          let errorMsg = '';
          if (Array.isArray(t.errors) && t.errors.length) {
            errorMsg = t.errors[0].message || t.errors[0].value || String(t.errors[0]);
          } else if (Array.isArray(t.results) && t.results.length) {
            const err = t.results.find(r => r.error);
            if (err && err.error) {
              errorMsg = err.error.message || String(err.error);
            }
          }
          acc.push({ title, fullTitle: t.title || title, status, projectName: pName, file: spec.file, errorMsg });
        }
      }
    }
  }
}

function summarize(results) {
  const tests = [];
  // Root can be an array or object depending on Playwright version
  const roots = Array.isArray(results) ? results : [results];
  for (const root of roots) {
    const projectName = root.project?.name || undefined;
    collectTests(root, tests, projectName);
  }
  const total = tests.length;
  const passed = tests.filter(t => t.status === 'passed').length;
  const failed = tests.filter(t => t.status === 'failed').length;
  const skipped = tests.filter(t => t.status === 'skipped').length;
  const failures = tests.filter(t => t.status === 'failed');
  return { total, passed, failed, skipped, failures };
}

function renderHTML(summary) {
  const now = new Date();
  const generated = now.toLocaleString();
  const { total, passed, failed, skipped, failures } = summary;

  const rows = failures.map(f => `
          <tr>
            <td>${escapeHtml(f.projectName)}</td>
            <td>${escapeHtml(f.fullTitle || f.title)}</td>
            <td><span class="code">${escapeHtml(f.errorMsg || 'Unknown error')}</span></td>
            <td>${escapeHtml(f.file || '')}</td>
          </tr>`).join('\n') || `
          <tr>
            <td colspan="4" class="ok">No failures 🎉</td>
          </tr>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Playwright Test Summary Report</title>
  <style>
    :root { --bg:#0f172a; --panel:#111827; --text:#e5e7eb; --muted:#9ca3af; --ok:#10b981; --fail:#ef4444; --skip:#f59e0b; --accent:#60a5fa; }
    body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Noto Sans', 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; background: var(--bg); color: var(--text); }
    header { padding: 24px; border-bottom: 1px solid #1f2937; background: #0b1220; }
    h1 { margin: 0 0 6px; font-size: 22px; }
    .subtitle { color: var(--muted); font-size: 13px; }
    main { padding: 24px; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(160px, 1fr)); gap: 16px; margin: 20px 0; }
    .card { background: var(--panel); border: 1px solid #1f2937; border-radius: 12px; padding: 16px; }
    .card h2 { margin: 0 0 6px; font-size: 12px; color: var(--muted); font-weight: 600; letter-spacing: .4px; }
    .big { font-size: 28px; font-weight: 700; }
    .ok { color: var(--ok); }
    .fail { color: var(--fail); }
    .skip { color: var(--skip); }
    .table { width: 100%; border-collapse: collapse; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
    .table th, .table td { padding: 10px 12px; border-bottom: 1px solid #1f2937; font-size: 13px; }
    .table th { text-align: left; background: #0b1220; color: var(--muted); font-weight: 600; }
    .tag { display:inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .tag.ok { background: #052e26; color: var(--ok); }
    .tag.fail { background: #3a0b0b; color: var(--fail); }
    .tag.skip { background: #3a2b06; color: var(--skip); }
    .footer { margin-top: 24px; color: var(--muted); font-size: 12px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .code { font-family: ui-monospace, Menlo, Consolas, 'SF Mono', monospace; font-size: 12px; background: #0b1220; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <header>
    <h1>Playwright Test Summary Report</h1>
    <div class="subtitle">Generated: ${escapeHtml(generated)} · Project: TMDB Discover QA · Runner: Playwright 1.41.x</div>
  </header>
  <main>
    <section class="grid">
      <div class="card"><h2>Total Cases</h2><div class="big">${total}</div></div>
      <div class="card"><h2 class="ok">Passed</h2><div class="big ok">${passed}</div></div>
      <div class="card"><h2 class="fail">Failed</h2><div class="big fail">${failed}</div></div>
      <div class="card"><h2 class="skip">Skipped</h2><div class="big skip">${skipped}</div></div>
    </section>

    <section class="card">
      <h2>Execution Details</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Value</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>All Tests</td><td>${total}</td><td><span class="tag ok">${passed} Passed</span> · <span class="tag fail">${failed} Failed</span> · <span class="tag skip">${skipped} Skipped</span></td></tr>
          <tr><td>HTML Report</td><td>reports/html/index.html</td><td><a href="html/index.html">Open Detailed Report</a></td></tr>
          <tr><td>JSON Report</td><td>reports/results.json</td><td><span class="tag">Artifacts</span></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <h2>Failed Tests and Reasons</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Test</th>
            <th>Reason</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
      </table>
      <p class="subtitle">View traces via <span class="code">npx playwright show-trace &lt;path-to-trace.zip&gt;</span> in the <span class="code">test-results</span> folder.</p>
    </section>

    <section class="footer">
      This summary reflects the latest execution. Re-run <span class="code">npm test</span> to update.
    </section>
  </main>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function main() {
  const results = readJsonSafe(RESULTS_PATH);
  if (!results) {
    // Write minimal report when no JSON exists yet
    const html = renderHTML({ total: 0, passed: 0, failed: 0, skipped: 0, failures: [] });
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, html, 'utf8');
    console.log(`[report] No JSON found, wrote empty summary to ${OUTPUT_PATH}`);
    return;
  }
  const summary = summarize(results);
  const html = renderHTML(summary);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, html, 'utf8');
  console.log(`[report] Summary updated: total=${summary.total} passed=${summary.passed} failed=${summary.failed} skipped=${summary.skipped}`);
}

main();
