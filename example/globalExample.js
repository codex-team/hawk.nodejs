'use strict';

const process = require('process');

var hawkCatcher = require('@codexteam/hawk.nodejs')({
  accessToken: '69d86244-f792-47ad-8e9a-23fee358e062'
});


// Intercept global Exceptions
process.on('uncaughtException', function (err) {
  hawkCatcher.catchException(err);
});

process.on('unhandledRejection', function (err) {
  hawkCatcher.catchException(err);
});

// or you can simply call with or without optional callback as argument
// hawkCatcher.initGlobalCatcher();

// Try to execute undefined method to illustrate an Exception
UndefinedMethod();