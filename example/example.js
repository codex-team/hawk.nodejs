/**
 * Require Hawk Catcher module
 *
 * @example initialize a catcher by creating a new class:
 * const hawk = new HawkCatcher({
 *   token: 'eyJh...Psc',
 * });
 *
 * @example for manual catching errors and exceptions
 *          use catch() public method:
 * try {
 *   throw new Error('Cannot do smth');
 * } catch (err) {
 *   hawk.catch(err);
 * }
 */
const HawkCatcher = require('../build/index').default;

/**
 * Initialize Hawk catcher
 */
const hawk = new HawkCatcher({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1ZWQ1MDY0OWE3OTYyNDAwMjMzZjI2MzQiLCJpYXQiOjE1OTEwMTkwODF9.mD1JI5y9f4QMU_UxYozGMA7-Vl2iJ0kbMf7tPPjVPsc',
  collectorEndpoint: 'http://localhost:3000/'
});

/**
 * Error: Hawk NodeJS Catcher test message
 */
try {
  throw new Error('Hawk NodeJS Catcher test message');
} catch (e) {
  hawk.catch(e);
}

/**
 * ReferenceError: qwe is not defined
 */
try {
  qwe();
} catch (e) {
  hawk.catch(e);
}

/**
 * Catching a reject
 */
try {
  Promise.reject();
} catch (e) {
  hawk.catch(e);
}

