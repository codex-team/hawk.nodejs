'use strict';

var hawkCatcher = require('../../src/hawk')({
    accessToken: '69d86244-f792-47ad-8e9a-23fee358e062',
    url: 'http://localhost:3000/catcher/nodejs'
});

try {
    throw new Exception('');
} catch (e) {
    hawkCatcher.catchExceptionCallback(e, {comment: 'Exception in general module'}, function (error, response, body) {
        console.log('Response: ', body);
    });
}