var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    const axios = require('axios').default;
    const stackTrace = require('stack-trace');
    const LINES_BUFFER = 5;
    /**
     * Hawk NodeJS Catcher
     * Module for errors and exceptions tracking
     *
     * @copyright CodeX
     */
    class Catcher {
        /**
         * Catcher constructor
         *
         * @param {HawkInitialSettings|string} settings - If settings is a string, it means an Integration Token
         */
        constructor(settings) {
            /**
             * Catcher Type
             */
            this.type = 'errors/nodejs';
            if (typeof settings === 'string') {
                settings = {
                    token: settings,
                };
            }
            this.token = settings.token;
            this.collectorEndpoint = settings.collectorEndpoint || 'https://k1.hawk.so/';
            if (!this.token) {
                console.warn('Integration Token is missed. You can get it on https://hawk.so at Project Settings.');
                return;
            }
            /**
             * Set handlers
             */
            this.initGlobalHandlers();
        }
        initGlobalHandlers(callback) {
            const process = require('process');
            process.on('uncaughtException', (err) => {
                this.catchError(err);
            });
            process.on('unhandledRejection', (err) => {
                this.catchError(err);
            });
        }
        ;
        /**
         * Send test event from client
         */
        test() {
            const fakeEvent = new Error('Hawk NodeJS Catcher test message.');
            this.catchError(fakeEvent);
        }
        /**
         * This method prepares and sends an Error to Hawk
         * User can fire it manually on try-catch
         *
         * @param error - error to catch
         */
        catchError(error) {
            this.formatAndSend(error);
        }
        /**
         * Format and send an error
         *
         * @param error - error to send
         * @param {object} integrationAddons - addons spoiled by Integration
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatAndSend(error, integrationAddons) {
            const errorFormatted = {
                title: error.message,
                type: error.name,
                backtrace: this.composeBacktrace(error)
            };
            const eventFormatted = {
                token: this.token,
                catcherType: this.type,
                payload: errorFormatted
            };
            this.sendErrorFormatted(eventFormatted);
        }
        composeBacktrace(error) {
            const parsedStack = stackTrace.parse(error);
            console.log(parsedStack);
            let backtrace = [];
            parsedStack.forEach((frame) => {
                // console.log(frame);
                // console.log(frame.fileName);
                const isInternal = frame.native || (frame.fileName &&
                    !frame.fileName.startsWith('/') &&
                    !frame.fileName.startsWith('.') &&
                    frame.fileName.indexOf(':\\') !== 1);
                // console.log('isInterval', isInternal);
                if (!isInternal) {
                    const lines = require('fs').readFileSync(frame.fileName, 'utf-8')
                        .split('\n');
                    const actualLineNumber = frame.lineNumber - 1; // starts from 0;
                    const lineFrom = Math.max(0, actualLineNumber - LINES_BUFFER);
                    const lineTo = Math.min(lines.length - 1, actualLineNumber + LINES_BUFFER + 1);
                    const linesToCollect = lines.slice(lineFrom, lineTo);
                    const sourceCode = linesToCollect.map((content, index) => {
                        return {
                            line: lineFrom + index + 1,
                            content,
                        };
                    });
                    console.log(sourceCode);
                    backtrace.push({
                        file: frame.fileName,
                        line: frame.lineNumber,
                        column: frame.columnNumber,
                        sourceCode: sourceCode,
                        function: frame.functionName
                    });
                }
            });
            console.log(backtrace);
            return backtrace;
        }
        /**
         * Sends formatted HawkEvent to the Collector
         *
         * @param {HawkEvent} eventFormatted - formatted event to send
         */
        sendErrorFormatted(eventFormatted) {
            return __awaiter(this, void 0, void 0, function* () {
                yield axios.post(this.collectorEndpoint, eventFormatted)
                    .then((response) => {
                    console.log(response.data);
                })
                    .catch(console.error);
            });
        }
    }
    exports.default = Catcher;
});
