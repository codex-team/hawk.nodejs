const HawkCatcher = require('../build/index').default;

try {
  undefindedFunction();
} catch (e) {
  HawkCatcher.catch(e);
}
