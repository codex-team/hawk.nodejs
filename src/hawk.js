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
   * @param error – Error object
   * @param {string} custom.comment – custom comment
   *
   * @returns data prepared for the API endpoint
   */
  let prepare = function (error, custom={}) {
    let data = {
      token: accessToken,
      message: error.name + ': ' + error.message,
      type: error.name,
      tag: 'fatal',
      stack: error.stack,
      time: new Date().toISOString(),

      // custom params
      comment: custom.comment || ''
    };

    return data;
  };

  /**
   *Prepare error data for sending and send the to the Hawk Catcher API
   *
   * @param errorText – Node.js Error object
   * @param {string} custom.comment – custom comment
   */
  let catchExceptionCallback = function (errorText, custom, callback) {
    request.post({
      url: url,
      form: prepare(errorText, custom)
    }, callback);
  };

  /**
   * Prepare error data for sending and send the to the Hawk Catcher API
   *
   * @param errorObject – Node.js Error object
   * @param {string} custom.comment – custom comment
   *
   * @returns Promise
   */
  let catchExceptionPromise = function (errorObject, custom) {
    return new Promise(function (resolve, reject) {
      request.post({
        url: url,
        form: prepare(errorObject, custom)
      }, function (error, response, body) {
        try {
          if (response.statusCode != 200) {
            console.log('[HawkCatcher] Got status from Backend: ', response.statusCode);
            reject();
          } else {
            console.log('[HawkCatcher] Received: ', body);
            resolve();
          }
        } catch (err) {
          console.log('[HawkCatcher] Exception: ', err);
          reject();
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