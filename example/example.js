const Catcher = require("../build/index").default;

/**
 * Initialize Hawk catcher
 */
const hawk = new Catcher({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1ZWQ1MDY0OWE3OTYyNDAwMjMzZjI2MzQiLCJpYXQiOjE1OTEwMTkwODF9.mD1JI5y9f4QMU_UxYozGMA7-Vl2iJ0kbMf7tPPjVPsc',
  collectorEndpoint: 'http://localhost:3000/'
});

/**
 * Simple word generator for random error identifiers
 * @param {number} length
 * @return {string}
 */
const getRandText = function (length = 6) {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);
}

/**
 * Create a fake error
 * @type {Error}
 */
const fakeEvent = new Error(`Hawk NodeJS Catcher test message (${getRandText(5)})`);

/**
 * Throw an error
 */
throw fakeEvent;
