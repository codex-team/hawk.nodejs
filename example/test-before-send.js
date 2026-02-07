/**
 * Tests for beforeSend safety checks
 * Run: node example/test-before-send.js
 */
const HawkCatcher = require('../dist/cjs/src/index.js').default;

const HAWK_TOKEN = 'eyJpbnRlZ3JhdGlvbklkIjoiOTU3MmQyOWQtNWJhZS00YmYyLTkwN2MtZDk5ZDg5MGIwOTVmIiwic2VjcmV0IjoiZTExODFiZWItMjdlMS00ZDViLWEwZmEtZmUwYTM1Mzg5OWMyIn0=';

/**
 * Helper: re-init catcher with a specific beforeSend and fire an error
 */
function testCase(label, beforeSend) {
  console.log(`\n--- ${label} ---`);

  HawkCatcher.init({
    token: HAWK_TOKEN,
    disableGlobalErrorsHandling: true,
    beforeSend,
  });

  try {
    throw new Error(`Test: ${label}`);
  } catch (e) {
    HawkCatcher.send(e);
  }
}

/**
 * 1) beforeSend returns true — should warn "invalid payload", keep original
 */
testCase('beforeSend returns true', () => {
  return true;
});

/**
 * 2) beforeSend returns undefined (no return) — should keep original payload
 */
testCase('beforeSend returns undefined', (event) => {
  console.log('  beforeSend called, returning nothing');
});

/**
 * 3) beforeSend returns null — should drop event entirely
 */
testCase('beforeSend returns null', () => {
  return null;
});

/**
 * 4) beforeSend returns empty object — should warn "invalid payload", keep original
 */
testCase('beforeSend returns {}', () => {
  return {};
});

/**
 * 5) beforeSend mutates payload and deletes title — should warn "payload corrupted", drop event
 */
testCase('beforeSend deletes title', (event) => {
  delete event.title;
});

/**
 * 6) beforeSend returns valid modified payload — should accept
 */
testCase('beforeSend returns valid payload', (event) => {
  event.context = { filtered: true };

  return event;
});

console.log('\n--- All beforeSend tests done ---');
