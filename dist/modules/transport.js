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
const request_1 = require("request");
/**
 * Custom transport class for sending errors
 *
 * @copyright CodeX
 */
class Transport {
    /**
     *
     * @param collectorEndpoint
     */
    constructor(collectorEndpoint) {
        this.url = collectorEndpoint;
    }
    /**
     *
     * @param event
     */
    send(event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(request_1.default);
            yield request_1.default.post({
                url: this.url,
                body: event,
                json: true,
            });
        });
    }
}
exports.default = Transport;
