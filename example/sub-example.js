const HawkCatcherInstance = require('../build/index').default.getInstance();

try {
  undefindedFunction();
} catch (e) {
  HawkCatcherInstance.catch(e);
}
