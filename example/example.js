const Catcher = require("../build/index").default;

const hawk = new Catcher({
  //token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1ZWQ2NTViMTMyNWE5MjAwMjIxMTMwMTMiLCJpYXQiOjE1OTExMDQ5NDV9.smjp3W_nAodFISM5ue1UVRFjVhyUsaIaHvi-B3WF5q0',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1ZWQ1MDY0OWE3OTYyNDAwMjMzZjI2MzQiLCJpYXQiOjE1OTEwMTkwODF9.mD1JI5y9f4QMU_UxYozGMA7-Vl2iJ0kbMf7tPPjVPsc',
  collectorEndpoint: 'http://localhost:3000/'
});

//throw new Error('WHAT THE HECK');

const getRandText = function (length = 6) {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);
}

require('./test/first-sub-file');
// i = 2 / 0;

// window[getRandText()]();

djlfkldjfkjsdkf();

const fakeEvent = new Error(`Hawk NodeJS Catcher test message (${getRandText(5)})`);

// hawk.catchError(fakeEvent);


throw fakeEvent;
