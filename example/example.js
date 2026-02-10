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
const HawkCatcher = require('../dist/cjs/src/index.js').default;

/**
 * Initialize Hawk catcher with breadcrumbs and beforeSend
 */
const HAWK_TOKEN = 'eyJpbnRlZ3JhdGlvbklkIjoiOTU3MmQyOWQtNWJhZS00YmYyLTkwN2MtZDk5ZDg5MGIwOTVmIiwic2VjcmV0IjoiZTExODFiZWItMjdlMS00ZDViLWEwZmEtZmUwYTM1Mzg5OWMyIn0=';

HawkCatcher.init({
  token: HAWK_TOKEN,
  breadcrumbs: {
    maxBreadcrumbs: 20,
    beforeBreadcrumb: (breadcrumb, hint) => {
      /**
       * Example: discard breadcrumbs with sensitive category
       */
      if (breadcrumb.category === 'secret') {
        return false;
      }

      return breadcrumb;
    },
  },
  beforeSend(event) {
    /**
     * Example: strip user name before sending
     */
    if (event.user && event.user.name) {
      delete event.user.name;
    }

    return event;
  },
});

/**
 * --- Breadcrumbs ---
 */

/**
 * Add some breadcrumbs before an error
 */
HawkCatcher.breadcrumbs.add({
  type: 'debug',
  category: 'startup',
  message: 'App initialized',
  level: 'info',
});

HawkCatcher.breadcrumbs.add({
  type: 'debug',
  category: 'db',
  message: 'Connected to database',
  level: 'info',
  data: { host: 'localhost', port: 5432 },
});

/**
 * This breadcrumb should be discarded by beforeBreadcrumb hook
 */
HawkCatcher.breadcrumbs.add({
  type: 'debug',
  category: 'secret',
  message: 'This should be filtered out',
  level: 'warning',
});

/**
 * Check breadcrumbs buffer (should have 2, not 3)
 */
const crumbs = HawkCatcher.breadcrumbs.get();

console.log(`Breadcrumbs count: ${crumbs.length} (expected 2)`);

/**
 * Error: Hawk NodeJS Catcher test message
 * This event will carry the 2 breadcrumbs above
 */
try {
  throw new Error('Hawk NodeJS Catcher test message');
} catch (e) {
  HawkCatcher.send(e);
}

/**
 * Clear breadcrumbs after handling the error
 */
HawkCatcher.breadcrumbs.clear();
console.log(`Breadcrumbs after clear: ${HawkCatcher.breadcrumbs.get().length} (expected 0)`);

/**
 * --- Basic error catching ---
 */

/**
 * ReferenceError: qwe is not defined
 */
try {
  qwe();
} catch (e) {
  HawkCatcher.send(e);
}

/**
 * Catching promise rejections manually (try-catch does NOT catch async rejections — use .catch())
 */
Promise.reject(Error('Sample error')).catch((e) => {
  HawkCatcher.send(e);
});

/**
 * These unhandled rejections are caught automatically by the global unhandledRejection handler
 */
Promise.reject(Error('Unhandled sample error'));

Promise.reject('Unhandled error message passed as string');

require('./sub-example');
