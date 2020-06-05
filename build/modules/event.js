var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./backtrace"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const backtrace_1 = __importDefault(require("./backtrace"));
    /**
     * Helper for getting error data
     */
    class ErrorEvent {
        /**
         * Initialize a class
         *
         * @param {Error} err — error event to be processed
         */
        constructor(err) {
            this.err = err;
        }
        /**
         * Return event title
         *
         * @returns {string}
         */
        getTitle() {
            /**
             * Built-it wrapper for error title string
             * `${error.type}: ${error.message}`
             */
            if (this.err && this.err.toString) {
                return this.err.toString();
            }
            return '<unknown>';
        }
        /**
         * Return event type
         *
         * @returns {string}
         */
        getType() {
            if (this.err && this.err.name) {
                return this.err.name;
            }
            return '<UnknownType>';
        }
        /**
         * Return event's backtrace
         *
         * @returns {BacktraceFrame[]}
         */
        getBacktrace() {
            const backtrace = new backtrace_1.default(this.err);
            return backtrace.getBacktrace();
        }
    }
    exports.default = ErrorEvent;
});
