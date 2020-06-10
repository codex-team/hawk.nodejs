/**
 * Require Hawk Catcher module
 *
 * @example require module
 * const HawkCatcher = require('@hawk.so/nodejs').default;
 *
 * @example initialize a catcher:
 * HawkCatcher.init({
 *   token: 'eyJh...Psc',
 * });
 *
 * @example use catch() for manual catching errors and exceptions
 * try {
 *   throw new Error('Cannot do smth');
 * } catch (err) {
 *   HawkCatcher.catch(err);
 * }
 */
const HawkCatcher = require('../build/index').default;

/**
 * Initialize Hawk catcher
 */
const HAWK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1ZWQ1MDY0OWE3OTYyNDAwMjMzZjI2MzQiLCJpYXQiOjE1OTEwMTkwODF9.mD1JI5y9f4QMU_UxYozGMA7-Vl2iJ0kbMf7tPPjVPsc';

HawkCatcher.init(HAWK_TOKEN);

/**
 * Error: Hawk NodeJS Catcher test message
 */
try {
  throw new Error('Hawk NodeJS Catcher test message');
} catch (e) {
  HawkCatcher.catch(e);
}

/**
 * ReferenceError: qwe is not defined
 */
try {
  qwe();
} catch (e) {
  HawkCatcher.catch(e);
}

/**
 * Catching a reject
 */
try {
  Promise.reject();
} catch (e) {
  HawkCatcher.catch(e);
}

require('./sub-example');
