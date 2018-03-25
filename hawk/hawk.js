'use strict';

let requestPromise = require("request-promise");
let request = require("request");
let requestErrors = require('request-promise/errors');

let hawkCatcher = (function () {

  let url = "http://localhost:3000/catcher/nodejs",
      accessToken = null;

  let init = function (config) {
    accessToken = config.accessToken;
    url = config.url || url;
  };

  let prepare = function (error, custom={}) {

    let data = {
      token: accessToken,
      message: error.name + ": " + error.message,
      type: error.name,
      tag: 'notice',
      stack: error.stack,
      time: new Date().toISOString(),
      // custom params
      comment: custom.comment || ""
    };

    return data;
  };

  let send = function (data) {

    request.post({
      url: url,
      form: data
    }, function (error, response, body) {

      try {

        if (response.statusCode != 200) {

          console.log("Backend return status: ", response.statusCode);

        } else {

          console.log("Received: ", body);

        }

      } catch (err) {

        console.log("Hawk exception: ", err);

      }

    });

  };

  let sendPromise = function (resolve, reject, options) {

    requestPromise(options)
      .then(function (parsedBody) {

        console.log("Received: ", parsedBody);
        resolve();

      })
      .catch(requestErrors.StatusCodeError, function (reason) {

        console.log("Backend return status: ", reason.statusCode);
        reject();

      })
      .catch(function (err) {

        console.log("Hawk exception: ", err);
        reject();

      });

  };

  let catchException = function (error, custom) {

    send(prepare(error, custom))

  };

  let catchExceptionPromise = function (error) {

    return new Promise(function(resolve, reject) {

      return sendPromise(resolve, reject, prepare(error, custom));

    });

  };

  return {
    init,
    catchException,
    catchExceptionPromise
  }

})();

module.exports = function (config) {

  if (typeof config.accessToken !== 'undefined') {

    hawkCatcher.init(config);

    return hawkCatcher;

  }

  return hawkCatcher;

};