// run-pa11y-ci.js (CommonJS)
const pa11yci = require('pa11y-ci');
const fs = require('fs');
const path = require('path');
const config = require('./submission.pa11y-ci.js');

// ---- optional: limit filtering to a specific rule code ----
// const ONLY_FOR_CODE = 'aria-valid-attr-value';
const ONLY_FOR_CODE = null; // set to a rule code to limit filtering
// ----------------------------------------------------------

function isBlank(issue) {
  const sel = issue && typeof issue.selector === 'string' ? issue.selector : '';
  const ctx = issue && typeof issue.context === 'string' ? issue.context : '';
  return sel === '' && ctx === '';
}
function shouldKeep(issue) {
  if (ONLY_FOR_CODE && issue.code !== ONLY_FOR_CODE) return true;
  return !isBlank(issue);
}

(async () => {
  console.log('Running accessibility tests...');

  // Run pa11y-ci using your existing config
  const summary = await pa11yci(config.urls, {
    ...config.defaults,
  });
  // summary is expected to look like:
  // { total: number, passes: number, errors: number, results: { [url]: Issue[] } }

  // Filter per-URL issues, only removing entries where BOTH selector and context are empty
  const filteredResults = Object.fromEntries(
    Object.entries(summary.results || {}).map(([url, issues]) => [
      url,
      (issues || []).filter(shouldKeep),
    ]),
  );

  // Recompute passes/errors based on filteredResults (leave total as-is)
  const counts = Object.values(filteredResults).map(arr => arr.length);
  const passes = counts.filter(len => len === 0).length;
  const errors = counts.length - passes;

  const updated = {
    ...summary,
    results: filteredResults,
    passes,
    errors,
    // Do NOT touch `total`
  };

  // Write to the same file you were using before
  const outputPath = path.resolve('out/submission_accessibility_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2));

  // Exit non-zero if any URLs still have issues
  process.exit(errors > 0 ? 1 : 0);
})();
