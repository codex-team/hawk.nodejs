'use strict';

const request = require('request');
const publicIp = require('public-ip');

/**
 * Hawk Node.js catcher
 *
 */
let hawkCatcher = (function () {
  /**
   * URL          – API endpoint
   * AccessToken  – Token for project in hawk profile
   * ExternalIp   - External ip for sender field
   * @type {string}
   */
  let url = 'https://hawk.so/catcher/nodejs',
      accessToken = null,
      externalIp = null;

  /**
   * Initialize Hawk Catcher with config
   * @param {Object} config - configuration parameters
   * @param {string} config.url – Hawk API endpoint
   * @param {string} config.accessToken – Access Token for Hawk Service
   */
  let init = function (config) {
    accessToken = config.accessToken;
    url = config.url || url;
    externalIp = '127.0.0.1';
    publicIp.v4().then((ip) => {
      externalIp = ip;
    });
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
      sender: {
        ip: externalIp
      },
      catcher_type: 'errors/nodejs',
      payload: {
        message: error.name + ': ' + error.message,
        type: error.name,
        stack: error.stack,
        time: new Date().toISOString(),

        // custom params
        comment: custom.comment || ''
      }
    };

    return data;
  };

  /**
   * Prepare error data for sending and send the to the Hawk Catcher API
   *
   * @param {Object} errorObject – Node.js Error object
   * @param {string} [custom.comment] – custom error description
   * @param {function} [callback] – callback function
   */
  let catchException = function (errorObject, custom={}, callback) {
    request.post({
      url: url,
      body: prepare(errorObject, custom),
      json: true
    }, callback);
  };

  /**
   * Prepare error data for sending and send the to the Hawk Catcher API
   *
   * @param {Object} errorObject – Node.js Error object
   * @param {string} [custom.comment] – custom error description
   *
   * @returns Promise
   */
  let catchExceptionPromise = function (errorObject, custom={}) {
    return new Promise(function (resolve, reject) {
      request.post({
        url: url,
        body: prepare(errorObject, custom),
        json: true
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

  /**
   * Start intercepting Exceptions and send them to Hawk Catcher
   */
  let initGlobalCatcher = function (callback) {
    const process = require('process');

    process.on('uncaughtException', function (err) {
      hawkCatcher.catchException(err, {}, callback);
    });

    process.on('unhandledRejection', function (err) {
      hawkCatcher.catchException(err, {}, callback);
    });
  };

  return {
    init,
    initGlobalCatcher,
    catchException,
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