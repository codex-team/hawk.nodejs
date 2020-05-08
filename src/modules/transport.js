import request from 'request';
/**
 * Custom transport class for sending errors
 *
 * @copyright CodeX
 */
export default class Transport {
    constructor(collectorEndpoint) {
        this.url = collectorEndpoint;
    }
    async send(event) {
        await request.post({
            url: this.url,
            body: event,
            json: true
        });
    }
}
//# sourceMappingURL=transport.js.map