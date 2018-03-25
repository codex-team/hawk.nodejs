'use strict';

let request = require("request");

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
  let url = "https://hawk.so/catcher/nodejs",
      accessToken = null;

  /**
   * Initialize Hawk Catcher with config
   * @param {url: String, accessToken: String} — configuration parameters
   */
  let init = function (config) {
    accessToken = config.accessToken;
    url = config.url || url;
  };

  /**
   * Convert error object to the format for Hawk catcher API
   *
   * @param error – Error object
   * @param custom {comment: String} – custom parameters
   *
   * @returns Object – hashmap with data prepared for the API endpoint
   */
  let prepare = function (error, custom={}) {

    let data = {
      token: accessToken,
      message: error.name + ": " + error.message,
      type: error.name,
      tag: "fatal",
      stack: error.stack,
      time: new Date().toISOString(),

      // custom params
      comment: custom.comment || ""
    };

    return data;
  };

  /**
   * Send data to Hawk Catcher API
   *
   * @param data – hashmap with data
   */
  let send = function (data) {

    request.post({
      url: url,
      form: data
    }, function (error, response, body) {

      try {

        if (response.statusCode != 200) {

          console.log("[HawkCatcher] Got status from Backend: ", response.statusCode);

        } else {

          console.log("[HawkCatcher] Received: ", body);

        }

      } catch (err) {

        console.log("[HawkCatcher] Exception: ", err);

      }

    });

  };

  /**
   * Prepare error data for sending and send the to the Hawk Catcher API
   *
   * @param error – Node.js Error object
   * @param custom {comment: String} – custom parameters
   */
  let catchException = function (error, custom) {

    send(prepare(error, custom))

  };

  /**
   * Prepare error data for sending and send the to the Hawk Catcher API
   *
   * @param error – Node.js Error object
   * @param custom {comment: String} – custom parameters
   *
   * @returns Promise
   */
  let catchExceptionPromise = function (error) {

    return new Promise(function(resolve, reject) {

      return resolve(send(prepare(error, custom)));

    });

  };

  return {
    init,
    catchException,
    catchExceptionPromise
  }

})();

/**
 * Initialize module with config if it is given. Return object otherwise.
 *
 * @param config – optional dictionary with {url: String, accessToken: String}
 */
module.exports = function (config) {

  if (typeof config.accessToken !== 'undefined') {

    hawkCatcher.init(config);

    return hawkCatcher;

  }

  return hawkCatcher;

};