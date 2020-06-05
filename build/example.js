(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Example {
        static error() {
            /**
             * Create and throw a fake error
             * @type {Error}
             */
            throw new Error(`Hawk NodeJS Catcher test message (${this.getRandText(5)})`);
        }
        static promiseReject() {
            return Promise.reject('test');
        }
        /**
         * Simple word generator for random error identifiers
         * @param {number} length
         * @returns {string}
         */
        static getRandText(length = 6) {
            return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);
        }
    }
    exports.default = Example;
});
