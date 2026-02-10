const HawkCatcher = require('../dist/cjs/src/index.js').default;

try {
  undefindedFunction();
} catch (e) {
  HawkCatcher.send(e);
}
