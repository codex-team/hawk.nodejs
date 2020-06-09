var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./modules/event"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const event_1 = __importDefault(require("./modules/event"));
    const axios = require('axios').default;
    /**
     * Default Collector's URL
     */
    const DEFAULT_EVENT_COLLECTOR_URL = 'https://k1.hawk.so/';
    /**
     * Hawk NodeJS Catcher
     * Module for errors and exceptions tracking
     *
     * @copyright CodeX
     */
    class HawkCatcher {
        /**
         * Catcher constructor
         *
         * @param {HawkNodeJSInitialSettings|string} settings - If settings is a string, it means an Integration Token
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
         * Send test event from client
         */
        test() {
            /**
             * Create a dummy error event
             * Error: Hawk NodeJS Catcher test message
             */
            const fakeEvent = new Error('Hawk NodeJS Catcher test message');
            /**
             * Catch it and send to Hawk
             */
            this.catch(fakeEvent);
        }
        /**
         * This method prepares and sends an Error to Hawk
         * User can fire it manually on try-catch
         *
         * @param error - error to catch
         */
        catch(error) {
            /**
             * Compose and send a request to Hawk
             */
            this.formatAndSend(error);
        }
        /**
         * Define own error handlers
         */
        initGlobalHandlers() {
            /**
             * Catch unhandled exceptions
             */
            global.process.on('uncaughtException', (err) => {
                /**
                 * Show error data in console
                 */
                console.error(err);
                /**
                 * Process error catching
                 */
                this.catch(err);
            });
            /**
             * Catch unhandled rejections
             */
            global.process.on('unhandledRejection', (err) => {
                console.error('Error occurred without a catch block inside the asynchronous function, or because a promise was rejected that was not processed using .catch().\nPromise rejected due to:', err);
            });
        }
        ;
        /**
         * Format and send an error
         *
         * @param {Error} err - error to send
         */
        formatAndSend(err) {
            const eventPayload = new event_1.default(err);
            this.sendErrorFormatted({
                token: this.token,
                catcherType: this.type,
                payload: {
                    title: eventPayload.getTitle(),
                    type: eventPayload.getType(),
                    backtrace: eventPayload.getBacktrace(),
                },
            });
        }
        /**
         * Sends formatted HawkEvent to the Collector
         *
         * @param {HawkEvent} eventFormatted - formatted event to send
         */
        sendErrorFormatted(eventFormatted) {
            return __awaiter(this, void 0, void 0, function* () {
                return axios.post(this.collectorEndpoint, eventFormatted)
                    .then(
                /** Well done, do nothing */
                )
                    .catch((err) => {
                    console.error(`[Hawk] Cannot send an event because of ${err.toString()}`);
                });
            });
        }
    }
    exports.default = HawkCatcher;
});
