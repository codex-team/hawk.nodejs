"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const transport_1 = require("./modules/transport");
/**
 * Hawk Node.js Catcher
 * Module for errors and exceptions tracking
 *
 * @copyright CodeX
 */
class Catcher {
    /**
     * Catcher constructor
     *
     * @param settings - if settings is a string, it means an Integration Token
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
        this.release = settings.release;
        /**
         * Init transport
         */
        this.transport = new transport_1.default(settings.collectorEndpoint || 'https://k1.hawk.so/');
        /**
         * Set handlers
         */
        this.initGlobalHandlers();
    }
    /**
     * Init global errors handler
     */
    initGlobalHandlers() {
        process.on('uncaughtException', (event) => {
            this.handleEvent(event);
        });
        process.on('unhandledRejection', (event) => {
            this.handleEvent(event);
        });
    }
    /**
     * Event handler
     *
     * @param event - handled error
     */
    handleEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.formatAndSend(event);
        });
    }
    /**
     * Formatting error and send it to collector
     *
     * @param error - error for sending
     */
    formatAndSend(error) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedEvent = this.prepareErrorFormatted(error);
            yield this.transport.send(preparedEvent);
        });
    }
    /**
     * Prepare error to hawk event format
     *
     * @param error - error for preparing
     */
    prepareErrorFormatted(error) {
        return {
            catcherType: this.type,
            payload: {
                title: error.message,
                type: error.name,
                backtrace: error.stack,
            },
            token: this.token,
        };
    }
}
exports.default = Catcher;
