'use strict';

const HawkCatcher = require('../dist/index').default;

const catcher = new HawkCatcher({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1ZWIxYzIwNzUyZWQ2ZDAwNjczNmU0MDUiLCJpYXQiOjE1ODg3MDc4NDd9.KHwEsmpMrxQGyvQqkQWv1tsTmookntyEsFsk5f2LZkU',
  collectorEndpoint: 'http://localhost:3000/',
});

UndefinedMethod();
