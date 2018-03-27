'use strict';

var hawkCatcher = require('@codexteam/hawk.nodejs')({
  accessToken: '69d86244-f792-47ad-8e9a-23fee358e062'
});

try {
  throw new Exception('');
} catch (e) {
  hawkCatcher.catchException(e, {comment: 'Exception in general module'});
}