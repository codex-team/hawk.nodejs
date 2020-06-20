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
 * @example use send() for manual catching errors and exceptions
 * try {
 *   throw new Error('Cannot do smth');
 * } catch (err) {
 *   HawkCatcher.send(err);
 * }
 */
const HawkCatcher = require('../dist/index').default;

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
  HawkCatcher.send(e);
}

/**
 * ReferenceError: qwe is not defined
 */
try {
  qwe();
} catch (e) {
  HawkCatcher.send(e);
}

/**
 * Catching a rejects
 */
try {
  /**
   * Manual handled reject
   */
  Promise.reject(Error('Sample error'));
} catch (e) {
  HawkCatcher.send(e);
}

Promise.reject(Error('Unhandled sample error'));

Promise.reject('Unhandled error message passed as string');

require('./sub-example');
