'use strict';

var hawkCatcher = require('@codexteam/hawk.nodejs')({
  accessToken: '69d86244-f792-47ad-8e9a-23fee358e062'
});

// init global Exception Catcher
hawkCatcher.initGlobalCatcher();

// Try to execute undefined method to illustrate an Exception
UndefinedMethod();