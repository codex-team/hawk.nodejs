const HawkCatcher = require('../dist/index').default;

try {
  undefindedFunction();
} catch (e) {
  HawkCatcher.send(e);
}
