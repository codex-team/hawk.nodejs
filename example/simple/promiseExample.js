'use strict';

var hawkCatcher = require('../../src/hawk')({
    accessToken: '69d86244-f792-47ad-8e9a-23fee358e062',
    url: 'http://localhost:3000/catcher/nodejs'
});

try {
    throw new Exception('');
} catch (e) {
    hawkCatcher.catchExceptionPromise(e, {comment: 'Exception in general module'})
        .then(function () {
            console.log('Exception successfully sent to Hawk');
        })
        .catch(function (err) {
            console.log('Error occured: ', err);
        });
}

