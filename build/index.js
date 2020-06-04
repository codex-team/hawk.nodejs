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
    const fs = require('fs');
    /**
     * Default Collector's URL
     */
    const DEFAULT_EVENT_COLLECTOR_URL = 'https://k1.hawk.so/';
    /**
     * Number of file lines before and after errored line
     * to be read and send to Hawk for better event view
     */
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
            this.collectorEndpoint = settings.collectorEndpoint || DEFAULT_EVENT_COLLECTOR_URL;
            if (!this.token) {
                throw new Error('Integration Token is missed. You can get it on https://hawk.so at Project Settings.');
            }
            /**
             * Set handlers
             */
            this.initGlobalHandlers();
        }
        /**
         * Define own error handlers
         */
        initGlobalHandlers() {
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
            const fakeEvent = new Error('Hawk NodeJS Catcher test message');
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
        formatAndSend(error, integrationAddons) {
            const payloadFormatted = {
                title: error.message,
                type: error.name,
                backtrace: this.composeBacktrace(error)
            };
            const eventFormatted = {
                token: this.token,
                catcherType: this.type,
                payload: payloadFormatted
            };
            this.sendErrorFormatted(eventFormatted);
        }
        composeBacktrace(error) {
            const parsedStack = stackTrace.parse(error);
            stackTrace.get().forEach((site) => {
                console.log(site.getThis().getFileName());
            });
            let backtrace = [];
            parsedStack.forEach((frame) => {
                /**
                 * Check if a frame is an internal Node's call
                 */
                const isInternal = frame.native || (frame.fileName &&
                    !frame.fileName.startsWith('/') &&
                    !frame.fileName.startsWith('.') &&
                    frame.fileName.indexOf(':\\') !== 1);
                /** Create variable for sourceCode data */
                let sourceCode;
                if (isInternal) {
                    /**
                     * Do not find file for internal call frame
                     */
                    sourceCode = null;
                }
                else {
                    /**
                     * Read source file as array of lines
                     */
                    const lines = fs.readFileSync(frame.fileName, 'utf-8')
                        .split('\n');
                    /** Count line number in an array */
                    const actualLineNumber = frame.lineNumber - 1; // starts from 0;
                    /** Define line number to start copy code */
                    const lineFrom = Math.max(0, actualLineNumber - LINES_BUFFER);
                    /** Define line number to end copy code */
                    const lineTo = Math.min(lines.length - 1, actualLineNumber + LINES_BUFFER + 1);
                    /** Get buffer lines from files */
                    const linesToCollect = lines.slice(lineFrom, lineTo);
                    /** Compose code chunk of file */
                    sourceCode = linesToCollect.map((content, index) => {
                        return {
                            line: lineFrom + index + 1,
                            content,
                        };
                    });
                }
                /** Create a backtrace frame data */
                let backtraceFrame = {
                    file: frame.fileName,
                    line: frame.lineNumber,
                    column: frame.columnNumber,
                    function: frame.functionName
                };
                /** Add source code data if it is not empty */
                if (!!sourceCode) {
                    backtraceFrame.sourceCode = sourceCode;
                }
                /** Add frame to backtrace array */
                backtrace.push(backtraceFrame);
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
                return axios.post(this.collectorEndpoint, eventFormatted);
            });
        }
    }
    exports.default = Catcher;
});
