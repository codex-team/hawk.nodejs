'use strict';

let request = require('request');

/**
 * Hawk Node.js catcher
 *
 */
let hawkCatcher = (function () {
  /**
   * URL          – API endpoint
   * AccessToken  – Token for project in hawk profile
   * @type {string}
   */
  let url = 'https://hawk.so/catcher/nodejs',
      accessToken = null;

  /**
   * Initialize Hawk Catcher with config
   * @param {Object} config - configuration parameters
   * @param {string} config.url – Hawk API endpoint
   * @param {string} config.accessToken – Access Token for Hawk Service
   */
  let init = function (config) {
    accessToken = config.accessToken;
    url = config.url || url;
  };

  /**
   * Convert error object to the format for Hawk catcher API
   *
   * @param {Object} error – Error object
   * @param {string} custom.comment – custom comment
   *
   * @returns data prepared for the API endpoint
   */
  let prepare = function (error, custom={}) {
    let data = {
      token: accessToken,
      message: error.name + ': ' + error.message,
      type: error.name,
      stack: error.stack,
      time: new Date().toISOString(),

      // custom params
      comment: custom.comment || ''
    };

    return data;
  };

  /**
   * Prepare error data for sending and send the to the Hawk Catcher API
   *
   * @param {Object} errorObject – Node.js Error object
   * @param {string=} custom.comment – custom error description
   * @param {function=} callback – callback function
   */
  let catchException = function (errorObject, custom={}, callback) {
    request.post({
      url: url,
      form: prepare(errorObject, custom)
    }, callback);
  };

  /**
   * Prepare error data for sending and send the to the Hawk Catcher API
   *
   * @param {Object} errorObject – Node.js Error object
   * @param {string=} custom.comment – custom error description
   *
   * @returns Promise
   */
  let catchExceptionPromise = function (errorObject, custom={}) {
    return new Promise(function (resolve, reject) {
      request.post({
        url: url,
        form: prepare(errorObject, custom)
      }, function (error, response, body) {
        try {
          if (response.statusCode != 200) {
            reject('[HawkCatcher] Got status from Backend: ' + response.statusCode);
          } else {
            resolve('[HawkCatcher] Received: ' + body);
          }
        } catch (err) {
          reject('[HawkCatcher] Exception: ' + err);
        }
      });
    });
  };

  return {
    init,
    catchExceptionCallback,
    catchExceptionPromise
  };
})();

/**
 * Initialize module with config if it is given. Return object otherwise.
 *
 * @param {Object} config - configuration paramenters
 * @param {string} config.url – Hawk API endpoint
 * @param {string} config.accessToken – Access Token for Hawk Service
 */
module.exports = function (config) {
  if (typeof config.accessToken !== 'undefined') {
    hawkCatcher.init(config);

    return hawkCatcher;
  }

  return hawkCatcher;
};