'use strict';

const hawkCatcher = require('../dist').default;

const catcher = new hawkCatcher({
  accessToken: '69d86244-f792-47ad-8e9a-23fee358e062',
  collectorEndpoint: 'https://localhost:3000/'
});

conosle.log(catcher);

throw new Exception('');
